# UI/UX DESIGN SYSTEM SPECIFICATION
# Apple Pro HIG & macOS Sequoia / 15 & 16 Standards for ScreenCraft Pro

**Document Version:** 2.0.0  
**Design Paradigm:** Apple Human Interface Guidelines (HIG) Pro, macOS Sequoia (v15) & macOS 16 Design System, Screen Studio (`screen.studio`) Aesthetic Benchmark  
**Theme:** Obsidian Dark Studio with Dynamic Liquid Glass Vibrancy

---

## 1. Visual Philosophy & Aesthetic Benchmark

ScreenCraft Pro's user interface is modeled directly after **Screen Studio** and **macOS Sequoia Pro Apps** (such as Final Cut Pro, Logic Pro, and Apple Developer Tools).

```
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
| CORE DESIGN PILLARS                                                                                     |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
| 1. OBSIDIAN VIBRANCY       | Deep neutral dark backdrop (#09090B to #121214) layered with translucent   |
|                            | frosted acrylic surfaces that reflect underlying studio lighting.          |
+────────────────────────────+────────────────────────────────────────────────────────────────────────────+
| 2. LIQUID GLASS DEPTH      | Ultra-fine 1px specular lighting rim highlights (inset 0 1px 0 #ffffff18)  |
|                            | paired with heavy backdrop blurs (24px - 40px blur) and soft drop shadows. |
+────────────────────────────+────────────────────────────────────────────────────────────────────────────+
| 3. TACTILE ERGONOMICS      | Pill-shaped segmented controls, magnetic snapping sliders, and spring-     |
|                            | physics micro-interactions that feel responsive and physical.              |
+────────────────────────────+────────────────────────────────────────────────────────────────────────────+
| 4. UNCLUTTERED WORKSPACE   | The recorded screen canvas is the hero. Floating glass toolbars and HUDs   |
|                            | remain docked or auto-minimize to maximize canvas real estate.             |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Complete Color System & Design Tokens

### 2.1 Surfaces, Backgrounds & Acrylics

```css
:root {
  /* Canvas Background (The dark void) */
  --color-canvas-bg: #050507;
  
  /* App Shell & Sidebar Surfaces */
  --color-surface-base: #0c0c0e;
  --color-surface-raised: #141417;
  --color-surface-floating: #1c1c21;
  --color-surface-modal: #222228;

  /* Liquid Glass Acrylic Materials (macOS Vibrancy) */
  --glass-subtle: rgba(255, 255, 255, 0.03);
  --glass-default: rgba(255, 255, 255, 0.06);
  --glass-hover: rgba(255, 255, 255, 0.09);
  --glass-active: rgba(255, 255, 255, 0.14);
  --glass-blur-sm: blur(12px);
  --glass-blur-md: blur(24px);
  --glass-blur-lg: blur(40px);

  /* Borders & Specular Rim Lights (Apple 1px Glass Highlight) */
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-default: rgba(255, 255, 255, 0.12);
  --border-focus: rgba(255, 255, 255, 0.28);
  --specular-top-light: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  --specular-inset-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.35);

  /* High-Contrast Typography */
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --text-tertiary: #71717A;
  --text-disabled: #3F3F46;

  /* Accent & Status Colors (Apple Sequoia Palette) */
  --accent-blue: #007AFF;         /* Apple System Blue */
  --accent-blue-hover: #0A84FF;   /* Bright Blue */
  --accent-indigo: #6366F1;       /* Studio Indigo */
  --accent-purple: #AF52DE;       /* System Purple */
  --accent-emerald: #34C759;      /* System Green (Active Record) */
  --accent-amber: #FF9F0A;        /* System Orange (Warning / Audio) */
  --accent-rose: #FF3B30;         /* System Red (Record Stop) */
}
```

---

## 3. Typography Hierarchy (Apple SF Pro & Inter)

```
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
| STYLE               | FONT STACK                     | SIZE / LINE-HEIGHT | WEIGHT     | TRACKING       |
+─────────────────────+────────────────────────────────+────────────────────+────────────+────────────────+
| Large Title         | SF Pro Display, Inter Display  | 20px / 26px        | 700 (Bold) | -0.025em       |
| Section Header      | SF Pro Display, Inter Display  | 14px / 18px        | 600 (Semi) | -0.015em       |
| Body Primary        | SF Pro Text, Inter             | 13px / 18px        | 400 (Reg)  | -0.010em       |
| Body Medium         | SF Pro Text, Inter             | 13px / 18px        | 500 (Med)  | -0.010em       |
| Caption / Micro     | SF Pro Text, Inter             | 11px / 14px        | 500 (Med)  | +0.010em       |
| Timecode Monospace  | SF Mono, JetBrains Mono        | 12px / 16px        | 500 (Med)  | +0.030em       |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 4. Application Layout & Workspace Architecture

ScreenCraft Pro's workspace follows the exact 4-quadrant layout perfected by Screen Studio:

