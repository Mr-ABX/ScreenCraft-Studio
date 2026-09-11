import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { NumberSlider } from '../common/NumberSlider';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { SegmentedControl } from '../common/SegmentedControl';
import { CursorStyle } from '../../types/project';
import { MousePointer, Sparkles, Wand2 } from 'lucide-react';

export function CursorCard() {
  const {
    project,
    setCursorStyle,
    setCursorScale,
    setClickEffectEnabled,
    setMotionBlurEnabled,
  } = useStudioStore();

  const { cursor } = project;

  return (
    <div className="space-y-5">
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
  );
}
