import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { NumberSlider } from '../common/NumberSlider';
import { SegmentedControl } from '../common/SegmentedControl';
import { FrameType, AspectRatio } from '../../types/project';
import { AppWindow, Layers, Palette } from 'lucide-react';

export function CanvasCard() {
  const {
    project,
    setAspectRatio,
    setCanvasPadding,
    setCanvasCornerRadius,
    setBackgroundPreset,
    setFrameType,
    setFrameUrl,
  } = useStudioStore();

  const { canvas } = project;

  const meshPresets = [
    { id: 'apple_aurora', name: 'Aurora', color: 'from-indigo-900 to-purple-800' },
    { id: 'obsidian_studio', name: 'Obsidian', color: 'from-zinc-800 to-zinc-950' },
    { id: 'cyber_sunset', name: 'Sunset', color: 'from-orange-600 to-fuchsia-900' },
    { id: 'midnight_velvet', name: 'Midnight', color: 'from-blue-900 to-indigo-950' },
  ];

  return (
    <div className="space-y-5">
      {/* Frame Style Picker */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <AppWindow className="w-3.5 h-3.5 text-zinc-500" />
          <span>Window Frame</span>
        </label>

        <SegmentedControl<FrameType>
          size="sm"
          value={canvas.frame.type}
          onChange={setFrameType}
          options={[
            { value: 'safari', label: 'Safari' },
            { value: 'macos_clean', label: 'macOS' },
            { value: 'frameless', label: 'Clean' },
          ]}
        />

        {canvas.frame.type === 'safari' && (
          <div className="pt-1.5">
            <label className="text-[10px] text-zinc-500 font-medium">Browser Mockup URL</label>
            <input
              type="text"
              value={canvas.frame.url}
              onChange={(e) => setFrameUrl(e.target.value)}
              placeholder="https://yourapp.com"
              className="mt-1 w-full px-2.5 py-1.5 text-[11px] text-zinc-200 bg-white/[0.04] border border-white/[0.08] rounded-xl outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Mesh Gradient Presets */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-zinc-500" />
          <span>Studio Background</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {meshPresets.map((preset) => {
            const isSelected = canvas.background.preset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setBackgroundPreset(preset.id, [])}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500/80 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                    : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-gradient-to-tr ${preset.color} border border-white/20 shadow-sm`}
                />
                <span className="text-[11px] font-medium text-zinc-300">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Padding Slider */}
      <NumberSlider
        label="Canvas Padding"
        value={canvas.paddingPx}
        min={0}
        max={140}
        step={4}
        unit="px"
        defaultValue={48}
        onChange={setCanvasPadding}
      />

      {/* Corner Radius Slider */}
      <NumberSlider
        label="Corner Radius"
        value={canvas.cornerRadiusPx}
        min={0}
        max={48}
        step={2}
        unit="px"
        defaultValue={24}
        onChange={setCanvasCornerRadius}
      />
    </div>
  );
}
