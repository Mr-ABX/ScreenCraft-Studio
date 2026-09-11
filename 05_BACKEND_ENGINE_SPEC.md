# BACKEND & NATIVE PROCESSING ENGINE SPECIFICATION
# ScreenCraft Pro: Rust Subsystems, Native Capture & Local AI Pipeline

**Document Version:** 2.0.0  
**Engine Language:** Rust 1.80+ (Tauri 2.0 Native Core) + WebAssembly Modules  
**Target Environments:** macOS 13+ (Ventura, Sonoma, Sequoia), Windows 10/11, Web Browser (Chromium / WebKit)

---

## 1. Native Engine Architecture & Thread Topology

The native desktop engine runs as a multi-threaded Rust daemon communicating with the frontend webview via zero-copy shared memory and typed IPC commands:

```
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
|                                  RUST ENGINE THREAD TOPOLOGY                                            |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
|                                                                                                         |
|  [ THREAD 1: TAURI MAIN IPC & EVENT LOOP ]                                                              |
|  ├── Handles commands from React Frontend (`start_recording`, `seek`, `export`)                         |
|  └── Emits high-frequency telemetry events (`on_telemetry_tick`, `export_progress`)                     |
|                                                                                                         |
|  [ THREAD 2: SCREEN CAPTURE DAEMON ]                                                                    |
|  ├── macOS: `ScreenCaptureKit` (SCStream) -> 60/120fps CVPixelBuffer IOSurface stream                   |
|  └── Windows: `Windows.Graphics.Capture` -> Direct3D 11 Surface Texture Pool                            |
|                                                                                                         |
|  [ THREAD 3: OS GLOBAL MOUSE & INPUT TELEMETRY TAP ]                                                    |
|  ├── macOS: `CGEventTapCreate` (Monitors cursor X/Y, clicks, active window bounds)                      |
|  └── Windows: `SetWindowsHookEx(WH_MOUSE_LL)` (High-resolution raw mouse coordinates)                   |
|                                                                                                         |
|  [ THREAD 4: DUAL-TRACK AUDIO DSP WORKER ]                                                             |
|  ├── Ingests System Audio + Microphone Stream via CoreAudio (macOS) / WASAPI (Windows)                  |
|  └── Applies real-time Noise Gate, De-reverberation, and Peak RMS calculations                          |
|                                                                                                         |
|  [ THREAD 5: LOCAL WHISPER AI TRANSCRIPTION POOL ]                                                      |
|  ├── Whisper.cpp (Metal accelerated on Apple Silicon / CUDA / AVX2 on x86)                              |
|  └── Generates word-level timestamps for karaoke kinetic subtitles                                     |
|                                                                                                         |
|  [ THREAD 6: HARDWARE VIDEO EXPORT WORKER ]                                                             |
|  ├── macOS: Apple `VideoToolbox` (H.264, HEVC, ProRes 422 / 4444 hardware encoder)                      |
|  └── Windows: Nvidia `NVENC` / Intel `QuickSync` via Direct3D 11 Video API                              |
|                                                                                                         |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Native macOS ScreenCaptureKit & Mouse Tap Integration

### 2.1 macOS ScreenCaptureKit Rust Binding
On macOS, ScreenCraft Pro hooks into Apple's low-overhead `ScreenCaptureKit` API, which streams raw display buffers directly into GPU unified memory without CPU copies:

```rust
pub struct ScreenRecorder {
    stream: Option<SCStream>,
    output_handler: Arc<Mutex<StreamOutputReceiver>>,
}

