import React from 'react';
import { Film, Image as ImageIcon } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';

interface VideoTrackProps {
  pixelsPerSecond: number;
  duration: number;
}

export function VideoTrack({ pixelsPerSecond, duration }: VideoTrackProps) {
  const { videoThumbnails, project } = useStudioStore();
  const width = Math.max(100, duration * pixelsPerSecond);
  const numSlots = Math.max(1, Math.ceil(width / 80));

  const hasRealThumbnails = videoThumbnails && videoThumbnails.length > 0;

  return (
    <div
      style={{ width: `${width}px` }}
      className="relative h-14 rounded-xl bg-zinc-950/90 border border-white/[0.1] flex items-center overflow-hidden select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.5)] group/vtrack"
    >
      {/* 1. Filmstrip Thumbnails Layer */}
      <div className="absolute inset-0 flex w-full h-full">
        {hasRealThumbnails ? (
          Array.from({ length: numSlots }).map((_, i) => {
            const thumbIndex = Math.min(
              videoThumbnails.length - 1,
              Math.floor((i / numSlots) * videoThumbnails.length)
            );
            const thumbUrl = videoThumbnails[thumbIndex];

            return (
              <div
                key={i}
                className="relative flex-1 h-full min-w-[70px] border-r border-black/40 overflow-hidden bg-zinc-900"
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={`Frame ${i}`}
                    className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity pointer-events-none"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900/60">
                    <Film className="w-3.5 h-3.5 text-zinc-600 opacity-40" />
                  </div>
                )}
                {/* Film Perforation Overlay */}
                <div className="absolute inset-y-0 left-0 w-[2px] bg-white/[0.04]" />
              </div>
            );
          })
        ) : (
          /* Demo / Fallback Filmstrip */
          Array.from({ length: numSlots }).map((_, i) => (
            <div
              key={i}
              className="flex-1 min-w-[64px] h-full border-r border-white/[0.04] bg-gradient-to-b from-indigo-950/30 via-zinc-900/40 to-transparent flex items-center justify-center text-[9px] text-zinc-600 font-mono"
            >
              <Film className="w-3.5 h-3.5 opacity-25 text-indigo-400" />
            </div>
          ))
        )}
      </div>

      {/* 2. Top Filmstrip Sprocket Simulation Line */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />

      {/* 3. Track Label Badge */}
      <div className="relative z-10 ml-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-zinc-200 flex items-center gap-1.5 shadow-lg">
        <Film className="w-3.5 h-3.5 text-indigo-400" />
        <span className="truncate max-w-[200px]">
          {project.title || 'Screen Video Track'}
        </span>
        {hasRealThumbnails && (
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded">
            Live Frames
          </span>
        )}
      </div>
    </div>
  );
}