```
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
| [● ● ●]  ScreenCraft Pro — Project: "SaaS Launch Demo.screencraft"   [16:9 Landscape v]  [Export (⌘E) ▾]|
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
| [NAV]  |                                 [CANVAS VIEWPORT]                             | [INSPECTOR]    |
| ───────| +───────────────────────────────────────────────────────────────────────────+ | ────────────── |
| [📂]   | |                                                                           | | [ Canvas ]     |
| Media  | |        +────────────────────────────────────────────────────────+         | | Aspect: 16:9   |
|        | |        | (●)(●)(●)  https://screen.craft                    [+] |         | | Inset: 48px    |
| [🔍]   | |        |────────────────────────────────────────────────────────|         | | Radius: 28px   |
| Zoom   | |        |                                                        |         | | Shadow: Pro 3D |
|        | |        |                     [RECORDED APP]                     |         | |                |
| [🪄]   | |        |                           * [Vector Cursor]            |         | | [ Camera & 3D] |
| Cursor | |        |                                                        |         | | 3D Pitch: 14°  |
|        | |        +────────────────────────────────────────────────────────+         | | 3D Yaw: -8°    |
| [🖼️]   | |                                                                           | | Auto-Zoom: ON  |
| Frames | |                                                                           | |                |
|        | +───────────────────────────────────────────────────────────────────────────+ | [ Cursor ]     |
| [💬]   |    [⏮️]  [  ▶ Play (Space)  ]  [⏭️]      00:18.42 / 01:24.00     [ 100% ▾ ]  | Size: 1.4x     |
| Subs   |                                                                               | Style: macOS   |
|        |                                                                               | Halo: Ring     |
+────────+───────────────────────────────────────────────────────────────────────────────+────────────────+
| [MULTI-TRACK TIMELINE]                                                                [✂️ Split] [🗑️]   |
| ─────────────────────────────────────────────────────────────────────────────────────────────────────── |
| 🔍 Zoom Track : [── Zoom 2.0x ──]              [──── Zoom 2.5x ────]          [── Zoom 1.8x ──]         |
| 🎬 Video Track: [========================= Main 4K Screen Track ==============================]         |
| 💬 Captions   : [ "Instant setup" ] [ "Built for teams" ] [ "Deploy in seconds" ]                       |
| 🎙️ Audio Track: [||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||]     |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 5. UI Component Catalog & Specifications

### 5.1 macOS Sequoia Window Chrome & Browser Mockup

```tsx
export interface WindowChromeProps {
  type: 'macos_clean' | 'safari' | 'arc' | 'frameless';
  title?: string;
  url?: string;
  isDarkTheme?: boolean;
}
```
* **Traffic Lights**: Exact Apple SVG geometry with red `#FF5F56`, yellow `#FFBD2E`, green `#27C93F` with inset $0.5\text{px}$ stroke border.
* **Safari Glass Pill**: Translucent centered address bar with SSL lock icon, custom URL text, and reload glyph.
* **Window Corner Radius**: Superellipse squircle corner smoothing matching Apple macOS 15.

### 5.2 Floating Glass Inspector Panels (Right Sidebar)
Organized into collapsible, accordion-style cards with subtle divider lines:
1. **Canvas Card**: Aspect Ratio picker (`16:9`, `9:16`, `1:1`, `4:5`), Background Mesh Gradient picker (with color stop swatches), Padding slider ($0 - 180\text{px}$), Corner Radius slider ($0 - 48\text{px}$).
2. **Camera & 3D Tilt Card**: 3D Pitch slider ($-30^\circ$ to $+30^\circ$), 3D Yaw slider ($-30^\circ$ to $+30^\circ$), Auto-Zoom switch toggle, Spring Damping profile selector (Smooth, Snappy, Cinematic).
3. **Cursor Card**: Vector Cursor Style (macOS Arrow, Windows Arrow, Pointer, Glow Dot), Cursor Size multiplier ($1.0\times - 2.5\times$), Click Ripple Toggle, Motion Blur Toggle.
4. **Subtitles Card**: Font selector, Word Highlight Color, Background Text Card Toggle, Animation Style (Karaoke, Pop, Fade).
5. **Audio Card**: Noise Gate Toggle, Studio Voice Enhancer, Background Music Ducking slider.

### 5.3 Segmented Pill Selectors
- **Physical Feel**: Pill container with `bg-white/[0.04]`, inside of which the active segment slides with a spring-animated frosted pill (`bg-white/[0.12]`, `shadow-sm`, `border border-white/10`).
- **Icons**: 16x16 crisp vector icons with active text label transition.

### 5.4 Multi-Track Timeline Ergonomics
- **Playhead**: Electric Indigo line with a diamond top cap and high-contrast glow.
- **Zoom Blocks**: Semi-transparent blue pill blocks (`bg-blue-500/25 border border-blue-400/50`) on the dedicated Zoom Track. Handles on left/right edges for effortless trim and duration adjustment.
- **Waveform Rendering**: Real-time canvas-drawn RMS audio amplitude bars with volume peak clipping alerts.

---

## 6. Motion & Spring Physics Specification

Every transition and micro-interaction in ScreenCraft Pro utilizes Apple-standard spring physics:

```typescript
export const SpringPresets = {
  /** Used for camera zoom glide & panning (Screen Studio signature motion) */
  cameraPan: { stiffness: 180, damping: 24, mass: 1 },
  
  /** Used for floating HUD entry, popovers, and inspector toggles */
  interfacePop: { stiffness: 320, damping: 28, mass: 0.8 },
  
  /** Used for segmented control pill sliding */
  pillSlide: { stiffness: 450, damping: 35, mass: 0.6 },
  
  /** Used for click ripple shockwaves */
  clickRipple: { stiffness: 220, damping: 18, mass: 0.5 },
};
```
