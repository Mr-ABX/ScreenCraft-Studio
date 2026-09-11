# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# ScreenCraft Pro: Next-Generation Motion Screen Recorder & Video Studio

**Document Version:** 2.0.0  
**Status:** Production Ready / Baseline Specification  
**Design Reference:** macOS Sequoia & macOS 15/16 Human Interface Guidelines (HIG), Screen Studio (`screen.studio`), Screen Movie (`screen.movie`)  
**Target Platforms:** Dual-Target — Universal Web App (PWA) + High-Performance Desktop App (macOS & Windows via Tauri 2.0 Rust)

---

## 1. Executive Vision & Problem Statement

### 1.1 The Market Landscape
Video is the dominant medium for product launches, software demos, developer tutorials, and viral social content. However, creators currently face an agonizing tradeoff:

```
+---------------------------------------------------------------------------------------------------------+
| CURRENT STATUS QUO                                                                                      |
+------------------------------------+------------------------------------+-------------------------------+
| NATIVE PRO APPS (Screen Studio,   | OPEN-SOURCE ATTEMPTS (OpenScreen)  | TRADITIONAL NLEs (Premiere,   |
| Screen Movie)                      |                                    | Final Cut Pro, DaVinci)       |
+------------------------------------+------------------------------------+-------------------------------+
| [PROS] Buttery 60fps auto-zoom,    | [PROS] Free, open-source concept,  | [PROS] Unlimited control,     |
| gorgeous Apple UI, instant polish. | cross-platform web/electron.       | professional color grading.   |
| [CONS] macOS only, closed-source,  | [CONS] Severe render lag, memory   | [CONS] 3-5 hours of tedious   |
| expensive licenses, no web app.    | leaks, video preview freezes,      | keyframing per 1-minute demo. |
|                                    | choppy cursors, crashes in 4K.     | Steep learning curve.         |
+------------------------------------+------------------------------------+-------------------------------+
```

### 1.2 The ScreenCraft Pro Mission
**ScreenCraft Pro** delivers the speed, beauty, and automated intelligence of Screen Studio in a **modern, open-architecture, dual-platform engine** that runs both client-side in the browser and as an ultra-light native desktop app:
1. **Effortless Cinematic Quality**: 1-click automatic zoom on click targets, silky spring-physics camera gliding, high-DPI vector cursor replacement, and 3D perspective tilt.
2. **Apple Pro HIG & Liquid Glass UI**: Built strictly adhering to macOS Sequoia / macOS 15/16 Human Interface Guidelines with dark obsidian glass acrylics, responsive floating HUDs, and tactile micro-interactions.
3. **Zero-Lag & Zero-Freeze Engine**: Re-engineered from the ground up on WebCodecs, WebGPU/WebGL2 shaders, and Rust hardware encoders—eliminating the rendering bottlenecks and preview freezes of legacy tools like OpenScreen.
4. **Universal Accessibility**: Zero-install instant web workflow for casual creators, paired with a sub-50MB native Tauri 2.0 desktop app for professional 4K/120fps power users.

---

## 2. User Personas & Core Journeys

### 2.1 Primary User Personas

```
+-----------------------------------------------------------------------------------------------------+
| USER PERSONA          | CORE GOAL                          | BIGGEST PAIN POINT                     |
+-----------------------+------------------------------------+----------------------------------------+
| Alex - SaaS Founder   | Create high-converting product     | Cannot afford $500/video editors or    |
| & Indie Hacker        | launch videos for X & Product Hunt | spend 6 hours keyframing in Premiere.  |
+-----------------------+------------------------------------+----------------------------------------+
| Sarah - DevRel &      | Record crisp coding tutorials      | Code text is unreadable on mobile;     |
| Tech Educator         | and terminal demos                 | manual zooming in post is painful.     |
+-----------------------+------------------------------------+----------------------------------------+
| Marcus - Product      | Record quick release notes &       | Loom looks blurry and cheap; Screen    |
| Manager               | feature walkthroughs for clients   | Studio is locked to macOS teammates.   |
+-----------------------+------------------------------------+----------------------------------------+
| Elena - Social Media  | Repurpose screen demos into 9:16   | Reframing horizontal screen captures   |
| Growth Marketer       | TikToks, Shorts, and Reels         | into vertical formats cuts off clicks. |
+-----------------------+------------------------------------+----------------------------------------+
```

### 2.2 End-to-End User Journey

