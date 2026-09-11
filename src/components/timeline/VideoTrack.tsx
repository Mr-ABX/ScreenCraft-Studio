import { Film } from 'lucide-react';

interface VideoTrackProps {
  pixelsPerSecond: number;
  duration: number;
}

export function VideoTrack({ pixelsPerSecond, duration }: VideoTrackProps) {
  const width = duration * pixelsPerSecond;
  const numThumbnails = Math.ceil(width / 64);

  return (
    <div
      style={{ width: `${width}px` }}
      className="relative h-12 rounded-xl bg-zinc-900/90 border border-white/[0.08] flex items-center overflow-hidden select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
    >
      {/* Thumbnail Frames Simulation */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: numThumbnails }).map((_, i) => (
          <div
            key={i}
            className="w-16 h-full border-r border-white/[0.04] bg-gradient-to-b from-white/[0.03] to-transparent flex items-center justify-center text-[9px] text-zinc-600 font-mono"
          >
            <Film className="w-3 h-3 opacity-20" />
          </div>
        ))}
      </div>

      {/* Track Label Badge */}
      <div className="relative z-10 ml-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-zinc-300 flex items-center gap-1.5 shadow-sm">
        <Film className="w-3 h-3 text-indigo-400" />
        <span>4K Screen Video Track (60 FPS)</span>
      </div>
    </div>
  );
}
