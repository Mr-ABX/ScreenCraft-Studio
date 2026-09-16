import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStudioStore } from '../../store/useStudioStore';
import { NumberSlider } from '../common/NumberSlider';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { SegmentedControl } from '../common/SegmentedControl';
import { CursorStyle, CursorMode } from '../../types/project';
import { trackVideoCursor } from '../../engine/videoCursorTracker';
import { MousePointer, Sparkles, Activity, EyeOff, Play, Wand2, Scan, Loader2, Mouse } from 'lucide-react';

export function CursorCard() {
  const {
    project,
    videoSourceBlob,
    setCursorMode,
    setCursorShowOverlay,
    setCursorStyle,
    setCursorScale,
    setClickEffectEnabled,
    setMotionBlurEnabled,
    setMouseTelemetry,
    generateCursorTrajectoryFromZooms,
  } = useStudioStore();

  const { cursor, mouseTelemetry } = project;
  const currentMode: CursorMode = cursor.mode || (cursor.showOverlay ? 'styled' : 'video');
  const hasTelemetry = mouseTelemetry && mouseTelemetry.length > 0;
  const [testClicking, setTestClicking] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingProgress, setTrackingProgress] = useState(0);

  const handleTestClick = () => {
    setTestClicking(true);
    setTimeout(() => setTestClicking(false), 450);
  };

  const handleTrackVideo = async () => {
    if (!videoSourceBlob) return;
    setIsTracking(true);
    setTrackingProgress(0);

    try {
      const samples = await trackVideoCursor(videoSourceBlob, project.durationSeconds, {
        onProgress: (p) => setTrackingProgress(Math.round(p * 100)),
      });
      setMouseTelemetry(samples);
      setCursorMode('styled');
    } catch (err) {
      console.error('Failed to track cursor in video:', err);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Interactive Live Cursor Preview Sandbox */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <MousePointer className="w-3.5 h-3.5 text-zinc-500" />
          <span>Live Cursor Sandbox</span>
        </label>

        <div
          onClick={handleTestClick}
          className="relative h-28 w-full rounded-2xl bg-gradient-to-b from-[#14141c] to-[#0a0a0f] border border-white/[0.1] shadow-inner flex flex-col items-center justify-center overflow-hidden cursor-pointer group select-none"
        >
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px]" />

          {/* Click Shockwave in Sandbox */}
          {cursor.clickEffect.enabled && testClicking && (
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute w-12 h-12 rounded-full border-2 border-indigo-400/80 bg-indigo-500/25 shadow-[0_0_16px_rgba(99,102,241,0.6)] pointer-events-none"
            />
          )}

          {/* Cursor Graphic Preview */}
          <div className="relative z-10 flex flex-col items-center">
            {cursor.style === 'macos_arrow' && (
              <motion.svg
                animate={{ scale: cursor.scale }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
              >
                <path
                  d="M3 3L10.5 21L13.5 13.5L21 10.5L3 3Z"
                  fill="black"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}

            {cursor.style === 'pointer' && (
              <motion.svg
                animate={{ scale: cursor.scale }}
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
              >
                <path
                  d="M8 3V13M8 13L4.5 9.5L3 11L8.5 16.5C10 18 11.5 19 13.5 19H17C19.2 19 21 17.2 21 15V9.5C21 8.7 20.3 8 19.5 8C19 8 18.5 8.3 18.2 8.7C17.9 8.3 17.4 8 16.8 8C16.3 8 15.8 8.3 15.5 8.7C15.2 8.3 14.7 8 14.1 8C13.3 8 12.6 8.7 12.6 9.5V11"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="black"
                />
              </motion.svg>
            )}

            {cursor.style === 'glow_dot' && (
              <motion.div
                animate={{ scale: cursor.scale }}
                className="w-5 h-5 rounded-full bg-indigo-500 border-2 border-white shadow-[0_0_16px_rgba(99,102,241,0.9)]"
              />
            )}
          </div>

          <span className="absolute bottom-2 text-[10px] text-zinc-500 group-hover:text-indigo-300 transition-colors">
            Click sandbox to test click shockwave
          </span>
        </div>
      </div>

      {/* 2. Telemetry Status & Smart Trajectory Generator */}
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${hasTelemetry ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
            <div>
              <div className="text-xs font-semibold text-white">
                {hasTelemetry ? 'Active Cursor Path' : 'Baked Pixel Cursor'}
              </div>
              <div className="text-[10px] text-zinc-400">
                {hasTelemetry
                  ? `${mouseTelemetry.length} motion keypoints active`
                  : 'Native video cursor (no vector path)'}
              </div>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
              hasTelemetry
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {hasTelemetry ? 'PATH ACTIVE' : 'BAKED'}
          </span>
        </div>

        {/* Action Buttons: Optical Tracker + Zoom Path Generator */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          {videoSourceBlob && (
            <button
              type="button"
              disabled={isTracking}
              onClick={handleTrackVideo}
              title="Scans video frames with browser computer vision to detect moving mouse coordinates"
              className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isTracking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span>Tracking Motion... {trackingProgress}%</span>
                </>
              ) : (
                <>
                  <Scan className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Track Cursor in Video (Optical Vision)</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={generateCursorTrajectoryFromZooms}
            title="Generates natural smooth mouse movement connecting zoom keyframe focal points"
            className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Glide Path from Zooms</span>
          </button>
        </div>
      </div>

      {/* 3. Three-Way Cursor Display Mode Switcher */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
          <span>Cursor Mode</span>
          <span className="text-[10px] text-zinc-500 font-normal">
            {currentMode === 'video' ? 'Native Video Mouse' : currentMode === 'styled' ? 'Vector Overlay' : 'Hidden'}
          </span>
        </label>

        <SegmentedControl<CursorMode>
          size="sm"
          value={currentMode}
          onChange={(m) => setCursorMode(m)}
          options={[
            { value: 'video', label: 'Original Video' },
            { value: 'styled', label: 'Styled Vector' },
            { value: 'hidden', label: 'Hidden' },
          ]}
        />
      </div>

      {currentMode === 'styled' && (
        <div className="space-y-5 pt-1">
          {/* Style Picker */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Cursor Shape
            </label>

            <SegmentedControl<CursorStyle>
              size="sm"
              value={cursor.style}
              onChange={setCursorStyle}
              options={[
                { value: 'macos_arrow', label: 'macOS' },
                { value: 'windows_arrow', label: 'Windows' },
                { value: 'pointer', label: 'Hand' },
                { value: 'glow_dot', label: 'Glow Dot' },
              ]}
            />
          </div>

          {/* Scale Slider */}
          <NumberSlider
            label="Cursor Scale"
            value={cursor.scale}
            min={1.0}
            max={2.5}
            step={0.1}
            unit="x"
            defaultValue={1.4}
            onChange={setCursorScale}
          />

          <div className="w-full h-[1px] bg-white/[0.06]" />

          {/* Effects */}
          <div className="space-y-3">
            <ToggleSwitch
              label="Click Shockwave Halo"
              description="Renders expanding animated halo ring on every click"
              checked={cursor.clickEffect.enabled}
              onChange={setClickEffectEnabled}
            />

            <ToggleSwitch
              label="Motion-Adaptive Blur"
              description="Adds velocity blur during fast cursor transitions"
              checked={cursor.motionBlurEnabled}
              onChange={setMotionBlurEnabled}
            />

            <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[10px] text-indigo-300 leading-relaxed">
              💡 <strong>Interactive Placement:</strong> Click anywhere on the video canvas to place or refine the cursor position at the current playhead timestamp.
            </div>
          </div>
        </div>
      )}

      {currentMode === 'video' && (
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] text-zinc-400 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-zinc-300">
            <Mouse className="w-4 h-4 text-zinc-400" />
            <span>Authentic Screen Recording Mouse</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            Displaying the authentic mouse pointer recorded directly into your video pixels. Vector overlay is suppressed to guarantee zero double-cursors.
          </p>
        </div>
      )}

      {currentMode === 'hidden' && (
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-zinc-400 flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>All synthetic cursor overlays are hidden.</span>
        </div>
      )}
    </div>
  );
}