```
[ 1. CAPTURE ] ────────────────▶ [ 2. SMART AUTO-LAYOUT ] ─────────▶ [ 3. FINE-TUNE & POLISH ] ────────▶ [ 4. INSTANT EXPORT ]
• Select Screen / App Window    • Telemetry parser builds zoom map  • Drag & trim zoom blocks on timeline• Choose preset (16:9, 9:16)
• Record 60fps + Mouse Stream   • Center camera on click clusters   • Toggle 3D Tilt, Safari Mockup      • WebCodecs / GPU Encoder
• Sync Webcam & Mic Audio       • Smooth cursor with Bézier splines • Generate Whisper AI Subtitles      • 4K MP4 / ProRes in <30s
```

---

## 3. Comprehensive Feature Requirements Matrix

### 3.1 Screen & Audio Capture Subsystem
* **F-101: Native Screen Recording (Desktop)**: Direct hardware capture via macOS `ScreenCaptureKit` and Windows `Graphics.Capture` at native Retina / 4K resolutions up to 120fps.
* **F-102: Web Screen Recording (Browser)**: High-resolution `getDisplayMedia()` capture with real-time frame timestamping.
* **F-103: Multi-Track Telemetry Logger**: Records synchronized mouse events (X, Y, click type, drag state, scroll deltas) and active focused window bounds at sub-millisecond precision.
* **F-104: Synchronized Webcam Overlay**: PiP camera recording with shape masks (Circle, Squircle, Rounded Rect), border color, drop shadow, and background removal / chroma key.
* **F-105: Studio Audio Ingestion**: Dual-track audio capture (System Audio + Microphone) with real-time peak metering and gain normalization.
* **F-106: External Media Import**: Drag-and-drop existing `.mp4`, `.mov`, `.webm`, or `.mkv` screen recordings for instant post-production enhancement.

### 3.2 Automated Cinematic Camera & Zoom Engine
* **F-201: Smart Click & Focus Detection**: Automatically identifies click clusters, text inputs, and UI activity, generating intelligent zoom segments.
* **F-202: Damped Spring Physics Camera**: Damped harmonic oscillator model ($F = -kx - cv$) for camera panning and zooming, eliminating sudden camera jerks.
* **F-203: Interactive Timeline Zoom Blocks**: Draggable, trimmable visual blocks on the timeline allowing users to add, delete, resize, or reposition zoom events.
* **F-204: Interactive Viewport Focal Drag**: Users can click and drag the canvas directly to reposition the camera focus target for any zoom block.
* **F-205: Cinematic 3D Perspective Matrix**: Real-time 3D rotation ($X$-pitch tilt, $Y$-yaw rotation, $Z$-roll) with realistic depth foreshortening and dynamic specular rim highlights.

### 3.3 Vector Cursor & Motion Styling
* **F-301: Vector Cursor Reconstruction**: Replaces fuzzy pixelated recorded cursors with crisp, high-DPI SVG cursors (macOS Arrow, Windows Arrow, Pointer Hand, Text I-Beam, Custom Crosshair).
* **F-302: Catmull-Rom Spline Smoothing**: Eliminates jittery hand movements by fitting smooth mathematical spline curves through raw coordinate telemetry.
* **F-303: Motion-Adaptive Velocity Blur**: Adds natural directional blur to fast cursor movements.
* **F-304: Click Shockwaves & Ripple Rings**: Customizable click animation rings (radius, expansion speed, ring color, pulse opacity).
* **F-305: Smart Cursor Scale & Inactivity Hide**: Adjustable cursor scale ($1.0\times$ to $2.5\times$) and automatic fade-out when cursor is stationary for $>2$ seconds.

### 3.4 Canvas Frames, Studio Mockups & Backgrounds
* **F-401: macOS Sequoia / Sonoma Window Chrome**: Authentic dark and light traffic lights, glass header, and subtle title bar text.
* **F-402: Modern Browser Frames (Safari / Arc / Chrome)**: Customizable URL bar, SSL security badge, favicon, and tab strip.
* **F-403: Hardware Device Mockups**: Studio Display, MacBook Pro M4 notch frame, iPhone 16 Pro mockup.
* **F-404: Studio Mesh Gradients & Wallpapers**: High-end animated and static mesh gradients (Apple Aurora, Obsidian Studio, Midnight Velvet, Cyber Dusk).
* **F-405: Custom Canvas Backgrounds & Alpha**: User-uploaded wallpaper images, looping video backdrops, or 100% transparent alpha channel (for layering in Premiere/Final Cut).
* **F-406: Dynamic Canvas Padding & Shadows**: Adjustable padding ($0 - 180\text{px}$), corner rounding ($0 - 48\text{px}$), and multi-layer Gaussian contact shadows.

