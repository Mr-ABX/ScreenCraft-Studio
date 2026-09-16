import React, { useRef, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { ZoomClip } from '../../types/project';
import { ZoomIn, X, GripVertical } from 'lucide-react';

interface ZoomTrackProps {
  pixelsPerSecond: number;
}

type DragMode = 'move' | 'trim-start' | 'trim-end' | null;

interface DragState {
  clipId: string;
  mode: DragMode;
  startX: number;
  initialStartTime: number;
  initialEndTime: number;
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
  const [dragState, setDragState] = useState<DragState | null>(null);

  const handleTrackDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const startTime = Math.max(0, clickX / pixelsPerSecond);

    addZoomClip({
      startTime: Math.round(startTime * 10) / 10,
      endTime: Math.min(
        project.durationSeconds,
        Math.round((startTime + 4.0) * 10) / 10
      ),
      zoomFactor: project.camera.defaultZoomFactor || 2.0,
      focusTarget: { x: 0.5, y: 0.5 },
    });
  };

  const startDragging = (
    e: React.PointerEvent<HTMLDivElement>,
    clip: ZoomClip,
    mode: DragMode
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    setSelectedZoomClipId(clip.id);
    setDragState({
      clipId: clip.id,
      mode,
      startX: e.clientX,
      initialStartTime: clip.startTime,
      initialEndTime: clip.endTime,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaTime = deltaX / pixelsPerSecond;
    const { initialStartTime, initialEndTime, mode, clipId } = dragState;

    const minDuration = 0.4;
    const maxProjectDuration = project.durationSeconds > 0 ? project.durationSeconds : 300;

    if (mode === 'trim-start') {
      const newStart = Math.max(
        0,
        Math.min(initialEndTime - minDuration, initialStartTime + deltaTime)
      );
      updateZoomClip(clipId, {
        startTime: Math.round(newStart * 100) / 100,
      });
    } else if (mode === 'trim-end') {
      const newEnd = Math.min(
        maxProjectDuration,
        Math.max(initialStartTime + minDuration, initialEndTime + deltaTime)
      );
      updateZoomClip(clipId, {
        endTime: Math.round(newEnd * 100) / 100,
      });
    } else if (mode === 'move') {
      const duration = initialEndTime - initialStartTime;
      let newStart = initialStartTime + deltaTime;
      let newEnd = newStart + duration;

      if (newStart < 0) {
        newStart = 0;
        newEnd = duration;
      } else if (newEnd > maxProjectDuration) {
        newEnd = maxProjectDuration;
        newStart = Math.max(0, maxProjectDuration - duration);
      }

      updateZoomClip(clipId, {
        startTime: Math.round(newStart * 100) / 100,
        endTime: Math.round(newEnd * 100) / 100,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDragState(null);
    }
  };

  return (
    <div
      onDoubleClick={handleTrackDoubleClick}
      title="Double click to add a new Zoom Keyframe block"
      className="relative h-10 w-full rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center overflow-hidden cursor-pointer group/track"
    >
      {/* Empty State Hint */}
      {zoomClips.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-600 pointer-events-none font-medium">
          Double-click track or press <kbd className="px-1 py-0.5 rounded bg-white/10 text-zinc-400 font-mono text-[9px] mx-1">Z</kbd> to add zoom keyframe
        </div>
      )}

      {/* Interactive Zoom Clips */}
      {zoomClips.map((clip) => {
        const left = clip.startTime * pixelsPerSecond;
        const width = (clip.endTime - clip.startTime) * pixelsPerSecond;
        const isSelected = selectedZoomClipId === clip.id;
        const isCurrentlyActive =
          currentTime >= clip.startTime && currentTime <= clip.endTime;
        const clipDuration = (clip.endTime - clip.startTime).toFixed(1);

        return (
          <div
            key={clip.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedZoomClipId(clip.id);
            }}
            onPointerDown={(e) => startDragging(e, clip, 'move')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              left: `${left}px`,
              width: `${Math.max(36, width)}px`,
            }}
            className={`absolute h-8 rounded-lg flex items-center justify-between px-1.5 text-[11px] font-medium transition-shadow select-none group/clip cursor-grab active:cursor-grabbing ${
              isSelected
                ? 'bg-indigo-500/40 border-2 border-indigo-400 shadow-[0_0_18px_rgba(99,102,241,0.55)] z-20'
                : isCurrentlyActive
                ? 'bg-indigo-500/25 border border-indigo-400/60 shadow-sm z-10'
                : 'bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25'
            }`}
          >
            {/* Left Trim Handle (Drag Start Time) */}
            <div
              onPointerDown={(e) => startDragging(e, clip, 'trim-start')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              title="Drag to trim start time"
              className="w-2.5 h-full -ml-1.5 flex items-center justify-center cursor-ew-resize group/lhandle hover:bg-indigo-400/30 rounded-l-md transition-colors"
            >
              <div className="w-1 h-3.5 rounded-full bg-white/40 group-hover/lhandle:bg-white group-hover/lhandle:scale-110 transition-all" />
            </div>

            {/* Label & Zoom Details */}
            <div className="flex items-center gap-1.5 text-indigo-200 truncate px-1 pointer-events-none">
              <ZoomIn className="w-3 h-3 text-indigo-300 flex-shrink-0" />
              <span className="font-mono text-[10px] font-bold">
                {clip.zoomFactor}x
              </span>
              <span className="text-[9px] text-indigo-300/60 font-mono hidden sm:inline">
                {clipDuration}s
              </span>
            </div>

            {/* Delete button on hover */}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                deleteZoomClip(clip.id);
              }}
              title="Delete Zoom Keyframe"
              className="opacity-0 group-hover/clip:opacity-100 p-0.5 rounded text-zinc-400 hover:text-white hover:bg-black/50 transition-opacity cursor-pointer flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Right Trim Handle (Drag End Time) */}
            <div
              onPointerDown={(e) => startDragging(e, clip, 'trim-end')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              title="Drag to trim end time"
              className="w-2.5 h-full -mr-1.5 flex items-center justify-center cursor-ew-resize group/rhandle hover:bg-indigo-400/30 rounded-r-md transition-colors"
            >
              <div className="w-1 h-3.5 rounded-full bg-white/40 group-hover/rhandle:bg-white group-hover/rhandle:scale-110 transition-all" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
