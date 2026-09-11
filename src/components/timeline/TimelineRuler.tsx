import React from 'react';

interface TimelineRulerProps {
  duration: number;
  pixelsPerSecond: number;
}

export function TimelineRuler({ duration, pixelsPerSecond }: TimelineRulerProps) {
  const totalWidth = duration * pixelsPerSecond;
  const majorIntervalSeconds = 5; // Major mark every 5s
  const numMarkers = Math.ceil(duration / majorIntervalSeconds);

  return (
    <div
      className="relative h-6 border-b border-white/[0.08] bg-white/[0.02] select-none"
      style={{ width: `${totalWidth}px` }}
    >
      {Array.from({ length: numMarkers }).map((_, i) => {
        const time = i * majorIntervalSeconds;
        const left = time * pixelsPerSecond;

        const mins = Math.floor(time / 60);
        const secs = time % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        return (
          <div
            key={i}
            className="absolute top-0 flex flex-col items-start"
            style={{ left: `${left}px` }}
          >
            <div className="h-2 w-[1px] bg-white/[0.25]" />
            <span className="text-[9px] font-mono text-zinc-500 pl-1 -mt-0.5">
              {formatted}
            </span>
          </div>
        );
      })}
    </div>
  );
}
