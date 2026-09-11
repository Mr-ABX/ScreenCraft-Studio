# TECHNICAL REQUIREMENTS DOCUMENT (TRD)
# ScreenCraft Pro: Engineering Contracts & Technical Specifications

**Document Version:** 2.0.0  
**Status:** Engineering Ready  
**Target Runtimes:** Web (Chromium / WebKit / Gecko) + Desktop (Tauri 2.0 Rust for macOS & Windows)

---

## 1. System Runtime & Compatibility Matrix

```
+-------------------------------------------------------------------------------------------------------------+
| LAYER               | WEB APP (PWA)                                | DESKTOP APP (TAURI 2.0 RUST)           |
+---------------------+----------------------------------------------+----------------------------------------+
| Operating Systems   | macOS, Windows, Linux, ChromeOS              | macOS 13+ (Ventura/Sonoma/Sequoia),    |
|                     | (Chrome 118+, Edge 118+, Safari 17.4+)       | Windows 10/11 (x64 & ARM64)            |
+---------------------+----------------------------------------------+----------------------------------------+
| Capture Engine      | `navigator.mediaDevices.getDisplayMedia()`   | macOS `ScreenCaptureKit`               |
|                     | `navigator.mediaDevices.getUserMedia()`      | Windows `Windows.Graphics.Capture`     |
+---------------------+----------------------------------------------+----------------------------------------+
| Graphics Compositor | WebGPU (Primary) with WebGL2 fallback        | Shared WebGPU / Native Metal / DX12    |
+---------------------+----------------------------------------------+----------------------------------------+
| Video Decoder       | W3C WebCodecs `VideoDecoder`                 | Hardware AVFoundation / Direct3D 11    |
+---------------------+----------------------------------------------+----------------------------------------+
| Video Encoder       | W3C WebCodecs `VideoEncoder` + `mp4-muxer`   | Apple VideoToolbox / NVENC Hardware    |
+---------------------+----------------------------------------------+----------------------------------------+
| Audio Worklet       | Web Audio `AudioWorkletNode` + `AudioContext`| CoreAudio / WASAPI + Rodio Rust Audio  |
+---------------------+----------------------------------------------+----------------------------------------+
| Speech AI Engine    | Whisper Tiny/Base Wasm (ONNX Web / Wasm SIMD)| Whisper.cpp (Metal & AVX2 Accelerated) |
+---------------------+----------------------------------------------+----------------------------------------+
| Project Storage     | IndexedDB + File System Access API (OPFS)    | Local native `.screencraft` directory  |
+-------------------------------------------------------------------------------------------------------------+
```

---

## 2. Low-Level Event Telemetry & Metadata Protocol

During recording, the capture thread logs a high-frequency, timestamped telemetry stream synchronized with the video frame timestamps:

```typescript
export interface MouseEventRecord {
  /** Timestamp in seconds relative to recording start (microsecond precision) */
  timestamp: number;
  /** Normalized X coordinate [0.0 - 1.0] across captured display bounds */
  x: number;
  /** Normalized Y coordinate [0.0 - 1.0] across captured display bounds */
  y: number;
  /** Primary button state: 0 = none, 1 = left, 2 = right, 3 = middle */
  button: number;
  /** Event classification */
  type: 'move' | 'down' | 'up' | 'click' | 'double_click' | 'drag' | 'scroll';
  /** Scroll delta if type === 'scroll' */
  scrollDelta?: { dx: number; dy: number };
  /** Modifier keys currently depressed */
  modifiers: { cmd: boolean; ctrl: boolean; alt: boolean; shift: boolean };
  /** System cursor shape detected by OS hook */
  cursorShape: 'arrow' | 'pointer' | 'text' | 'crosshair' | 'grab' | 'resize_ns' | 'resize_ew';
  /** Target application window bounding box in normalized space */
  activeWindowBounds?: { x: number; y: number; width: number; height: number };
}
```

---

## 3. WebGPU / WebGL2 Shader Pipeline Specification

The real-time preview and offline exporter execute identical shader pipelines on the GPU:

```
                  +----------------------------------------------+
                  |  TEXTURE 0: Raw Screen Video Frame (RGBA)    |
                  |  TEXTURE 1: Webcam Overlay Frame (RGBA)      |
                  |  TEXTURE 2: Vector Cursor Texture (RGBA)     |
                  +----------------------------------------------+
                                         │
                                         ▼
+----------------------------------------------------------------------------------+
| GPU VERTEX SHADER (3D Perspective Transformation)                                 |
| • Applies 4x4 Model-View-Projection (MVP) Matrix                                 |
| • Computes Camera Spring Pan (Tx, Ty) & Zoom Factor (S)                          |
| • Computes 3D Tilt Pitch (Rx), Yaw (Ry), and Roll (Rz)                           |
+----------------------------------------------------------------------------------+
                                         │
                                         ▼
+----------------------------------------------------------------------------------+
| GPU FRAGMENT SHADER PASS 1: Canvas Background & Ambient Lighting                 |
| • Dynamic animated mesh gradient (4-color bilinear interpolation)               |
| • Noise grain dither to eliminate color banding                                 |
+----------------------------------------------------------------------------------+
                                         │
                                         ▼
+----------------------------------------------------------------------------------+
| GPU FRAGMENT SHADER PASS 2: Multi-Layer Composite & Contact Shadows              |
| • 3-Tier Gaussian Drop Shadow (Contact shadow, Penumbra, Ambient occlusion)      |
| • Rounded Corner Box Mask (SDF with variable radius R)                           |
| • Specular Glass Border Light Bleed (1px top highlight)                          |
| • Bicubic Video Upscaling (Preserves razor-sharp typography during 3x zooms)     |
+----------------------------------------------------------------------------------+
                                         │
                                         ▼
+----------------------------------------------------------------------------------+
| GPU FRAGMENT SHADER PASS 3: Overlays, Cursor Splines & Kinetic Subtitles         |
| • Catmull-Rom smoothed cursor position overlay with velocity-aligned tilt        |
| • Click Shockwave Ripple Halo (Expanding radial sine wave)                       |
| • Kinetic Subtitle Text Card (MSDF Font Rendering)                               |
+----------------------------------------------------------------------------------+
                                         │
                                         ▼
                       [ DISPLAY VIEWPORT (Canvas) ] OR
                       [ WebCodecs / Hardware Video Encoder ]
```

