import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { NumberSlider } from '../common/NumberSlider';
import { Sparkles, Sun, Eye, Layers } from 'lucide-react';

export function EffectsCard() {
  const { project, setEffectsConfig } = useStudioStore();
  const effects = project.effects || {
    motionBlur: true,
    vignetteIntensity: 0.2,
    backgroundBlurPx: 0,
    cameraShake: false,
  };

  return (
    <div className="space-y-5">
      {/* Motion Blur */}
      <div className="space-y-3">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Cinematic Camera Motion</span>
        </label>

        <ToggleSwitch
          label="Motion-Adaptive Blur"
          description="Renders natural directional velocity blur during camera glide & zoom transitions"
          checked={effects.motionBlur}
          onChange={(val) => setEffectsConfig({ motionBlur: val })}
        />

        <ToggleSwitch
          label="Subtle Camera Breathing"
          description="Adds organic micromotions to prevent the 3D window from feeling static"
          checked={effects.cameraShake}
          onChange={(val) => setEffectsConfig({ cameraShake: val })}
        />
      </div>

      <div className="w-full h-[1px] bg-white/[0.06]" />

      {/* Studio Lighting & Vignette */}
      <div className="space-y-3">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Studio Lighting & Optics</span>
        </label>

        <NumberSlider
          label="Vignette Edge Falloff"
          value={Math.round(effects.vignetteIntensity * 100)}
          min={0}
          max={100}
          step={5}
          unit="%"
          defaultValue={20}
          onChange={(val) => setEffectsConfig({ vignetteIntensity: val / 100 })}
        />

        <NumberSlider
          label="Background Depth-of-Field Blur"
          value={effects.backgroundBlurPx}
          min={0}
          max={32}
          step={2}
          unit="px"
          defaultValue={0}
          onChange={(val) => setEffectsConfig({ backgroundBlurPx: val })}
        />
      </div>
    </div>
  );
}
