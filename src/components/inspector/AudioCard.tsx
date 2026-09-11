import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { NumberSlider } from '../common/NumberSlider';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { Volume2, Mic, Sliders } from 'lucide-react';

export function AudioCard() {
  const {
    project,
    setNoiseGateEnabled,
    setAutoDuckingEnabled,
    setAudioGain,
  } = useStudioStore();

  const { audioConfig } = project;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-zinc-500" />
          <span>Voice Clean & Polish</span>
        </label>

        <ToggleSwitch
          label="AI Noise Gate"
          description="Suppresses background room noise, HVAC hum, and keyboard clicks"
          checked={audioConfig.noiseGateEnabled}
          onChange={setNoiseGateEnabled}
        />

        <ToggleSwitch
          label="Smart Auto-Ducking"
          description="Automatically lowers background music by 14dB when voice is detected"
          checked={audioConfig.autoDuckingEnabled}
          onChange={setAutoDuckingEnabled}
        />

        <NumberSlider
          label="Microphone Gain"
          value={audioConfig.gainDb}
          min={-6}
          max={12}
          step={0.5}
          unit="dB"
          defaultValue={2.5}
          onChange={setAudioGain}
        />
      </div>
    </div>
  );
}