---

## 4. Hardware Presentation Timestamp (PTS) Sync Contract

To resolve the preview freeze and audio-desync bugs found in OpenScreen:

```typescript
export interface PlaybackSyncContract {
  /**
   * Master clock reference driven by Web Audio hardware timeline.
   */
  readonly masterTime: number;

  /**
   * Register high-precision requestVideoFrameCallback hook.
   */
  attachVideoSync(
    videoElement: HTMLVideoElement,
    onFrameRender: (frameTime: number, videoFrame: VideoFrame | null) => void
  ): () => void;

  /**
   * Seek operation ensuring instantaneous frame grab without starvation.
   */
  seekAccurate(targetTimeSeconds: number): Promise<void>;
}
```

### Video-to-Audio Drift Correction Algorithm:
1. Every frame tick, evaluate:
   $$\Delta_{\text{drift}} = t_{\text{video\_actual}} - t_{\text{audio\_master}}$$
2. If $|\Delta_{\text{drift}}| \le 20\text{ms}$ (less than 1 frame at 60fps): **Smooth rate adjustment** ($\pm 2\%$ playbackRate pitch-free).
3. If $|\Delta_{\text{drift}}| > 40\text{ms}$ (drift exceeds 2 frames): **Hard seek video frame** to match master clock immediately, preventing freeze.

---

## 5. Tauri 2.0 Rust Native Backend API Contracts

For the desktop app, communication between the React UI layer and Rust native engine is handled via typed Tauri commands:

```rust
// Core Capture & Hardware Engine Commands
#[tauri::command]
async fn list_available_displays() -> Result<Vec<DisplayInfo>, String>;

#[tauri::command]
async fn list_available_audio_inputs() -> Result<Vec<AudioDevice>, String>;

#[tauri::command]
async fn start_native_recording(config: RecordingConfig) -> Result<RecordingSession, String>;

#[tauri::command]
async fn stop_native_recording() -> Result<RecordedMediaPackage, String>;

#[tauri::command]
async fn export_native_video(
    project_json: String,
    export_settings: ExportSettings,
    progress_channel: Channel<ExportProgress>
) -> Result<ExportResult, String>;

#[tauri::command]
async fn transcribe_audio_local_whisper(
    audio_wav_path: String,
    model_size: String
) -> Result<Vec<SubtitleSegment>, String>;
```

---

## 6. Export Pipeline Specifications

```
+---------------------------------------------------------------------------------------------------+
| PARAMETER           | STANDARD PRESET              | 4K PRO PRESET               | SOCIAL PRESET   |
+---------------------+------------------------------+-----------------------------+-----------------+
| Resolution          | 1920x1080 (16:9)             | 3840x2160 (16:9 UHD)        | 1080x1920 (9:16)|
| Frame Rate          | 60.0 FPS                     | 60.0 / 120.0 FPS            | 60.0 FPS        |
| Video Codec         | H.264 (AVC High @ L5.1)      | HEVC (H.265 Main 10) / ProRes| H.264 Baseline  |
| Bitrate (VBR)       | 12 Mbps (Peak 18 Mbps)       | 40 Mbps (Peak 60 Mbps)      | 15 Mbps         |
| Audio Codec         | AAC-LC Stereo @ 320 kbps     | AAC-LC Stereo / Uncompressed| AAC-LC @ 192 kbps|
| Color Space         | Rec.709 (sRGB Matrix)        | Display P3 / Rec.2020       | Rec.709         |
| Container Format    | FastStart MP4 (MooV atom at  | MP4 / QuickTime MOV / WebM  | MP4             |
|                     | file header for instant web) | (with Alpha channel)        |                 |
+---------------------------------------------------------------------------------------------------+
```

---

## 7. Error Handling & Fault Isolation Matrix

```
+---------------------------------------------------------------------------------------------------+
| FAULT SCENARIO                | DETECTION MECHANISM             | RECOVERY PROTOCOL               |
+-------------------------------+---------------------------------+---------------------------------+
| GPU Context Loss              | `webglcontextlost` / WebGPU     | Auto-recreate shader pipelines  |
| (Sleep/Wake / Driver Crash)   | `lost` device event             | and re-upload textures in <50ms |
+-------------------------------+---------------------------------+---------------------------------+
| Frame Buffer OOM              | V8 Heap allocation monitor      | Degrade preview canvas scaling  |
|                               | / Web Worker memory threshold   | to 1080p; keep export at 4K    |
+-------------------------------+---------------------------------+---------------------------------+
| Capture Permission Denied     | OS TCC / ScreenCaptureKit error | Trigger HIG permission modal    |
| (macOS Screen Recording)      | return code                     | with direct system settings link|
+-------------------------------+---------------------------------+---------------------------------+
| Video Codec Hardware Failure  | `VideoEncoder.onerror` callback | Fallback to WebAssembly OpenH264|
|                               |                                 | or software FFmpeg encoder      |
+---------------------------------------------------------------------------------------------------+
```