### 3.5 Multi-Track Timeline & Editing Tools
* **F-501: Sample-Accurate Non-Destructive Timeline**: Synchronized tracks for Screen Video, Webcam Overlay, Zoom/Camera Blocks, Captions, and Audio.
* **F-502: Precision Edit Controls**: Blade/Split tool (`Cmd+B`), ripple delete, clip slip, and multi-clip selection.
* **F-503: Variable Speed Ramping**: $0.25\times$ to $8.0\times$ speed adjustment with pitch-corrected audio preservation.
* **F-504: Auto-Silence Remover**: One-click detection and removal of pauses and silent dead space.
* **F-505: Hardware PTS Synchronization**: Master audio clock sync preventing preview freezes and audio drift.

### 3.6 AI Kinetic Subtitles & Audio Polish
* **F-601: Local-First Whisper AI Transcription**: 100% private, on-device audio-to-text transcription via Whisper Wasm (Web) and Whisper.cpp (Desktop).
* **F-602: Kinetic Karaoke Animations**: Word-by-word active highlight animations, bouncing text cards, neon glow subtitles, and custom font controls.
* **F-603: AI Voice Cleanup**: Real-time noise gate, room reverb suppression, and voice leveling.
* **F-604: Studio Audio Ducking**: Automatically lowers background music volume when voice activity is detected.

### 3.7 GPU Export & Format Presets
* **F-701: WebCodecs Fast Browser Export**: Hardware-accelerated in-browser MP4 encoding at $>120\text{ fps}$.
* **F-702: Native Hardware Desktop Encoding**: macOS VideoToolbox (H.264, HEVC, ProRes 422/4444) and Windows NVENC/QuickSync.
* **F-703: Instant Aspect Ratio Presets**: 16:9 (Landscape YouTube), 9:16 (Vertical TikTok/Reels with auto-reframed focus), 1:1 (Square X/LinkedIn), 4:5 (Instagram).
* **F-704: Ultra-Smooth Animated GIF Export**: High-quality GIF export with Floyd-Steinberg dithering.

---

## 4. Non-Functional Requirements & Performance SLAs

```
+---------------------------------------------------------------------------------------------------------+
| METRIC                       | SLA TARGET                        | ARCHITECTURAL ENFORCEMENT            |
+------------------------------+-----------------------------------+--------------------------------------+
| Real-time Viewport FPS       | Locked 60 FPS at 4K viewport      | WebGPU / WebGL2 fragment shaders     |
+------------------------------+-----------------------------------+--------------------------------------+
| Editor Playback Latency      | < 16ms frame render time          | Zero-copy texture streaming          |
+------------------------------+-----------------------------------+--------------------------------------+
| Audio/Video Synchronization  | < 5ms drift (sample-accurate)     | Web Audio PTS Master Clock           |
+------------------------------+-----------------------------------+--------------------------------------+
| Desktop App Bundle Size      | < 50 MB total installer           | Tauri 2.0 Rust (No bundled Chrome)   |
+------------------------------+-----------------------------------+--------------------------------------+
| Idle Memory Footprint        | < 120 MB RAM                      | Rust memory management + V8 GC tune  |
+------------------------------+-----------------------------------+--------------------------------------+
| 4K Export Speed Ratio        | >= 2.0x real-time (1min video <30s| VideoToolbox / NVENC / WebCodecs     |
+------------------------------+-----------------------------------+--------------------------------------+
| User Data Privacy            | 100% Local-First / Zero Cloud     | Local Whisper AI & local rendering   |
+---------------------------------------------------------------------------------------------------------+
```

---

## 5. Success Metrics & Key Performance Indicators (KPIs)
1. **Time-to-Finished-Video**: A user can produce a ready-to-publish 60-second product video in **under 3 minutes** from hitting record.
2. **Export Success Rate**: $>99.9\%$ zero-crash export reliability on both Web and Desktop platforms across 1080p, 2K, and 4K resolutions.
3. **Subjective Polish Score**: Videos produced with default presets match or exceed Screen Studio and screen.movie in visual aesthetics, smoothness, and readability.
