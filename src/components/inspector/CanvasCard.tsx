import React, { useRef, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { NumberSlider } from '../common/NumberSlider';
import { SegmentedControl } from '../common/SegmentedControl';
import { FrameType, AspectRatio } from '../../types/project';
import { AppWindow, Layers, Palette, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

export function CanvasCard() {
  const {
    project,
    setAspectRatio,
    setCanvasPadding,
    setCanvasCornerRadius,
    setBackgroundPreset,
    setCustomBackgroundImage,
    setFrameType,
    setFrameUrl,
  } = useStudioStore();

  const { canvas } = project;
  const customBgRef = useRef<HTMLInputElement>(null);
  const [bgCategory, setBgCategory] = useState<'gradients' | 'wallpapers'>('gradients');

  const gradientPresets = [
    { id: 'apple_aurora', name: 'Aurora', color: 'from-indigo-900 via-purple-900 to-teal-800' },
    { id: 'obsidian_studio', name: 'Obsidian', color: 'from-zinc-800 to-zinc-950' },
    { id: 'cyber_sunset', name: 'Sunset', color: 'from-orange-600 via-purple-700 to-slate-900' },
    { id: 'midnight_velvet', name: 'Midnight', color: 'from-blue-900 via-indigo-950 to-black' },
    { id: 'cosmic_nebula', name: 'Nebula', color: 'from-pink-600 via-indigo-600 to-slate-900' },
    { id: 'emerald_isle', name: 'Emerald', color: 'from-emerald-800 via-teal-900 to-zinc-950' },
  ];

  const wallpaperPresets = [
    { id: 'cupertino_grid', name: 'Cupertino Grid', color: 'from-zinc-800 via-zinc-900 to-black' },
    { id: 'sonoma_waves', name: 'Sonoma Waves', color: 'from-orange-500 via-fuchsia-600 to-indigo-900' },
    { id: 'sequoia_mist', name: 'Sequoia Mist', color: 'from-sky-500 via-blue-700 to-slate-900' },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Canvas Aspect Ratio */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-zinc-500" />
          <span>Canvas Format</span>
        </label>

        <SegmentedControl<AspectRatio>
          size="sm"
          value={canvas.aspectRatio}
          onChange={setAspectRatio}
          options={[
            { value: '16:9', label: '16:9 (Landscape)' },
            { value: '9:16', label: '9:16 (Shorts)' },
            { value: '1:1', label: '1:1 (Square)' },
            { value: '4:5', label: '4:5 (Post)' },
          ]}
        />
      </div>

      <div className="w-full h-[1px] bg-white/[0.06]" />

      {/* 2. Window Frame Style */}
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

      <div className="w-full h-[1px] bg-white/[0.06]" />

      {/* 3. Non-Cropping Padding & Corner Radius */}
      <div className="space-y-3">
        <NumberSlider
          label="Canvas Padding (Outer Spacing)"
          value={canvas.paddingPx}
          min={0}
          max={140}
          step={4}
          unit="px"
          defaultValue={48}
          onChange={setCanvasPadding}
        />

        <NumberSlider
          label="Window Corner Radius"
          value={canvas.cornerRadiusPx}
          min={0}
          max={48}
          step={2}
          unit="px"
          defaultValue={24}
          onChange={setCanvasCornerRadius}
        />
      </div>

      <div className="w-full h-[1px] bg-white/[0.06]" />

      {/* 4. Studio Background Library */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-zinc-500" />
            <span>Studio Background</span>
          </label>

          <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setBgCategory('gradients')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                bgCategory === 'gradients'
                  ? 'bg-indigo-600/40 text-indigo-200 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Gradients
            </button>
            <button
              type="button"
              onClick={() => setBgCategory('wallpapers')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                bgCategory === 'wallpapers'
                  ? 'bg-indigo-600/40 text-indigo-200 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Wallpapers
            </button>
          </div>
        </div>

        {/* Preset Grid */}
        <div className="grid grid-cols-2 gap-2">
          {(bgCategory === 'gradients' ? gradientPresets : wallpaperPresets).map((preset) => {
            const isSelected =
              canvas.background.type === 'mesh_gradient' &&
              canvas.background.preset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setBackgroundPreset(preset.id, [])}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500/80 bg-indigo-500/15 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                    : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-gradient-to-tr ${preset.color} border border-white/20 shadow-sm shrink-0`}
                />
                <span className="text-[11px] font-medium text-zinc-300 truncate">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Image Upload Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => customBgRef.current?.click()}
            className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              canvas.background.type === 'custom_image'
                ? 'border-indigo-500/80 bg-indigo-500/20 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {canvas.background.type === 'custom_image'
                ? 'Custom Wallpaper Active (Replace)'
                : 'Upload Custom Background'}
            </span>
          </button>
          <input
            ref={customBgRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setCustomBackgroundImage(f);
            }}
          />
        </div>
      </div>
    </div>
  );
}
