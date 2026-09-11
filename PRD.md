# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Project: ScreenCraft Pro (Next-Gen Screen Recording & Motion Video Editor)
**Document Version:** 1.0.0  
**Status:** Approved for Architecture & Implementation  
**Inspired by:** [screen.movie](https://screen.movie), Screen Studio, Apple HIG Design System  
**Target Platforms:** Dual-Target (Web Progressive Web App + High-Performance Desktop App via macOS/Windows Native Hardware Acceleration)

---

## 1. Executive Summary & Vision

### 1.1 The Vision
**ScreenCraft Pro** is an open-architecture, next-generation screen recording and cinematic video editing platform designed to turn raw screen captures into stunning, high-production product videos, tutorials, and social demos in seconds.

Existing tools in the market are polarized:
1. **Screen Studio / Screen Movie (macOS Native)**: Incredible output quality, buttery smooth auto-zoom, and Apple-grade design, but locked to macOS, closed-source, and requiring paid lifetime/subscription licenses.
2. **OpenScreen (Open Source Prototype)**: Great concept, but plagued by severe architectural bottlenecks:
   - **Render Bottlenecks**: Canvas-to-PNG sequential streaming into FFmpeg subprocesses causing massive CPU/RAM spikes and render crashes.
   - **Preview Freezes**: Audio/Video PTS (Presentation Timestamp) desync where video frames freeze while audio continues playing in the editor.
   - **Limited Customization**: Rudimentary background controls, choppy cursor movement, lack of 3D tilt/perspective, and limited platform flexibility.

### 1.2 The Solution
ScreenCraft Pro rebuilds this workflow from the ground up on a **modern GPU-accelerated hybrid architecture**:
- **Dual-Distribution**: Runs 100% client-side in modern web browsers (via **WebCodecs + WebGPU/WebGL2 + WebAssembly FFmpeg**) and as a lightweight native desktop app (via **Tauri 2.0 Rust + ScreenCaptureKit / Direct3D + VideoToolbox/NVENC**).
- **Apple Pro Human Interface Guidelines (HIG) & Liquid Glass UI**: Dark obsidian aesthetic, real-time frosted glass acrylics, precise typography, and tactile floating HUD controls.
- **Buttery 60fps Real-Time Preview**: Zero-lag timeline playback with hardware-accelerated shader composition.
- **Instant GPU Exporting**: Zero frame drops, zero PTS desyncs, and 10x faster export speeds using hardware-assisted H.264, HEVC, and ProRes encoders.

---

## 2. Target Audience & Core Use Cases

| User Persona | Core Problem | ScreenCraft Pro Solution |
| :--- | :--- | :--- |
| **SaaS Founders & Product Managers** | Needs high-converting product demo videos for X, Product Hunt, and landing pages without hiring an After Effects editor. | 1-Click Auto-Zoom, 3D perspective tilt, crisp device/browser mockups, and studio lighting backgrounds. |
| **Developer Advocates & Educators** | Screen recordings of IDEs and terminals look boring and hard to read on mobile screens. | Cursor magnification, code-block syntax highlighting, auto-zoom on click targets, and animated kinetic subtitles. |
| **Content Creators & Marketers** | Exporting from traditional NLEs (Premiere/Final Cut) takes hours of manual keyframing. | Automatic smart-zoom tracking, smooth cursor Bézier interpolation, and instant multi-aspect ratio export (16:9, 9:16, 1:1, 4:5). |

---

## 3. Comparative Gap Analysis: OpenScreen vs. Screen Movie vs. ScreenCraft Pro

| Feature Area | OpenScreen (Current State) | Screen Movie (screen.movie) | ScreenCraft Pro (Our Specification) |
| :--- | :--- | :--- | :--- |
| **Application UI** | Basic Electron webview, basic styling | Polished macOS Native Dark UI | **Apple HIG + Liquid Glass**, Obsidian Dark Theme, Floating Glass HUDs, SF Pro Typography |
| **Preview Performance** | Drops frames, freezes video on preview | 60fps Native Metal rendering | **60fps WebGPU / WebGL2 Shader Pipeline** (zero frame drops, hardware decoded) |
| **Rendering / Export** | Sequential Node.js pipe -> FFmpeg (High RAM, crashes on 4K) | Native AVFoundation VideoToolbox | **Dual Hardware Acceleration**: WebCodecs + WebGPU (Web) / Rust VideoToolbox & NVENC (Desktop) |
| **Auto-Zoom Engine** | Choppy linear bounding box interpolation | Smooth spring-damped camera zoom | **Physics-based Spring & Hermite/Bézier Spline Smoothing** with manual keyframe overrides |
| **Cursor Smoothing** | Basic cursor replacement | Polished animated vector cursor | **High-DPI SVG Cursor Engine**, velocity-adaptive motion blur, click ripple shockwaves, auto-hide idle |
| **3D & Perspective Tilt** | None (Flat 2D only) | Subtle 3D tilt | **True 3D Pitch/Yaw/Roll Perspective Matrix**, realistic drop shadows, dynamic edge highlights |
| **Captions & Audio** | No transcription, basic audio | Captions, background music | **Local Whisper AI Audio Transcription**, kinetic word-by-word animated subtitles, Studio Audio EQ & Noise Gate |
| **Platform Availability** | Electron Desktop only | macOS 15+ only | **Universal**: Web Browser (Chrome/Edge/Safari) + Native App (macOS, Windows, Linux) |

---

## 4. Key Functional Features & Requirements

### 4.1 Capture & Ingestion Engine
1. **Multi-Source Recording**:
   - High-resolution screen capture (4K / 60fps / 120fps with display scaling metadata).
   - Synchronized webcam stream (Circle, Squircle, Rounded Rectangle overlays with border & chroma key).
   - System audio capture + Microphone input with dual-track independent recording.
2. **Metadata Telemetry Logger**:
   - Real-time logging of mouse coordinates `(x, y, timestamp)`, click events (left, right, double-click, drag), and keyboard modifier states (`Cmd`, `Ctrl`, `Alt`, `Shift`).
   - Active window bounding box detection for contextual auto-focus.
3. **File Import Support**:
   - Drag-and-drop existing `.mp4`, `.mov`, `.webm`, or `.mkv` recordings into the editor for instant post-production enhancement.

### 4.2 Cinematic Camera & Auto-Zoom Engine
1. **Intelligent Click & Activity Detection**:
   - Automatically detects click hotspots and typing activity clusters to zoom in at $1.5\times$, $2.0\times$, or $3.0\times$.
2. **Spring Physics & Spline Smoothing**:
   - Damped spring physics camera transitions (`stiffness: 180`, `damping: 24`, `mass: 1`) eliminating sudden camera jumps.
3. **Interactive Timeline Zoom Blocks**:
   - Visual zoom blocks on the timeline that can be dragged, trimmed, repositioned, or adjusted for zoom level and focal point.
4. **Cinematic 3D Camera Controls**:
   - Real-time 3D rotation ($X$-tilt, $Y$-pan, $Z$-roll) to give screen recordings an elevated, floating showcase look.

### 4.3 Cursor Styling & Enhancement
1. **Vector Cursor Reconstruction**:
   - Replaces low-res recorded mouse pointers with razor-sharp SVG cursors (macOS Arrow, Windows Arrow, Pointer Hand, I-Beam, Custom Brand Icons).
2. **Cursor Smoothing & Trail Interpolation**:
   - Catmull-Rom / Hermite curve smoothing over erratic mouse movements.
3. **Click Effects & Sound Design**:
   - Dynamic click rings, pulsating halos, and optional tactile click audio feedback.
4. **Smart Cursor Visibility**:
   - Auto-hides cursor when motionless for $>2$ seconds and scales up cursor size for readability ($1.0\times$ to $2.5\times$).

### 4.4 Canvas, Studio Frames & Background Design
1. **Browser & Window Mockups**:
   - **macOS Window Frame**: Authentic dark/light traffic lights, brushed glass header.
   - **Modern Browser Header**: Safari / Arc / Chrome address bars with customizable URL, favicon, and SSL badge.
   - **Device Frames**: Studio Display, MacBook Pro M-series notch, iPhone 16 Pro mockup.
2. **Background Styles**:
   - **Curated Mesh Gradients**: Apple Aurora, Obsidian Glow, Cyber Sunset, Midnight Velvet, Studio Minimal.
   - **Custom Media**: Custom image wallpapers, looping ambient MP4 video backgrounds, or pure transparent Alpha channel (ProRes 4444 / WebM with alpha).
   - **Canvas Padding & Insets**: Adjustable padding ($0\text{px} - 160\text{px}$), corner radius ($0\text{px} - 48\text{px}$), and multi-layer Gaussian box shadows.

### 4.5 Timeline & Multi-Track Editing
1. **Non-Destructive Multi-Track Timeline**:
   - Track 1: Main Video / Screen Capture.
   - Track 2: Camera / Webcam Overlay.
   - Track 3: Zoom & Camera Movement Keyframes.
   - Track 4: Captions & Kinetic Typography.
   - Track 5: Audio (Voiceover + Background Music + SFX).
2. **Precision Editing Tools**:
   - Blade/Split (`Cmd+B`), Ripple Trim, Speed Ramps ($0.25\times$ to $8.0\times$ with pitch preservation), and Auto-Silence Removal.
3. **Real-time WebGPU Preview**:
   - 60fps playback with zero dropped frames, real-time shader color grading, and sample-accurate audio scrub.

### 4.6 AI Subtitles & Kinetic Typography
1. **Local-First Whisper AI Transcription**:
   - Built-in Whisper Wasm (Web) / Whisper.cpp (Desktop) for 100% private, zero-cost, on-device audio transcription.
2. **Kinetic Caption Styles**:
   - Word-by-word karaoke highlight (Hormozi / TikTok / Apple style).
   - Bouncing words, neon glow, minimal subtitle cards with custom fonts and emoji insertion.

### 4.7 Audio Engine & Studio Polish
1. **AI Voice Clean & Noise Gate**:
   - One-click background noise reduction, room reverberation cancellation, and dynamic voice leveling.
2. **Background Music & Ducking**:
   - Royalty-free ambient music tracks with automatic ducking (lowers music volume when speech is detected).

### 4.8 Export & Rendering Architecture
1. **Ultra-Fast Hardware Encoding**:
   - **Web**: WebCodecs `VideoEncoder` + `MP4Muxer` (blazing fast in-browser rendering at $>120\text{fps}$ encode rates).
   - **macOS Desktop**: Apple VideoToolbox hardware encoder (H.264, HEVC, ProRes 422/4444).
   - **Windows/Linux Desktop**: NVENC / Intel QuickSync / AMD AMF via FFmpeg native bindings.
2. **Multi-Format Presets**:
   - **Social**: 1080x1920 (9:16 Shorts/Reels/TikTok), 1920x1080 (16:9 YouTube/Web), 1080x1080 (1:1 X/LinkedIn).
   - **Master Quality**: 4K 60fps Ultra-HD (H.264/HEVC), Animated GIF with Floyd-Steinberg dithering.

---

## 5. UI/UX Design System Specification (Apple HIG & Liquid Glass)

```
+-----------------------------------------------------------------------------------------------+
| [Traffic Lights]  ScreenCraft Pro - [Project Name]                       [Preset: 16:9 4K v] [Export v] |
+-----------------------------------------------------------------------------------------------+
| [Sidebar]       |                                [Preview Viewport]                           | [Inspector Panel] |
| ---------------+| +-------------------------------------------------------------------------+ | ----------------- |
| [T] Media      || |                                                                         | | [ Canvas ]        |
| [o] Camera     || |        +------------------------------------------------------+         | | Aspect: 16:9      |
| [Z] Auto-Zoom  || |        | (o)(o)(o)  https://myapp.com                     [+] |         | | Padding: 48px     |
| [S] Subtitles  || |        |------------------------------------------------------|         | | Radius: 24px      |
| [B] Background || |        |                                                      |         | | Shadow: Deep 3D   |
| [A] Audio      || |        |                  [SCREEN CONTENT]                    |         | |                   |
|                || |        |                        * [Smooth Cursor]             |         | | [ Camera & 3D ]   |
|                || |        |                                                      |         | | 3D Tilt: +12 deg  |
|                || |        +------------------------------------------------------+         | | Auto-Zoom: ON     |
|                || |                                                                         | | Spring: Smooth v  |
|                || +-------------------------------------------------------------------------+ |                   |
|                ||   [<<]  [Play / Pause (Space)]  [>>]     00:14.28 / 01:30.00     [100% v]  | [ Cursor ]        |
|                |+---------------------------------------------------------------------------+ | Size: 1.5x        |
|----------------+----------------------------------------------------------------------------+ | Style: macOS Pro  |
| [TIMELINE]                                                                                  | | Click Ring: ON    |
| [*] Zoom Track : [==== Zoom In 2.0x ====]                 [=== Zoom In 1.8x ===]            |                     |
| [V] Video Track: [==================== Full Capture Video Track ===================]         | [ Subtitles ]       |
| [C] Captions   : [ "Welcome to..." ] [ "Build fast..." ] [ "Launch today..." ]               | Style: Karaoke Neon |
| [A] Audio Track: [||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||]        | Local Whisper: ON   |
+-----------------------------------------------------------------------------------------------+-------------------+
```

### 5.1 Design Tokens & Aesthetic Standards
- **Background Foundation**: Deep obsidian dark mode (`#09090B`, `#111113`, `#18181B`).
- **Glass Acrylics**: `rgba(255, 255, 255, 0.05)` backdrop-filter: `blur(20px)` with a crisp `1px border rgba(255, 255, 255, 0.08)`.
- **Specular Highlights**: Top border light bleed `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12)`.
- **Primary Accents**: Electric Indigo (`#6366F1`), Apple Blue (`#007AFF`), Emerald Success (`#10B981`).
- **Typography**: `SF Pro Display`, `SF Pro Text`, `Inter Display`, and `JetBrains Mono` for timecodes.

---

## 6. Non-Functional Requirements & Performance Benchmarks

| Metric | Target SLA | Implementation Strategy |
| :--- | :--- | :--- |
| **Real-time Preview FPS** | **Locked 60 FPS** at 4K viewport scaling | WebGPU/WebGL2 shader composition; offload decode to WebCodecs. |
| **Export Speed** | $\mathbf{\ge 60\text{ fps}}$ ($1\text{ min video} \le 30\text{ sec export}$) | GPU hardware encoding (VideoToolbox / NVENC / WebCodecs). |
| **Memory Footprint** | $\mathbf{< 150\text{ MB RAM}}$ on idle; $\mathbf{< 450\text{ MB}}$ rendering | Zero frame duplication; zero intermediate disk PNG buffering; stream processing. |
| **Crash Rate** | $\mathbf{< 0.01\%}$ | Isolation of render workers via Web Worker / Rust background threads. |
| **Privacy & Security** | **100% Local-First** | Zero video data sent to cloud servers; local Whisper AI; fully private. |

---

## 7. Delivery Milestones & Phased Execution

- **Phase 1 (Core Foundation)**: Project Scaffold, Apple HIG UI Shell, WebCodecs & Tauri 2.0 Capture Pipeline.
- **Phase 2 (Composition & Shader Engine)**: WebGPU/WebGL2 Multi-layer Canvas, 3D Perspective Tilt, Window Frames & Mesh Gradients.
- **Phase 3 (Camera & Cursor Magic)**: Spring-Physics Auto-Zoom Engine, Bézier Spline Cursor Smoothing, Click Shockwaves.
- **Phase 4 (Audio & AI Captions)**: Whisper AI On-Device Transcription, Karaoke Kinetic Subtitles, Audio Clean.
- **Phase 5 (Timeline & GPU Exporter)**: Multi-track Timeline, WebCodecs/VideoToolbox Exporter, GIF/MP4/ProRes rendering.
