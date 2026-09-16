import React, { useEffect, useRef, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { TimelineRuler } from './TimelineRuler';
import { ZoomTrack } from './ZoomTrack';
import { VideoTrack } from './VideoTrack';
import { CaptionsTrack } from './CaptionsTrack';
import { AudioTrack } from './AudioTrack';
import { TimelineContextMenu, ContextMenuState } from './TimelineContextMenu';
import {
  Scissors,
  Trash2,
  ZoomIn,
  ZoomOut,
  Wand2,
  Plus,
  Copy,
  RotateCcw,
  RotateCw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
} from 'lucide-react';

export function MultiTrackTimeline() {
  const {
    project,
    currentTime,
    seek,
    addZoomClip,
    selectedZoomClipId,
    selectedVideoClipId,
    deleteZoomClip,
    deleteVideoClip,
    splitAtPlayhead,
    duplicateClip,
    adjustZoomScale,
    suggestSmartAutoZooms,
    undo,
    redo,
    canUndo,
    canRedo,
    toggleTrackVisibility,
  } = useStudioStore();

  const [pixelsPerSecond, setPixelsPerSecond] = useState(24);
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const headersScrollRef = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    targetType: 'track',
  });

  const trackVis = project.trackVisibility || {
    zoom: true,
    video: true,
    captions: true,
    audio: true,
  };

  // Synchronize vertical scroll between track headers and timeline content
  const handleVerticalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headersScrollRef.current) {
      headersScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Global Keyboard Shortcuts (S, D, Z, Del, Cmd+Z, Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmd = isMac ? e.metaKey : e.ctrlKey;

      if (isCmd && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (isCmd && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        splitAtPlayhead();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        duplicateClip();
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        addZoomClip({
          startTime: Math.round(currentTime * 10) / 10,
          endTime: Math.min(
            project.durationSeconds,
            Math.round((currentTime + 4.0) * 10) / 10
          ),
          zoomFactor: project.camera.defaultZoomFactor || 2.0,
          focusTarget: { x: 0.5, y: 0.5 },
        });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedZoomClipId) {
          e.preventDefault();
          deleteZoomClip(selectedZoomClipId);
        } else if (selectedVideoClipId) {
          e.preventDefault();
          deleteVideoClip(selectedVideoClipId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    splitAtPlayhead,
    duplicateClip,
    addZoomClip,
    undo,
    redo,
    currentTime,
    project.durationSeconds,
    project.camera.defaultZoomFactor,
    selectedZoomClipId,
    selectedVideoClipId,
    deleteZoomClip,
    deleteVideoClip,
  ]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetTime = Math.max(
      0,
      Math.min(project.durationSeconds, clickX / pixelsPerSecond)
    );
    seek(targetTime);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = timelineScrollRef.current?.getBoundingClientRect();
    const clickX = rect ? e.clientX - rect.left : 0;
    const clickTime = Math.max(
      0,
      Math.min(project.durationSeconds, clickX / pixelsPerSecond)
    );

    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      targetType: selectedZoomClipId ? 'zoom' : selectedVideoClipId ? 'video' : 'track',
      clipId: selectedZoomClipId || selectedVideoClipId || undefined,
      clickTime,
    });
  };

  const playheadPosition = currentTime * pixelsPerSecond;

  if (project.durationSeconds <= 0) {
    return (
      <div className="h-28 w-full flex items-center justify-center border-t border-white/[0.08] bg-[#09090c]/95 backdrop-blur-2xl text-xs text-zinc-500 select-none">
        Import a video, record your screen, or load the demo project to activate the multi-track timeline editor.
      </div>
    );
  }

  const activeZoomClip =
    project.zoomClips.find((z) => z.id === selectedZoomClipId) ||
    project.zoomClips.find(
      (z) => currentTime >= z.startTime && currentTime <= z.endTime
    );

  return (
    <div
      onContextMenu={handleContextMenu}
      className="h-64 w-full flex flex-col border-t border-white/[0.08] bg-[#09090c]/95 backdrop-blur-2xl select-none z-20 relative"
    >
      {/* Timeline Toolbar Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02]">
        {/* Left Actions: Split, Undo, Redo, Duplicate, Delete, Add Zoom */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Split / Blade Tool */}
          <button
            type="button"
            onClick={() => splitAtPlayhead()}
            title="Split Clip at Playhead (S)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg text-zinc-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-colors cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>Split</span>
            <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-black/40 text-[9px] text-zinc-400 font-mono">
              S
            </kbd>
          </button>

          {/* Undo */}
          <button
            type="button"
            disabled={!canUndo}
            onClick={() => undo()}
            title="Undo (Cmd+Z)"
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer ${
              canUndo
                ? 'text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08]'
                : 'text-zinc-600 border-transparent opacity-40 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Undo</span>
          </button>

          {/* Redo */}
          <button
            type="button"
            disabled={!canRedo}
            onClick={() => redo()}
            title="Redo (Cmd+Shift+Z)"
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer ${
              canRedo
                ? 'text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08]'
                : 'text-zinc-600 border-transparent opacity-40 cursor-not-allowed'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Redo</span>
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-0.5 hidden sm:block" />

          {/* Duplicate Clip */}
          <button
            type="button"
            disabled={!selectedVideoClipId && !selectedZoomClipId}
            onClick={() => duplicateClip()}
            title="Duplicate Selected Clip (D)"
            className={`p-1.5 rounded-lg border border-white/[0.06] transition-colors cursor-pointer ${
              selectedVideoClipId || selectedZoomClipId
                ? 'text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                : 'text-zinc-600 opacity-40 cursor-not-allowed bg-transparent'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete Selected */}
          <button
            type="button"
            disabled={!selectedZoomClipId && !selectedVideoClipId}
            onClick={() => {
              if (selectedZoomClipId) {
                deleteZoomClip(selectedZoomClipId);
              } else if (selectedVideoClipId) {
                deleteVideoClip(selectedVideoClipId);
              }
            }}
            title="Delete Selected Clip (Del / Backspace)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedZoomClipId || selectedVideoClipId
                ? 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/15 border border-rose-500/20'
                : 'text-zinc-700 opacity-40 cursor-not-allowed border border-transparent'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />

          {/* Add Manual Zoom Keyframe */}
          <button
            type="button"
            onClick={() =>
              addZoomClip({
                startTime: Math.round(currentTime * 10) / 10,
                endTime: Math.min(
                  project.durationSeconds,
                  Math.round((currentTime + 4.0) * 10) / 10
                ),
                zoomFactor: project.camera.defaultZoomFactor || 2.0,
                focusTarget: { x: 0.5, y: 0.5 },
              })
            }
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg text-indigo-200 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 text-indigo-300" />
            <span>Add Zoom</span>
            <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-indigo-950/60 text-[9px] text-indigo-300 font-mono">
              Z
            </kbd>
          </button>

          {/* Magic Auto-Zoom Button */}
          <button
            type="button"
            onClick={() => suggestSmartAutoZooms()}
            title="Auto-generate intelligent zoom keyframes for the full video"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg text-amber-200 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 transition-colors cursor-pointer"
          >
            <Wand2 className="w-3 h-3 text-amber-300" />
            <span>Auto Zooms</span>
          </button>
        </div>

        {/* Right Actions: Zoom Scale Nudge & Timeline Scaling */}
        <div className="flex items-center gap-2">
          {/* Quick Zoom Depth Nudge */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-lg text-[10px]">
            <span className="text-zinc-400 font-medium">Zoom Depth:</span>
            <button
              type="button"
              onClick={() => adjustZoomScale(-0.2)}
              title="Reduce Zoom (-0.2x)"
              className="px-1 hover:text-white text-zinc-400 cursor-pointer font-bold"
            >
              -
            </button>
            <span className="font-mono font-bold text-indigo-300 w-8 text-center">
              {activeZoomClip
                ? `${activeZoomClip.zoomFactor.toFixed(1)}x`
                : `${project.camera.defaultZoomFactor.toFixed(1)}x`}
            </span>
            <button
              type="button"
              onClick={() => adjustZoomScale(0.2)}
              title="Increase Zoom (+0.2x)"
              className="px-1 hover:text-white text-zinc-400 cursor-pointer font-bold"
            >
              +
            </button>
          </div>

          <div className="w-[1px] h-4 bg-white/10 hidden lg:block" />

          {/* Timeline View Scale */}
          <button
            type="button"
            onClick={() => setPixelsPerSecond((p) => Math.max(12, p - 6))}
            title="Zoom Out Timeline View"
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
            title="Zoom In Timeline View"
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Multi-Track Area with Synchronized Vertical Scroll */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Column) */}
        <div
          ref={headersScrollRef}
          className="w-40 flex flex-col border-r border-white/[0.06] bg-[#070709] py-2 px-2.5 space-y-2 text-[11px] font-medium text-zinc-400 select-none z-10 flex-shrink-0 overflow-y-hidden"
        >
          <div className="h-6 flex items-center text-[10px] uppercase text-zinc-600 tracking-wider">
            Tracks
          </div>

          {/* Track 1: Zoom */}
          <div className="h-10 flex items-center justify-between px-1 text-indigo-300">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`w-1.5 h-1.5 rounded-full ${trackVis.zoom ? 'bg-indigo-400' : 'bg-zinc-600'}`} />
              <span className={trackVis.zoom ? 'text-indigo-300' : 'text-zinc-500 line-through'}>Camera Zoom</span>
            </div>
            <button
              type="button"
              onClick={() => toggleTrackVisibility('zoom')}
              title={trackVis.zoom ? 'Bypass Auto Zoom' : 'Enable Auto Zoom'}
              className="p-1 text-zinc-500 hover:text-indigo-300 transition-colors cursor-pointer rounded"
            >
              {trackVis.zoom ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
            </button>
          </div>

          {/* Track 2: Video */}
          <div className="h-14 flex items-center justify-between px-1 text-zinc-300">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`w-1.5 h-1.5 rounded-full ${trackVis.video ? 'bg-zinc-300' : 'bg-zinc-600'}`} />
              <span className={trackVis.video ? 'text-zinc-200' : 'text-zinc-500 line-through'}>Screen Video</span>
            </div>
            <button
              type="button"
              onClick={() => toggleTrackVisibility('video')}
              title={trackVis.video ? 'Hide Video Track' : 'Show Video Track'}
              className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer rounded"
            >
              {trackVis.video ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
            </button>
          </div>

          {/* Track 3: Captions */}
          {project.subtitles.enabled && (
            <div className="h-8 flex items-center justify-between px-1 text-amber-300">
              <div className="flex items-center gap-1.5 truncate">
                <span className={`w-1.5 h-1.5 rounded-full ${trackVis.captions ? 'bg-amber-400' : 'bg-zinc-600'}`} />
                <span className={trackVis.captions ? 'text-amber-300' : 'text-zinc-500 line-through'}>AI Captions</span>
              </div>
              <button
                type="button"
                onClick={() => toggleTrackVisibility('captions')}
                title={trackVis.captions ? 'Hide Captions' : 'Show Captions'}
                className="p-1 text-zinc-500 hover:text-amber-300 transition-colors cursor-pointer rounded"
              >
                {trackVis.captions ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
              </button>
            </div>
          )}

          {/* Track 4: Audio */}
          <div className="h-10 flex items-center justify-between px-1 text-indigo-300">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`w-1.5 h-1.5 rounded-full ${trackVis.audio ? 'bg-indigo-400' : 'bg-zinc-600'}`} />
              <span className={trackVis.audio ? 'text-indigo-300' : 'text-zinc-500 line-through'}>Studio Audio</span>
            </div>
            <button
              type="button"
              onClick={() => toggleTrackVisibility('audio')}
              title={trackVis.audio ? 'Mute Audio Track' : 'Unmute Audio Track'}
              className="p-1 text-zinc-500 hover:text-indigo-300 transition-colors cursor-pointer rounded"
            >
              {trackVis.audio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            </button>
          </div>
        </div>

        {/* Scrollable Tracks & Ruler (Right Column with Vertical + Horizontal Scroll) */}
        <div
          ref={timelineScrollRef}
          onScroll={handleVerticalScroll}
          onClick={handleTimelineClick}
          className="flex-1 overflow-x-auto overflow-y-auto relative select-none cursor-pointer"
        >
          {/* Playhead Indicator (Diamond Needle) */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
            style={{ left: `${playheadPosition}px` }}
          >
            <div className="w-3.5 h-3.5 bg-indigo-400 border border-white rotate-45 -mt-1 shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
            <div className="w-[2px] flex-1 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          </div>

          <div
            className="flex flex-col py-2 px-2 space-y-2 min-h-full"
            style={{ width: `${project.durationSeconds * pixelsPerSecond + 160}px` }}
          >
            {/* Top Timecode Ruler */}
            <TimelineRuler
              duration={project.durationSeconds}
              pixelsPerSecond={pixelsPerSecond}
            />

            {/* Track 1: Zoom Keyframes */}
            <div className={trackVis.zoom ? 'opacity-100' : 'opacity-30 transition-opacity'}>
              <ZoomTrack pixelsPerSecond={pixelsPerSecond} />
            </div>

            {/* Track 2: Screen Video Clips */}
            <div className={trackVis.video ? 'opacity-100' : 'opacity-30 transition-opacity'}>
              <VideoTrack
                pixelsPerSecond={pixelsPerSecond}
                duration={project.durationSeconds}
              />
            </div>

            {/* Track 3: Captions */}
            {project.subtitles.enabled && (
              <div className={trackVis.captions ? 'opacity-100' : 'opacity-30 transition-opacity'}>
                <CaptionsTrack pixelsPerSecond={pixelsPerSecond} />
              </div>
            )}

            {/* Track 4: Audio Waveform */}
            <div className={trackVis.audio ? 'opacity-100' : 'opacity-30 transition-opacity'}>
              <AudioTrack
                pixelsPerSecond={pixelsPerSecond}
                duration={project.durationSeconds}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Context Menu */}
      <TimelineContextMenu
        menuState={contextMenu}
        onClose={() => setContextMenu((c) => ({ ...c, isOpen: false }))}
      />
    </div>
  );
}
