import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '../../store/useStudioStore';
import { WindowChrome } from './WindowChrome';
import { VectorCursor } from './VectorCursor';
import { PlaybackHUD } from './PlaybackHUD';
import { SpringCameraEngine } from '../../engine/springPhysics';
import {
  Sparkles,
  Upload,
  Video,
  Crosshair,
  Play,
  Film,
  Monitor,
} from 'lucide-react';

export function CanvasViewport() {
  const {
    project,
    currentTime,
    isPlaying,
    advanceClock,
    viewportScale,
    videoSourceUrl,
    isDemoMode,
    setVideoElement,
    setVideoSource,
    loadDemoProject,
    setRecordModalOpen,
    selectedZoomClipId,
    setZoomClipFocus,
  } = useStudioStore();

  const { canvas, camera, cursor, zoomClips, subtitles } = project;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Spring camera engine instance
  const cameraEngineRef = useRef<SpringCameraEngine>(
    new SpringCameraEngine(camera.springPhysics)
  );

  const [springTransform, setSpringTransform] = useState({
    zoom: 1.0,
    focusX: 0.5,
    focusY: 0.5,
  });

  // Register video element ref in store
  useEffect(() => {
    if (videoRef.current) {
      setVideoElement(videoRef.current);
    } else {
      setVideoElement(null);
    }
  }, [videoSourceUrl, setVideoElement]);

  // Update spring configuration
  useEffect(() => {
    cameraEngineRef.current.updateConfig(camera.springPhysics);
  }, [camera.springPhysics]);

  // 60FPS Master Playback Clock & Spring Physics Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
      lastTime = now;

      // 1. Advance Master Timeline Clock when playing
      if (isPlaying) {
        advanceClock(dt);
      }

      // 2. Evaluate Spring Physics Camera Position at currentTime
      const activeZoom = zoomClips.find(
        (z) => currentTime >= z.startTime && currentTime <= z.endTime
      );

      if (camera.autoZoomEnabled && activeZoom) {
        cameraEngineRef.current.setTargets(
          activeZoom.zoomFactor,
          activeZoom.focusTarget.x,
          activeZoom.focusTarget.y
        );
      } else {
        cameraEngineRef.current.setTargets(1.0, 0.5, 0.5);
      }

      const currentSpring = cameraEngineRef.current.tick(dt);
      setSpringTransform(currentSpring);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTime, zoomClips, camera.autoZoomEnabled, advanceClock]);

  // Interactive Click to Reposition Camera Focus Target
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const targetClip =
      zoomClips.find((z) => currentTime >= z.startTime && currentTime <= z.endTime) ||
      zoomClips.find((z) => z.id === selectedZoomClipId);

    if (targetClip) {
      setZoomClipFocus(
        targetClip.id,
        Math.max(0.1, Math.min(0.9, clickX)),
        Math.max(0.1, Math.min(0.9, clickY))
      );
    }
  };

  // Drag & drop video handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoSource(file);
    }
  };

  // Aspect ratio styling for the outer canvas
  const aspectClassMap = {
    '16:9': 'aspect-video max-w-4xl',
    '9:16': 'aspect-[9/16] max-h-[85vh] max-w-sm',
    '1:1': 'aspect-square max-h-[85vh] max-w-xl',
    '4:5': 'aspect-[4/5] max-h-[85vh] max-w-lg',
  };

  const backgroundPresets: Record<string, string> = {
    apple_aurora: 'radial-gradient(circle at 20% 20%, #1e1b4b 0%, #581c87 40%, #0d9488 80%, #050507 100%)',
    obsidian_studio: 'radial-gradient(circle at 50% 30%, #18181b 0%, #0c0c0e 60%, #050507 100%)',
    cyber_sunset: 'radial-gradient(circle at 80% 20%, #ea580c 0%, #701a75 50%, #0f172a 100%)',
    midnight_velvet: 'radial-gradient(circle at 30% 70%, #312e81 0%, #1e1b4b 60%, #09090b 100%)',
  };

  const currentBgStyle =
    canvas.background.type === 'mesh_gradient'
      ? backgroundPresets[canvas.background.preset] || backgroundPresets.apple_aurora
      : '#050507';

  // Compute camera pan offset based on spring state
  const panOffsetX = (0.5 - springTransform.focusX) * (springTransform.zoom - 1) * 100;
  const panOffsetY = (0.5 - springTransform.focusY) * (springTransform.zoom - 1) * 100;

  // Active subtitle
  const activeSubtitle = subtitles.enabled
    ? project.subtitleClips.find(
        (s) => currentTime >= s.start && currentTime <= s.end
      )
    : null;

  const isProjectEmpty = project.durationSeconds <= 0 && !videoSourceUrl && !isDemoMode;

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative flex-1 h-full w-full bg-[#050507] overflow-hidden flex items-center justify-center p-8 select-none"
    >
      {/* 1. STABLE STUDIO CANVAS (Aspect Ratio Box & Mesh Background) */}
      <motion.div
        animate={{ scale: viewportScale }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`relative w-full ${aspectClassMap[canvas.aspectRatio]} rounded-3xl overflow-hidden shadow-[0_32px_96px_rgba(0,0,0,0.85)] border border-white/[0.08] flex items-center justify-center transition-all duration-300`}
      >
        {/* Background Mesh Gradient */}
        <div
          className="absolute inset-0 w-full h-full transition-all duration-500"
          style={{ background: currentBgStyle }}
        />

        {/* Framing Inset Container */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-all duration-300"
          style={{
            padding: `${canvas.paddingPx}px`,
            perspective: 1200, // 3D Perspective container
          }}
        >
          {isProjectEmpty ? (
            /* EMPTY STATE HERO */
            <div className="relative z-10 w-full max-w-lg p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/[0.12] shadow-2xl text-center space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Welcome to ScreenCraft Pro
                </h2>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Create high-production product videos with automatic camera zoom and smooth cursor physics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {/* 1. Demo Project */}
                <button
                  type="button"
                  onClick={loadDemoProject}
                  className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs border border-white/20 shadow-lg shadow-indigo-600/40 flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Film className="w-4 h-4" />
                  <span>Load Demo</span>
                </button>

                {/* 2. Upload Video */}
                <label className="p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 font-semibold text-xs border border-white/10 flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-95">
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span>Upload Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setVideoSource(f);
                    }}
                  />
                </label>

                {/* 3. Record Screen */}
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(true)}
                  className="p-3.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs border border-rose-500/30 flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Monitor className="w-4 h-4 text-rose-400" />
                  <span>Record Screen</span>
                </button>
              </div>
            </div>
          ) : (
            /* 2. 3D PERSPECTIVE WINDOW FRAME (Tilt applied strictly to this element) */
            <motion.div
              animate={{
                rotateX: camera.perspective3D.pitchDeg,
                rotateY: camera.perspective3D.yawDeg,
              }}
              transition={{
                type: 'spring',
                stiffness: camera.springPhysics.stiffness,
                damping: camera.springPhysics.damping,
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
              className="w-full h-full relative"
            >
              <WindowChrome frame={canvas.frame}>
                {/* Scalable Inner Content with Spring Camera Zoom & Pan */}
                <div
                  ref={containerRef}
                  onClick={handleCanvasClick}
                  style={{
                    transform: `scale(${springTransform.zoom}) translate(${panOffsetX}%, ${panOffsetY}%)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.05s linear',
                  }}
                  className="relative w-full h-full bg-[#0b0c10] flex items-center justify-center overflow-hidden cursor-crosshair group/canvas"
                >
                  {videoSourceUrl ? (
                    <video
                      ref={videoRef}
                      src={videoSourceUrl}
                      playsInline
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    /* Demo Showcase Visuals */
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-b from-[#0f1117] to-[#07080c]">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                      <div className="relative z-10 max-w-md space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] font-medium text-indigo-300">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Interactive Demo Showcase</span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                          Create Cinematic Product Demos in Seconds
                        </h1>

                        <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                          Hit <strong>Play (Space)</strong> below to watch the timeline glide with live spring auto-zoom into keyframes!
                        </p>

                        <div className="flex items-center justify-center gap-3 pt-2">
                          <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Custom Video</span>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setVideoSource(f);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Focus Target Crosshair Hint on Hover */}
                  <div className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-zinc-300 opacity-0 group-hover/canvas:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none">
                    <Crosshair className="w-3 h-3 text-indigo-400" />
                    <span>Click to change Zoom Focal Point</span>
                  </div>

                  {/* Vector Cursor Overlay */}
                  <VectorCursor
                    config={cursor}
                    position={{
                      x: springTransform.focusX,
                      y: springTransform.focusY,
                    }}
                    isClicking={currentTime % 2 > 1.6}
                  />
                </div>
              </WindowChrome>
            </motion.div>
          )}
        </div>

        {/* Kinetic Subtitle Card */}
        <AnimatePresence>
          {activeSubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 max-w-lg px-5 py-2.5 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/15 shadow-2xl text-center"
            >
              <div className="text-[14px] font-bold tracking-tight text-white flex items-center justify-center gap-1.5 flex-wrap">
                {activeSubtitle.words.map((w, idx) => {
                  const isWordActive =
                    currentTime >= w.start && currentTime <= w.end;
                  return (
                    <span
                      key={idx}
                      className={
                        isWordActive
                          ? 'text-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.9)] scale-110 transition-all'
                          : 'text-white/80'
                      }
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Playback HUD */}
      {!isProjectEmpty && <PlaybackHUD />}
    </div>
  );
}
