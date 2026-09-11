# IMPLEMENTATION ROADMAP & DEVELOPMENT PLAN
# Project: ScreenCraft Pro

## Phase 1: Project Setup & Architecture Core
- [x] Create PRD (`PRD.md`), Architecture Spec (`ARCHITECTURE.md`), and Design System (`DESIGN_SYSTEM.md`).
- [ ] Initialize Unified Monorepo (TurboRepo or PNPM Workspaces with React 19, Vite, Tailwind CSS v4, and Tauri 2.0).
- [ ] Set up Apple HIG & Liquid Glass UI component primitives (GlassPanel, WindowChrome, SegmentedControl, FloatingHUD).

## Phase 2: WebCodecs & WebGPU Rendering Engine
- [ ] Implement `WebGPU / WebGL2` Real-time Shader Compositor.
- [ ] Implement Presentation Timestamp (PTS) synchronized playback engine with `requestVideoFrameCallback`.
- [ ] Build multi-layer canvas compositor (Screen Texture + 3D Perspective + Gaussian Shadows + Mesh Gradients).

## Phase 3: Smart Auto-Zoom & Cursor Engine
- [ ] Build Spring-Physics camera controller (`damping: 24`, `stiffness: 180`).
- [ ] Build Catmull-Rom / Bézier spline smoothing for mouse trails.
- [ ] Implement SVG cursor replacement with high-DPI assets and click shockwave animations.

## Phase 4: Non-Destructive Multi-Track Timeline
- [ ] Build interactive 60fps timeline with zoom blocks, clip trimming, and split tools.
- [ ] Add Whisper AI on-device audio transcription for word-by-word kinetic captions.
- [ ] Implement audio clean filter and automatic background music ducking.

## Phase 5: Hardware-Accelerated Export & Desktop App (Tauri 2.0)
- [ ] Implement WebCodecs `VideoEncoder` + `MP4Muxer` for instant in-browser 4K rendering.
- [ ] Implement Tauri 2.0 Rust backend with `ScreenCaptureKit` and Apple `VideoToolbox` hardware export.
- [ ] Add GIF, WebM with alpha, and ProRes 422 export presets.
