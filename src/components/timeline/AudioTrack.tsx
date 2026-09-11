import { Mic } from 'lucide-react';

interface AudioTrackProps {
  pixelsPerSecond: number;
  duration: number;
}

export function AudioTrack({ pixelsPerSecond, duration }: AudioTrackProps) {
  const width = duration * pixelsPerSecond;
  const numBars = Math.floor(width / 4);

  return (
    <div
      style={{ width: `${width}px` }}
      className="relative h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center px-2 overflow-hidden select-none"
    >
      {/* Waveform Bars */}
      <div className="absolute inset-0 flex items-center gap-[2px] px-2 opacity-60">
        {Array.from({ length: numBars }).map((_, i) => {
          // Generate a pseudo-random voice waveform pattern
          const seed = Math.sin(i * 0.3) * Math.cos(i * 0.7);
          const heightPercent = Math.max(15, Math.abs(seed) * 85);

          return (
            <div
              key={i}
              className="w-[2px] rounded-full bg-indigo-400/70"
              style={{ height: `${heightPercent}%` }}
            />
          );
        })}
      </div>

      {/* Track Label Badge */}
      <div className="relative z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-zinc-300 flex items-center gap-1.5 shadow-sm">
        <Mic className="w-3 h-3 text-indigo-400" />
        <span>Studio Audio Track</span>
      </div>
    </div>
  );
}
