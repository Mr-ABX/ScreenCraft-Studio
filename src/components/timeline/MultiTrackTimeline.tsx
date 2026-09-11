import React, { useRef, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { TimelineRuler } from './TimelineRuler';
import { ZoomTrack } from './ZoomTrack';
import { VideoTrack } from './VideoTrack';
import { CaptionsTrack } from './CaptionsTrack';
import { AudioTrack } from './AudioTrack';
import {
  Scissors,
  Trash2,
  ZoomIn,
  ZoomOut,
  Magnet,
  Sparkles,
  Plus,
} from 'lucide-react';

export function MultiTrackTimeline() {
  const {
    project,
    currentTime,
    seek,
    addZoomClip,
    selectedZoomClipId,
    deleteZoomClip,
  } = useStudioStore();

  const [pixelsPerSecond, setPixelsPerSecond] = useState(24); // Zoom scale
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetTime = Math.max(
      0,
      Math.min(project.durationSeconds, clickX / pixelsPerSecond)
    );
    seek(targetTime);
  };

  const playheadPosition = currentTime * pixelsPerSecond;

  return (
    <div className="h-56 w-full flex flex-col border-t border-white/[0.08] bg-[#09090c]/95 backdrop-blur-2xl select-none z-20">
      {/* Timeline Toolbar Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02]">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          {/* Add Zoom Keyframe */}
          <button
            type="button"
            onClick={() =>
              addZoomClip({
                startTime: currentTime,
                endTime: Math.min(project.durationSeconds, currentTime + 5.0),
                zoomFactor: 2.0,
                focusTarget: { x: 0.5, y: 0.5 },
              })
            }
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg text-indigo-200 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 text-indigo-300" />
            <span>Add Auto-Zoom</span>
          </button>

          {/* Split Clip */}
          <button
            type="button"
            title="Split Clip at Playhead (⌘B)"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>

          {/* Delete Selected */}
          <button
            type="button"
            disabled={!selectedZoomClipId}
            onClick={() => {
              if (selectedZoomClipId) {
                deleteZoomClip(selectedZoomClipId);
              }
            }}
            title="Delete Selected Keyframe (Del)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedZoomClipId
                ? 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10'
                : 'text-zinc-700 opacity-40 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Zoom Scaling */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPixelsPerSecond((p) => Math.max(12, p - 6))}
            title="Zoom Out Timeline"
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[10px] text-zinc-500 w-8 text-center">
            {pixelsPerSecond}px/s
          </span>

          <button
            type="button"
            onClick={() => setPixelsPerSecond((p) => Math.min(80, p + 6))}
            title="Zoom In Timeline"
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Multi-Track Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Column) */}
        <div className="w-36 flex flex-col border-r border-white/[0.06] bg-[#070709] py-2 px-3 space-y-2 text-[11px] font-medium text-zinc-400 select-none z-10 flex-shrink-0">
          <div className="h-6 flex items-center text-[10px] uppercase text-zinc-600 tracking-wider">
            Tracks
          </div>
          <div className="h-10 flex items-center text-indigo-300 gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Camera Zoom</span>
          </div>
          <div className="h-12 flex items-center text-zinc-300 gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span>Screen Video</span>
          </div>
          {project.subtitles.enabled && (
            <div className="h-8 flex items-center text-amber-300 gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>AI Captions</span>
            </div>
          )}
          <div className="h-10 flex items-center text-indigo-300 gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Studio Audio</span>
          </div>
        </div>

        {/* Scrollable Tracks & Ruler (Right Column) */}
        <div
          ref={timelineScrollRef}
          onClick={handleTimelineClick}
          className="flex-1 overflow-x-auto overflow-y-hidden relative select-none cursor-pointer"
        >
          {/* Playhead Indicator (The Apple Diamond Needle) */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
            style={{ left: `${playheadPosition}px` }}
          >
            {/* Diamond Top Cap */}
            <div className="w-3 h-3 bg-indigo-400 border border-white rotate-45 -mt-1 shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
            {/* Vertical Needle Line */}
            <div className="w-[2px] flex-1 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          </div>

          <div
            className="flex flex-col py-2 px-2 space-y-2"
            style={{ width: `${project.durationSeconds * pixelsPerSecond + 120}px` }}
          >
            {/* Top Timecode Ruler */}
            <TimelineRuler
              duration={project.durationSeconds}
              pixelsPerSecond={pixelsPerSecond}
            />

            {/* Track 1: Zoom Keyframes */}
            <ZoomTrack pixelsPerSecond={pixelsPerSecond} />

            {/* Track 2: Screen Video */}
            <VideoTrack
              pixelsPerSecond={pixelsPerSecond}
              duration={project.durationSeconds}
            />

            {/* Track 3: Captions */}
            <CaptionsTrack pixelsPerSecond={pixelsPerSecond} />

            {/* Track 4: Audio Waveform */}
            <AudioTrack
              pixelsPerSecond={pixelsPerSecond}
              duration={project.durationSeconds}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
