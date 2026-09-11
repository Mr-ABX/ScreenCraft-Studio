# DESIGN SYSTEM SPECIFICATION
# Apple Pro HIG & Liquid Glass Design System for ScreenCraft Pro

## 1. Aesthetic Philosophy & Visual Identity

The visual language of **ScreenCraft Pro** is inspired by **macOS Sequoia / Sonoma Pro Apps**, **Apple Human Interface Guidelines (HIG)**, and modern **Liquid Glass / Frosted Glass UI** aesthetics (as seen in `screen.movie` and `screen.studio`).

### Core Design Tenets:
1. **Depth Through Translucency**: Layered frosted acrylics with dynamic background blur (`backdrop-blur-2xl`) and 1px specular lighting borders.
2. **Obsidian Foundation**: Deep, rich dark backgrounds (`#09090B` to `#121214`) that make recorded screen content pop with maximum contrast.
3. **Tactile Micro-Interactions**: Smooth spring animations (`scale: 1.02` on hover, springy toggle switches, and tactile haptic-like click feedback).
4. **Content-First Canvas**: The editing viewport is treated as a high-end photography studio, framing the screen recording inside realistic device/browser mockups.

---

## 2. Color Palette & Design Tokens

### 2.1 Surfaces & Backgrounds
```css
:root {
  /* Canvas & Viewport */
  --surface-canvas: #050507;
  
  /* Panels & Shell */
  --surface-base: #0c0c0e;
  --surface-raised: #141417;
  --surface-overlay: #1c1c21;
  
  /* Frosted Glass Materials */
  --glass-bg-subtle: rgba(255, 255, 255, 0.03);
  --glass-bg-default: rgba(255, 255, 255, 0.06);
  --glass-bg-active: rgba(255, 255, 255, 0.10);
  --glass-blur: 24px;
  
  /* Borders & Specular Rim Lights */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-prominent: rgba(255, 255, 255, 0.16);
  --specular-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.14);
  
  /* Typography */
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --text-tertiary: #71717A;
  --text-muted: #52525B;
  
  /* Brand Accents */
  --accent-blue: #007AFF;       /* Apple System Blue */
  --accent-indigo: #6366F1;     /* Studio Electric Indigo */
  --accent-purple: #A855F7;     /* Neon Purple */
  --accent-emerald: #10B981;    /* Success / Active Recording */
  --accent-amber: #F59E0B;      /* Warning / Audio Ducking */
  --accent-rose: #F43F5E;       /* Recording Red */
}
```

---

## 3. Typography Hierarchy

| Level | Font Family | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Heading** | `SF Pro Display`, `Inter Display` | 24px | 700 (Bold) | 32px | -0.03em | Project Titles, Export Dialogs |
| **Section Heading** | `SF Pro Display`, `Inter Display` | 15px | 600 (Semibold) | 20px | -0.02em | Inspector Group Titles |
| **Body Regular** | `SF Pro Text`, `Inter` | 13px | 400 (Regular) | 18px | -0.01em | Labels, Tooltips, Status |
| **Body Medium** | `SF Pro Text`, `Inter` | 13px | 500 (Medium) | 18px | -0.01em | Segmented Controls, Buttons |
| **Caption / Meta** | `SF Pro Text`, `Inter` | 11px | 500 (Medium) | 14px | 0.00em | Property Hints, Shortcuts |
| **Mono Numbers** | `SF Mono`, `JetBrains Mono` | 12px | 500 (Medium) | 16px | 0.02em | Timecodes, Dimensions, FPS |

---

## 4. UI Components & Patterns

### 4.1 macOS Window Frame & Browser Mockup Component
```tsx
export function MacWindowFrame({
  children,
  title = "Untitled Project",
  url = "https://myapp.com",
  style = "safari", // "macos" | "safari" | "arc" | "clean"
  showTrafficLights = true,
}: WindowFrameProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Titlebar / Chrome */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-white/5 bg-white/[0.03]">
        {showTrafficLights && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-sm" />
          </div>
        )}

        {style === "safari" && (
          <div className="flex-1 max-w-sm mx-4 h-6 px-3 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center gap-2 text-[11px] text-zinc-400">
            <LockIcon className="w-3 h-3 text-zinc-500" />
            <span className="truncate">{url}</span>
          </div>
        )}

        <div className="text-[12px] font-medium text-zinc-400">{title}</div>
      </div>

      {/* Embedded Screen Content */}
      <div className="relative aspect-video w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
```

### 4.2 Floating Glass Toolbar & Inspector
- **Floating Pill Toolbars**:
  ```html
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 h-12 px-3 rounded-full bg-zinc-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center gap-1">
    <!-- Action Icons -->
  </div>
  ```
- **Tactile Sliders & Segmented Selectors**:
  - Segmented control pills with sliding background highlights.
  - Number scrubbers with double-click reset and wheel adjustment.

### 4.3 Studio Mesh Gradient Presets
1. **Apple Aurora**: Radiant blend of Deep Indigo (`#1e1b4b`), Electric Violet (`#581c87`), and Teal Glow (`#0d9488`).
2. **Obsidian Studio**: Neutral graphite dark mesh with subtle central spotlight.
3. **Cyber Sunset**: Rich dusk orange (`#ea580c`) fading into midnight magenta (`#701a75`).
4. **Pure Alpha / Studio Minimal**: Neutral backdrop with soft 4K radial shadow.
