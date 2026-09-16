import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';

export function PlaybackHUD() {
  const {
    isPlaying,
    togglePlay,
    currentTime,
    project,
    seek,
    playbackRate,
    setPlaybackRate,
  } = useStudioStore();

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const viewportContainer =
        document.getElementById('canvas-viewport-container') ||
        document.documentElement;
      if (viewportContainer.requestFullscreen) {
        viewportContainer.requestFullscreen().catch((err) => {
          console.warn('Error attempting to enable full-screen mode:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#141418]/85 backdrop-blur-3xl border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_16px_40px_rgba(0,0,0,0.6)] select-none">
      {/* Skip Backward */}
      <button
        type="button"
        onClick={() => seek(Math.max(0, currentTime - 5))}
        title="Rewind 5s (←)"
        className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/[0.06]"
      >
        <SkipBack className="w-4 h-4" />
      </button>

      {/* Main Play / Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        title="Play / Pause (Space)"
        className="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-[0_2px_8px_rgba(255,255,255,0.25)] active:scale-95"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-black" />
        ) : (
          <Play className="w-4 h-4 fill-black ml-0.5" />
        )}
      </button>

      {/* Skip Forward */}
      <button
        type="button"
        onClick={() => seek(Math.min(project.durationSeconds, currentTime + 5))}
        title="Forward 5s (→)"
        className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/[0.06]"
      >
        <SkipForward className="w-4 h-4" />
      </button>

      {/* Vertical Divider */}
      <div className="w-[1px] h-4 bg-white/[0.1]" />

      {/* Timecode Readout */}
      <div className="flex items-center gap-1 font-mono text-[12px] font-medium tracking-tight">
        <span className="text-white">{formatTimecode(currentTime)}</span>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-400">{formatTimecode(project.durationSeconds)}</span>
      </div>

      {/* Vertical Divider */}
      <div className="w-[1px] h-4 bg-white/[0.1]" />

      {/* Playback Speed Selector */}
      <button
        type="button"
        onClick={() => {
          const rates = [1.0, 1.25, 1.5, 2.0];
          const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
          setPlaybackRate(rates[nextIndex]);
        }}
        className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
      >
        {playbackRate}x
      </button>

      {/* Real Fullscreen Viewport Mode Toggle */}
      <button
        type="button"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit Full Screen (ESC)' : 'Full Screen Preview (F)'}
        className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/[0.06]"
      >
        {isFullscreen ? (
          <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <Maximize2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
