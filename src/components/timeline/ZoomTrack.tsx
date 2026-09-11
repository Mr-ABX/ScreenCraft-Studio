import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { ZoomClip } from '../../types/project';
import { ZoomIn, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ZoomTrackProps {
  pixelsPerSecond: number;
}

export function ZoomTrack({ pixelsPerSecond }: ZoomTrackProps) {
  const {
    project,
    selectedZoomClipId,
    setSelectedZoomClipId,
    updateZoomClip,
    deleteZoomClip,
    addZoomClip,
    currentTime,
  } = useStudioStore();

  const { zoomClips } = project;

  const handleTrackDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const startTime = Math.max(0, clickX / pixelsPerSecond);

    addZoomClip({
      startTime,
      endTime: Math.min(project.durationSeconds, startTime + 6.0),
      zoomFactor: 2.0,
      focusTarget: { x: 0.5, y: 0.5 },
    });
  };

  return (
    <div
      onDoubleClick={handleTrackDoubleClick}
      title="Double click to add a new Zoom Keyframe block"
      className="relative h-10 w-full rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center overflow-hidden cursor-pointer group/track"
    >
      {/* Empty State Hint */}
      {zoomClips.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-600 pointer-events-none">
          Double-click to add auto-zoom keyframe
        </div>
      )}

      {/* Interactive Zoom Clips */}
      {zoomClips.map((clip) => {
        const left = clip.startTime * pixelsPerSecond;
        const width = (clip.endTime - clip.startTime) * pixelsPerSecond;
        const isSelected = selectedZoomClipId === clip.id;
        const isCurrentlyActive =
          currentTime >= clip.startTime && currentTime <= clip.endTime;

        return (
          <div
            key={clip.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedZoomClipId(clip.id);
            }}
            style={{
              left: `${left}px`,
              width: `${Math.max(32, width)}px`,
            }}
            className={`absolute h-8 rounded-lg flex items-center justify-between px-2 text-[11px] font-medium transition-all select-none group/clip ${
              isSelected
                ? 'bg-indigo-500/40 border-2 border-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.5)] z-20'
                : isCurrentlyActive
                ? 'bg-indigo-500/25 border border-indigo-400/60 shadow-sm z-10'
                : 'bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25'
            }`}
          >
            {/* Left Trim Handle */}
            <div className="w-1 h-4 rounded-full bg-white/30 group-hover/clip:bg-white/70 cursor-ew-resize -ml-1" />

            {/* Label */}
            <div className="flex items-center gap-1 text-indigo-200 truncate px-1">
              <ZoomIn className="w-3 h-3 text-indigo-300 flex-shrink-0" />
              <span className="font-mono text-[10px] font-bold">
                {clip.zoomFactor}x
              </span>
            </div>

            {/* Delete button on hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteZoomClip(clip.id);
              }}
              title="Delete Zoom Keyframe"
              className="opacity-0 group-hover/clip:opacity-100 p-0.5 rounded text-zinc-400 hover:text-white hover:bg-black/40 transition-opacity cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Right Trim Handle */}
            <div className="w-1 h-4 rounded-full bg-white/30 group-hover/clip:bg-white/70 cursor-ew-resize -mr-1" />
          </div>
        );
      })}
    </div>
  );
}
