# SYSTEM & GRAPHICS ENGINE ARCHITECTURE
# ScreenCraft Pro: Zero-Lag Compositing & GPU Acceleration Pipeline

**Document Version:** 2.0.0  
**Target:** High-Performance WebGPU / WebGL2 & Native Rust Engine  
**Key Design Goal:** Real-time 60fps 4K Preview, Sub-30s Export, Zero Frame Drops, Zero Audio Desync

---

## 1. System Topology & Component Map

```
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
|                                    SCREENCRAFT PRO TOPOLOGY MAP                                         |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
|                                                                                                         |
|  [ APPLICATION SHELL & PRESENTATION LAYER ] (React 19 + TypeScript + Tailwind v4 + Framer Motion)       |
|  ├── Apple HIG Obsidian Shell                                                                           |
|  ├── Reactive State Store (Zustand + Temporal History for Undo/Redo)                                     |
|  ├── Multi-Track Timeline Controller (Zoom, Video, Captions, Audio Tracks)                              |
|  └── Floating Glass Inspector & Control HUDs                                                            |
|                                                                                                         |
+───────────────────────────────────────────────────┬─────────────────────────────────────────────────────+
                                                    │
                   ┌────────────────────────────────┴────────────────────────────────┐
                   ▼                                                                 ▼
+──────────────────────────────────────────────+   +──────────────────────────────────────────────────────+
| [ WEB RUNTIME (PWA / Browser) ]              |   | [ DESKTOP RUNTIME (macOS & Windows via Tauri 2.0) ]  |
| • Capture: `getDisplayMedia()` + Pointer     |   | • Capture: macOS `ScreenCaptureKit` / Windows `DXGI` |
| • Decoder: WebCodecs `VideoDecoder` (60fps)  |   | • Decoder: Hardware AVFoundation / Direct3D 11       |
| • Audio  : Web Audio API + AudioWorklet      |   | • Audio  : CoreAudio / WASAPI + Rodio Engine         |
| • Subtitles: Whisper Wasm (ONNX / Web SIMD)  |   | • Subtitles: Whisper.cpp (Metal / CUDA native)       |
| • Storage: File System Access API (OPFS)     |   | • Storage: Native Local Filesystem (`.screencraft`)  |
+──────────────────────────────────────────────+   +──────────────────────────────────────────────────────+
                   │                                                                 │
                   └────────────────────────────────┬────────────────────────────────┘
                                                    ▼
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
| [ CORE REAL-TIME GPU COMPOSITING ENGINE ] (WebGPU / WebGL2 Unified Shaders)                             |
| ├── Texture Ingestion: Zero-copy upload from Video Frame / Hardware Surface                             |
| ├── Camera Math: Damped Spring Physics Matrix (Pan Tx, Ty; Scale S; 3D Pitch/Yaw/Roll)                  |
| ├── Cursor Engine: Catmull-Rom Spline Interpolation + High-DPI Vector Overlay + Click Shockwaves        |
| ├── Frame Mockup Engine: macOS Sequoia Window Chrome, Safari/Arc Glass Bar, Squircle Clipping Mask      |
| ├── Background Shaders: 4-Color Animated Mesh Gradient Generator + Gaussian Contact Shadow Shaders      |
| └── PTS Sync Master Clock: Hardware-locked frame presentation via `requestVideoFrameCallback`          |
+───────────────────────────────────────────────────┬─────────────────────────────────────────────────────+
                                                    │
                                                    ▼
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
| [ MASTER EXPORT & HARDWARE ENCODING SUBSYSTEM ]                                                         |
| ├── Web Target: GPU Texture -> `VideoFrame` -> WebCodecs `VideoEncoder` -> `mp4-muxer` (>120 fps)       |
| └── Desktop Target: Apple VideoToolbox (ProRes / HEVC / H.264) / NVENC Hardware Muxer                   |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. The PTS Master Clock Engine: Eliminating Preview Freezes

In legacy tools like OpenScreen, audio and video run on disjointed browser timers. When the canvas drops a frame during a 3D zoom, the video desynchronizes, eventually freezing while the audio continues playing alone.

ScreenCraft Pro enforces a **Master Clock Architecture**:

```
                                  [ Web Audio AudioContext ]
                                  (Hardware Master Clock)
                                             │
                                             ▼
                              +──────────────────────────────+
                              | AudioContext.currentTime     |
                              +──────────────────────────────+
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
         [ Video Frame Controller ]                    [ Compositor Render Loop ]
  • Intercepts `requestVideoFrameCallback`      • Evaluates camera spring math at target PTS
  • Calculates drift: Δ = t_video - t_audio     • Composites mesh, 3D tilt, cursor, captions
  • Hard-syncs if drift > 40ms (>2 frames)      • Renders to canvas at steady 60 FPS
```

### High-Precision Sync Implementation:
```typescript
export class MasterClockEngine {
  private audioContext: AudioContext;
  private videoEl: HTMLVideoElement;
  private isPlaying: boolean = false;

  constructor(videoElement: HTMLVideoElement, audioContext: AudioContext) {
    this.videoEl = videoElement;
    this.audioContext = audioContext;
  }