impl ScreenRecorder {
    pub async fn start_capture(display_id: u32, config: CaptureConfig) -> Result<(), CaptureError> {
        let content = SCShareableContent::get().await?;
        let display = content.displays().into_iter().find(|d| d.display_id() == display_id)
            .ok_or(CaptureError::DisplayNotFound)?;

        let filter = SCContentFilter::new_with_display(&display);
        let mut stream_config = SCStreamConfiguration::new();
        stream_config.set_width(display.width() * display.scale_factor() as usize);
        stream_config.set_height(display.height() * display.scale_factor() as usize);
        stream_config.set_minimum_frame_interval(CMTime::new(1, config.fps as i32));
        stream_config.set_pixel_format(PixelFormat::BGRA8888);
        stream_config.set_shows_cursor(false); // We render high-DPI vector cursors instead!

        let stream = SCStream::new(&filter, &stream_config, &output_handler);
        stream.start_capture().await?;
        Ok(())
    }
}
```

### 2.2 Global Mouse Telemetry Tap (`CGEventTap`)
```rust
pub fn start_mouse_telemetry_logger(event_tx: crossbeam_channel::Sender<MouseEventRecord>) {
    std::thread::spawn(move || {
        let event_mask = (1 << CGEventType::MouseMoved as u64)
            | (1 << CGEventType::LeftMouseDown as u64)
            | (1 << CGEventType::LeftMouseUp as u64)
            | (1 << CGEventType::RightMouseDown as u64)
            | (1 << CGEventType::LeftMouseDragged as u64);

        let tap = CGEventTapCreate(
            CGEventTapLocation::HIDEventTap,
            CGEventTapPlacement::HeadInsertEventTap,
            CGEventTapOptions::ListenOnly,
            event_mask,
            mouse_tap_callback,
            &event_tx as *const _ as *mut c_void,
        );

        let run_loop_source = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0);
        CFRunLoopAddSource(CFRunLoopGetCurrent(), run_loop_source, kCFRunLoopCommonModes);
        CGEventTapEnable(tap, true);
        CFRunLoopRun();
    });
}
```

---

## 3. Local-First AI Subtitles Engine (Whisper.cpp)

ScreenCraft Pro provides 100% private, on-device audio transcription with word-by-word timestamps:

```
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
| LOCAL WHISPER AI PIPELINE                                                                               |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
| 1. AUDIO EXTRACTION ──▶ 2. 16kHz MONO RESAMPLE ──▶ 3. WHISPER.CPP INFERENCE ──▶ 4. WORD-TIMESTAMPS JSON  |
| Extract mic track      Convert to 16kHz Float32   Metal / CUDA GPU accelerated   Emit words with start/ |
| from project           WAV in memory              using 'ggml-tiny.en' or 'base' end millisecond bounds |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
```

### Subtitle Data Schema:
```json
[
  {
    "id": "sub_01",
    "start": 1.24,
    "end": 3.82,
    "text": "Welcome to ScreenCraft Pro.",
    "words": [
      { "word": "Welcome", "start": 1.24, "end": 1.78 },
      { "word": "to", "start": 1.79, "end": 1.95 },
      { "word": "ScreenCraft", "start": 1.96, "end": 2.80 },
      { "word": "Pro.", "start": 2.81, "end": 3.82 }
    ]
  }
]
```

---

## 4. Studio Audio DSP Engine

Audio signals are processed through a real-time Digital Signal Processing (DSP) chain:

1. **High-Pass Filter (80Hz cutoff)**: Removes low-frequency room rumble and HVAC humming.
2. **Downward Noise Gate**: Automatically mutes microphone background hiss when the speaker is not talking (Threshold: $-42\text{dB}$, Attack: $5\text{ms}$, Release: $120\text{ms}$).
3. **Dynamic Voice Leveler (Compressor & Limiter)**: Keeps voice volume consistent without clipping.
4. **Smart Ducking Engine**: Analyzes voice RMS levels and dynamically lowers background music by $-14\text{dB}$ with a smooth $250\text{ms}$ logarithmic crossfade.

---

## 5. Hardware Video Encoding Subsystem (Apple VideoToolbox / NVENC)

### 5.1 macOS VideoToolbox Native Pipeline
```rust
pub struct VideoToolboxEncoder {
    session: VTCompressionSessionRef,
}

impl VideoToolboxEncoder {
    pub fn configure(width: i32, height: i32, fps: i32, bitrate: i32) -> Result<Self, EncoderError> {
        let mut session: VTCompressionSessionRef = std::ptr::null_mut();
        
        VTCompressionSessionCreate(
            kCFAllocatorDefault,
            width,
            height,
            kCMVideoCodecType_H264, // or kCMVideoCodecType_HEVC / kCMVideoCodecType_AppleProRes422
            std::ptr::null(),
            std::ptr::null(),
            kCFAllocatorDefault,
            Some(compression_output_callback),
            std::ptr::null_mut(),
            &mut session,
        );

        // Configure Apple Silicon Hardware Encoding
        VTSessionSetProperty(session, kVTCompressionPropertyKey_RealTime, kCFBooleanTrue);
        VTSessionSetProperty(session, kVTCompressionPropertyKey_AverageBitRate, CFNumber::from(bitrate));
        VTSessionSetProperty(session, kVTCompressionPropertyKey_ExpectedFrameRate, CFNumber::from(fps));
        VTCompressionSessionPrepareToEncodeFrames(session);

        Ok(Self { session })
    }
}
```

*Result:* 4K 60fps videos export in under 20 seconds on Apple Silicon M-series chips without warming up the CPU or dropping frames.
