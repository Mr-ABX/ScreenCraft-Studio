import React, { useState } from 'react';
import { Film, Scissors, Copy, Trash2, Split } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { VideoClip } from '../../types/project';

interface VideoTrackProps {
  pixelsPerSecond: number;
  duration: number;
}

type DragMode = 'move' | 'trim-start' | 'trim-end' | null;

interface DragState {
  clipId: string;
  mode: DragMode;
  startX: number;
  initialTimelineStart: number;
  initialSourceStart: number;
  initialDuration: number;
}

export function VideoTrack({ pixelsPerSecond, duration }: VideoTrackProps) {
  const {
    videoThumbnails,
    project,
    selectedVideoClipId,
    setSelectedVideoClipId,
    updateVideoClip,
    deleteVideoClip,
    duplicateClip,
    splitAtPlayhead,
    currentTime,
  } = useStudioStore();

  const [dragState, setDragState] = useState<DragState | null>(null);

  const clips: VideoClip[] =
    project.videoClips.length > 0
      ? project.videoClips
      : [
          {
            id: 'default_video_clip',
            sourceFile: project.title || 'video.mp4',
            timelineStart: 0,
            sourceStart: 0,
            duration: duration,
            playbackRate: 1.0,
          },
        ];

  const totalWidth = Math.max(100, duration * pixelsPerSecond);
  const hasRealThumbnails = videoThumbnails && videoThumbnails.length > 0;
  const sourceTotalDuration = project.videoMetadata?.duration || duration || 30;

  const startDragging = (
    e: React.PointerEvent<HTMLDivElement>,
    clip: VideoClip,
    mode: DragMode
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    setSelectedVideoClipId(clip.id);
    setDragState({
      clipId: clip.id,
      mode,
      startX: e.clientX,
      initialTimelineStart: clip.timelineStart,
      initialSourceStart: clip.sourceStart,
      initialDuration: clip.duration,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaTime = deltaX / pixelsPerSecond;
    const { initialTimelineStart, initialSourceStart, initialDuration, mode, clipId } = dragState;

    const minDuration = 0.3;

    if (mode === 'trim-start') {
      const allowedDelta = Math.min(deltaTime, initialDuration - minDuration);
      const newTimelineStart = Math.max(0, initialTimelineStart + allowedDelta);
      const newSourceStart = Math.max(0, initialSourceStart + allowedDelta);
      const newDuration = Math.max(minDuration, initialDuration - allowedDelta);

      updateVideoClip(clipId, {
        timelineStart: Math.round(newTimelineStart * 100) / 100,
        sourceStart: Math.round(newSourceStart * 100) / 100,
        duration: Math.round(newDuration * 100) / 100,
      });
    } else if (mode === 'trim-end') {
      const newDuration = Math.max(minDuration, initialDuration + deltaTime);
      updateVideoClip(clipId, {
        duration: Math.round(newDuration * 100) / 100,
      });
    } else if (mode === 'move') {
      const newTimelineStart = Math.max(0, initialTimelineStart + deltaTime);
      updateVideoClip(clipId, {
        timelineStart: Math.round(newTimelineStart * 100) / 100,
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
      style={{ width: `${totalWidth}px` }}
      className="relative h-14 w-full flex items-center select-none group/vtrack"
    >
      {clips.map((clip, index) => {
        const left = clip.timelineStart * pixelsPerSecond;
        const clipWidth = Math.max(28, clip.duration * pixelsPerSecond);
        const isSelected = selectedVideoClipId === clip.id;
        const numThumbSlots = Math.max(1, Math.ceil(clipWidth / 72));

        return (
          <div
            key={clip.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedVideoClipId(clip.id);
            }}
            onPointerDown={(e) => startDragging(e, clip, 'move')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              left: `${left}px`,
              width: `${clipWidth}px`,
            }}
            className={`absolute top-0 bottom-0 rounded-xl overflow-hidden flex items-center transition-shadow cursor-grab active:cursor-grabbing bg-zinc-950/90 border ${
              isSelected
                ? 'border-indigo-400 shadow-[0_0_18px_rgba(99,102,241,0.6),inset_0_0_0_1px_#818cf8] z-20'
                : 'border-white/[0.12] hover:border-white/30 shadow-md z-10'
            }`}
          >
            {/* Filmstrip Thumbnails inside Clip */}
            <div className="absolute inset-0 flex w-full h-full pointer-events-none opacity-90">
              {hasRealThumbnails ? (
                Array.from({ length: numThumbSlots }).map((_, i) => {
                  const clipProgress = i / numThumbSlots;
                  const sourceTimeInClip = clip.sourceStart + clipProgress * clip.duration;
                  const globalProgress = Math.max(
                    0,
                    Math.min(1, sourceTimeInClip / (sourceTotalDuration || 1))
                  );
                  const thumbIndex = Math.min(
                    videoThumbnails.length - 1,
                    Math.floor(globalProgress * videoThumbnails.length)
                  );
                  const thumbUrl = videoThumbnails[thumbIndex];

                  return (
                    <div
                      key={i}
                      className="relative flex-1 h-full min-w-[60px] border-r border-black/40 overflow-hidden bg-zinc-900"
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900/60">
                          <Film className="w-3.5 h-3.5 text-zinc-600 opacity-40" />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                /* Fallback striped filmstrip */
                Array.from({ length: numThumbSlots }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-[60px] h-full border-r border-white/[0.04] bg-gradient-to-b from-indigo-950/30 via-zinc-900/40 to-transparent flex items-center justify-center"
                  >
                    <Film className="w-3.5 h-3.5 opacity-20 text-indigo-400" />
                  </div>
                ))
              )}
            </div>

            {/* Left Trim Handle (Head) */}
            <div
              onPointerDown={(e) => startDragging(e, clip, 'trim-start')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              title="Drag to trim clip start (Q)"
              className="absolute left-0 top-0 bottom-0 w-3 z-30 flex items-center justify-center cursor-ew-resize group/lhandle hover:bg-indigo-500/40 rounded-l-xl transition-colors"
            >
              <div className="w-1 h-5 rounded-full bg-white/50 group-hover/lhandle:bg-white group-hover/lhandle:scale-125 transition-all" />
            </div>

            {/* Clip Label Badge */}
            <div className="relative z-20 ml-3.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-zinc-200 flex items-center gap-1.5 shadow-md pointer-events-none max-w-[calc(100%-36px)] truncate">
              <Film className="w-3 h-3 text-indigo-400 flex-shrink-0" />
              <span className="truncate">
                Clip {index + 1} ({clip.duration.toFixed(1)}s)
              </span>
            </div>

            {/* Clip Context Quick Actions on Hover */}
            {isSelected && (
              <div className="absolute right-3.5 top-1.5 z-20 flex items-center gap-1 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/20 shadow-lg">
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    splitAtPlayhead();
                  }}
                  title="Split at Playhead (S)"
                  className="p-1 hover:text-indigo-300 text-zinc-400 hover:bg-white/10 rounded transition-colors cursor-pointer"
                >
                  <Scissors className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateClip(clip.id);
                  }}
                  title="Duplicate Clip (D)"
                  className="p-1 hover:text-indigo-300 text-zinc-400 hover:bg-white/10 rounded transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {clips.length > 1 && (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteVideoClip(clip.id);
                    }}
                    title="Delete Clip (Del)"
                    className="p-1 hover:text-rose-400 text-zinc-400 hover:bg-rose-500/20 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Right Trim Handle (Tail) */}
            <div
              onPointerDown={(e) => startDragging(e, clip, 'trim-end')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              title="Drag to trim clip end (W)"
              className="absolute right-0 top-0 bottom-0 w-3 z-30 flex items-center justify-center cursor-ew-resize group/rhandle hover:bg-indigo-500/40 rounded-r-xl transition-colors"
            >
              <div className="w-1 h-5 rounded-full bg-white/50 group-hover/rhandle:bg-white group-hover/rhandle:scale-125 transition-all" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

