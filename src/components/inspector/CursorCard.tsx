import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { NumberSlider } from '../common/NumberSlider';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { SegmentedControl } from '../common/SegmentedControl';
import { CursorStyle } from '../../types/project';
import { MousePointer, Sparkles, Activity, Eye, EyeOff } from 'lucide-react';

export function CursorCard() {
  const {
    project,
    setCursorShowOverlay,
    setCursorStyle,
    setCursorScale,
    setClickEffectEnabled,
    setMotionBlurEnabled,
  } = useStudioStore();

  const { cursor, mouseTelemetry } = project;
  const hasTelemetry = mouseTelemetry && mouseTelemetry.length > 0;

  return (
    <div className="space-y-5">
      {/* Telemetry Status Banner */}
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${hasTelemetry ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
          <div>
            <div className="text-xs font-semibold text-white">
              {hasTelemetry ? 'Active Pointer Telemetry' : 'Baked Pixel Cursor'}
            </div>
            <div className="text-[10px] text-zinc-400">
              {hasTelemetry
                ? `${mouseTelemetry.length} motion & click samples synced`
                : 'Raw video (cursor recorded in video frames)'}
            </div>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
            hasTelemetry
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}
        >
          {hasTelemetry ? 'TELEMETRY' : 'BAKED'}
        </span>
      </div>

      {/* Main Overlay Toggle */}
      <ToggleSwitch
        label="Vector Cursor Overlay"
        description="Renders high-DPI vector cursor with animated click halos on top of the video"
        checked={cursor.showOverlay}
        onChange={setCursorShowOverlay}
      />

      {cursor.showOverlay ? (
        <div className="space-y-5 pt-1">
          {/* Cursor Style */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-zinc-500" />
              <span>Vector Cursor Style</span>
            </label>

            <SegmentedControl<CursorStyle>
              size="sm"
              value={cursor.style}
              onChange={setCursorStyle}
              options={[
                { value: 'macos_arrow', label: 'macOS' },
                { value: 'pointer', label: 'Hand' },
                { value: 'glow_dot', label: 'Dot' },
              ]}
            />
          </div>

          {/* Cursor Scale Slider */}
          <NumberSlider
            label="Cursor Scale"
            value={cursor.scale}
            min={1.0}
            max={2.5}
            step={0.1}
            unit="x"
            defaultValue={1.4}
            onChange={setCursorScale}
          />

          <div className="w-full h-[1px] bg-white/[0.06]" />

          {/* Visual Effects */}
          <div className="space-y-3">
            <ToggleSwitch
              label="Click Shockwave Halo"
              description="Renders expanding animated halo ring on every click"
              checked={cursor.clickEffect.enabled}
              onChange={setClickEffectEnabled}
            />

            <ToggleSwitch
              label="Motion-Adaptive Blur"
              description="Adds natural velocity blur during quick mouse gestures"
              checked={cursor.motionBlurEnabled}
              onChange={setMotionBlurEnabled}
            />

            <ToggleSwitch
              label="Catmull-Rom Smoothing"
              description="Replaces jittery mouse trails with smooth vector splines"
              checked={cursor.smoothingEnabled}
              onChange={() => {}}
            />
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-zinc-400 flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>
            Vector overlay is hidden to prevent double-cursor conflicts on uploaded recordings.
          </span>
        </div>
      )}
    </div>
  );
}

