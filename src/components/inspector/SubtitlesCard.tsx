import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { Captions, Wand2 } from 'lucide-react';

export function SubtitlesCard() {
  const { project, setSubtitlesEnabled, setSubtitleActiveColor } = useStudioStore();
  const { subtitles } = project;

  const highlightColors = [
    { label: 'Indigo', value: '#6366F1' },
    { label: 'Amber', value: '#F59E0B' },
    { label: 'Emerald', value: '#10B981' },
    { label: 'Rose', value: '#F43F5E' },
    { label: 'Cyan', value: '#06B6D4' },
  ];

  return (
    <div className="space-y-5">
      <ToggleSwitch
        label="AI Kinetic Subtitles"
        description="Word-by-word animated subtitles powered by local Whisper AI"
        checked={subtitles.enabled}
        onChange={setSubtitlesEnabled}
      />

      {subtitles.enabled && (
        <div className="space-y-4 pt-2">
          {/* Highlight Color Swatches */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Active Word Glow Color</span>
            </label>

            <div className="flex items-center gap-2">
              {highlightColors.map((color) => {
                const isSelected = subtitles.activeWordColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSubtitleActiveColor(color.value)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform cursor-pointer ${
                      isSelected
                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400 space-y-1">
            <div className="text-zinc-200 font-medium flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>100% Private On-Device AI</span>
            </div>
            <p>
              Transcription runs locally on your machine via WebAssembly / Metal. Zero audio data is sent to external servers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