  public tick(now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata): number {
    if (!this.isPlaying) return this.videoEl.currentTime;

    const masterAudioTime = this.audioContext.currentTime;
    const currentVideoTime = metadata.mediaTime;
    const drift = currentVideoTime - masterAudioTime;

    // Correct drift seamlessly
    if (Math.abs(drift) > 0.04) { // Exceeds 40ms (2 frames at 60fps)
      this.videoEl.currentTime = masterAudioTime;
      return masterAudioTime;
    }

    return currentVideoTime;
  }
}
```

---

## 3. Mathematical Foundations: Camera Spring & Cursor Smoothing

### 3.1 Damped Harmonic Spring Physics for Camera Zoom
Screen Studio’s signature smooth glide is produced by a 2nd-order differential spring equation:

$$m \frac{d^2 x}{dt^2} + c \frac{dx}{dt} + k (x - x_{\text{target}}) = 0$$

Where:
* $k = 180.0$ (Stiffness / Tension)
* $c = 24.0$ (Damping ratio preventing oscillation)
* $m = 1.0$ (Mass)

```typescript
export class SpringCameraState {
  public currentX = 0;
  public currentY = 0;
  public currentZoom = 1.0;
  private vx = 0;
  private vy = 0;
  private vz = 0;

  update(targetX: number, targetY: number, targetZoom: number, dt: number) {
    const k = 180.0;
    const c = 24.0;

    // X-Axis Spring
    const fx = -k * (this.currentX - targetX) - c * this.vx;
    this.vx += fx * dt;
    this.currentX += this.vx * dt;

    // Y-Axis Spring
    const fy = -k * (this.currentY - targetY) - c * this.vy;
    this.vy += fy * dt;
    this.currentY += this.vy * dt;

    // Zoom Factor Spring
    const fz = -k * (this.currentZoom - targetZoom) - c * this.vz;
    this.vz += fz * dt;
    this.currentZoom += this.vz * dt;
  }
}
```

### 3.2 Centripetal Catmull-Rom Splines for Cursor Smoothing
Raw mouse coordinate streams from the OS contain high-frequency jitter. ScreenCraft Pro fits centripetal Catmull-Rom splines across points $P_0, P_1, P_2, P_3$:

$$C(t) = \frac{1}{2} \begin{bmatrix} 1 & t & t^2 & t^3 \end{bmatrix} \begin{bmatrix} 0 & 2 & 0 & 0 \\ -1 & 0 & 1 & 0 \\ 2 & -5 & 4 & -1 \\ -1 & 3 & -3 & 1 \end{bmatrix} \begin{bmatrix} P_0 \\ P_1 \\ P_2 \\ P_3 \end{bmatrix}$$

This produces continuous, curvature-smooth $C^1$ paths with zero sharp corner snapping.

---

## 4. WebGPU Shader Architecture (Zero-Copy Pipeline)

```
                    +-----------------------------------------+
                    | `GPUTexture` (Raw 4K Screen Frame)      |
                    +-----------------------------------------+
                                         │
                                         ▼
+─────────────────────────────────────────────────────────────────────────────────────────+
| PASS 1: Vertex Shader (3D Perspective Transformation)                                   |
| • Computes 4x4 MVP Matrix: P_proj * V_view * M_model                                    |
| • Handles Dynamic 3D Pitch (X-tilt) and Yaw (Y-rotation)                                |
+─────────────────────────────────────────────────────────────────────────────────────────+
                                         │
                                         ▼
+─────────────────────────────────────────────────────────────────────────────────────────+
| PASS 2: Fragment Shader (Studio Mesh + Contact Shadow + Screen Composite)               |
| • Evaluates Signed Distance Function (SDF) for Rounded Window Corners                   |
| • Computes 3-Layer Gaussian Shadow Falloff                                              |
| • Samples Video Texture with Bicubic Anti-Aliasing Filter                               |
| • Applies 1px Specular White Top Light Bleed                                            |
+─────────────────────────────────────────────────────────────────────────────────────────+
                                         │
                                         ▼
+─────────────────────────────────────────────────────────────────────────────────────────+
| PASS 3: Overlay Shader (Vector Cursor & Click Shockwaves)                               |
| • Blends High-DPI Vector Cursor Texture at Spline Coordinates                           |
| • Renders Radial Sine Wave Halo for Mouse Clicks                                        |
| • Renders MSDF (Multi-Channel Signed Distance Field) Text for Kinetic Subtitles         |
+─────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 5. Memory Management & Zero-Allocation Render Loop

To prevent garbage collection pauses during playback and 4K export:
1. **Pre-Allocated TypedArrays**: Uniform buffers and vertex coordinate buffers are allocated once on initialization and updated via `queue.writeBuffer()`.
2. **Zero Disk PNG Buffering**: WebCodecs `VideoEncoder` ingests `VideoFrame` objects directly from the GPU canvas texture without saving intermediary images.
3. **Array Buffer Recycling**: Audio analysis and waveform calculation reuse pooled `Float32Array` buffers.
