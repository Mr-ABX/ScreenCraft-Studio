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
    activeTab,
    setVideoElement,
    setVideoSource,
    loadDemoProject,
    setRecordModalOpen,
    selectedZoomClipId,
    setZoomClipFocus,
    setManualCursorPosition,
  } = useStudioStore();

  const { canvas, camera, cursor, zoomClips, subtitles } = project;
  const [isDraggingFocus, setIsDraggingFocus] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasOuterRef = useRef<HTMLDivElement>(null);

  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Observe outer canvas dimensions for OpenScreen proportional fitting
  useEffect(() => {
    const el = canvasOuterRef.current;
    if (!el) return;

    const updateSize = () => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        setCanvasDimensions({
          width: el.clientWidth,
          height: el.clientHeight,
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [canvas.aspectRatio, viewportScale]);

  // Spring camera engine instance
  const cameraEngineRef = useRef<SpringCameraEngine>(
    new SpringCameraEngine(camera.springPhysics)
  );

  const [springTransform, setSpringTransform] = useState({
    zoom: 1.0,
    focusX: 0.5,
    focusY: 0.5,
  });

  // Register video element ref in store with lifecycle cleanup
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      setVideoElement(video);
      // Synchronize video time with store currentTime
      const currentStoreTime = useStudioStore.getState().currentTime;
      if (Math.abs(video.currentTime - currentStoreTime) > 0.05) {
        video.currentTime = currentStoreTime;
      }
    }
    return () => {
      if (video) {
        video.pause();
      }
      setVideoElement(null);
    };
  }, [videoSourceUrl, canvas.frame.type, setVideoElement]);

  // Update spring configuration
  useEffect(() => {
    cameraEngineRef.current.updateConfig(camera.springPhysics);
  }, [camera.springPhysics]);

  // Synchronize native video element play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      if (video.paused) {
        video.play().catch((err) => {
          console.warn('Playback error:', err);
        });
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isPlaying]);

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

  const videoAspectRatio = project.videoMetadata?.aspectRatio || 16 / 9;

  // Interactive Click to Reposition Camera Focus Target or Cursor
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width));
    const clickY = Math.max(0.02, Math.min(0.98, (e.clientY - rect.top) / rect.height));

    if (activeTab === 'cursor') {
      setManualCursorPosition(clickX, clickY);
      return;
    }

    const targetClip =
      zoomClips.find((z) => currentTime >= z.startTime && currentTime <= z.endTime) ||
      zoomClips.find((z) => z.id === selectedZoomClipId);

    if (targetClip) {
      setZoomClipFocus(targetClip.id, clickX, clickY);
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
  const aspectClassMap: Record<string, string> = {
    auto: 'max-w-5xl max-h-[85vh]',
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
    cosmic_nebula: 'radial-gradient(circle at 70% 30%, #ec4899 0%, #6366f1 45%, #0f172a 100%)',
    emerald_isle: 'radial-gradient(circle at 25% 25%, #065f46 0%, #0f766e 40%, #042f2e 85%, #050507 100%)',
    cupertino_grid: 'radial-gradient(circle at 50% 50%, #1e1e24 0%, #0a0a0c 100%), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 24px)',
    sonoma_waves: 'radial-gradient(circle at 80% 80%, #fb923c 0%, #c026d3 35%, #4338ca 70%, #050507 100%)',
    sequoia_mist: 'radial-gradient(circle at 30% 20%, #38bdf8 0%, #0284c7 30%, #1e293b 70%, #050507 100%)',
  };

  const currentBgStyle: React.CSSProperties =
    canvas.background.type === 'custom_image' && canvas.background.customImageUrl
      ? {
          backgroundImage: `url(${canvas.background.customImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {
          background: backgroundPresets[canvas.background.preset] || backgroundPresets.apple_aurora,
        };

  // Compute camera pan offset based on spring state
  const panOffsetX = (0.5 - springTransform.focusX) * (springTransform.zoom - 1) * 100;
  const panOffsetY = (0.5 - springTransform.focusY) * (springTransform.zoom - 1) * 100;

  // Resolve Cursor Position from Telemetry or Spring Targets
  let cursorPosition = {
    x: springTransform.focusX,
    y: springTransform.focusY,
  };
  let isCursorClicking = isDemoMode ? currentTime % 3 > 2.6 : false;

  if (project.mouseTelemetry && project.mouseTelemetry.length > 0) {
    const samples = project.mouseTelemetry;
    const idx = samples.findIndex((s) => s.timestamp >= currentTime);
    if (idx === -1) {
      const last = samples[samples.length - 1];
      cursorPosition = { x: last.x, y: last.y };
      isCursorClicking = last.isClick;
    } else if (idx === 0) {
      cursorPosition = { x: samples[0].x, y: samples[0].y };
      isCursorClicking = samples[0].isClick;
    } else {
      const prev = samples[idx - 1];
      const next = samples[idx];
      const span = next.timestamp - prev.timestamp;
      const progress = span > 0 ? (currentTime - prev.timestamp) / span : 0;
      cursorPosition = {
        x: prev.x + (next.x - prev.x) * progress,
        y: prev.y + (next.y - prev.y) * progress,
      };
      isCursorClicking = prev.isClick || next.isClick;
    }
  }

  // Active subtitle
  const activeSubtitle = subtitles.enabled
    ? project.subtitleClips.find(
        (s) => currentTime >= s.start && currentTime <= s.end
      )
    : null;

  const targetClip =
    zoomClips.find((z) => currentTime >= z.startTime && currentTime <= z.endTime) ||
    zoomClips.find((z) => z.id === selectedZoomClipId);

  const isProjectEmpty = project.durationSeconds <= 0 && !videoSourceUrl && !isDemoMode;

  // Proportional constraint fitting (OpenScreen non-cropping geometry)
  const isFrameless = canvas.frame.type === 'frameless';
  const titleBarHeight = isFrameless ? 0 : 40;
  const padding = canvas.paddingPx;

  let frameWidth: number | undefined = undefined;
  let frameHeight: number | undefined = undefined;

  if (canvasDimensions.width > 0 && canvasDimensions.height > 0) {
    const availW = Math.max(20, canvasDimensions.width - padding * 2);
    const availH = Math.max(20, canvasDimensions.height - padding * 2);
    const maxVidH = Math.max(10, availH - titleBarHeight);

    let vidW = availW;
    let vidH = vidW / videoAspectRatio;

    if (vidH > maxVidH) {
      vidH = maxVidH;
      vidW = vidH * videoAspectRatio;
    }

    frameWidth = Math.round(vidW);
    frameHeight = Math.round(vidH + titleBarHeight);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative flex-1 h-full w-full bg-[#050507] overflow-hidden flex items-center justify-center p-8 select-none"
    >
      {/* 1. STABLE STUDIO CANVAS (Aspect Ratio Box & Mesh Background) */}
      <motion.div
        ref={canvasOuterRef}
        animate={{ scale: viewportScale }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          aspectRatio: canvas.aspectRatio === 'auto' ? `${videoAspectRatio}` : undefined,
        }}
        className={`relative w-full ${aspectClassMap[canvas.aspectRatio] || aspectClassMap['16:9']} rounded-3xl overflow-hidden shadow-[0_32px_96px_rgba(0,0,0,0.85)] border border-white/[0.08] flex items-center justify-center transition-all duration-300`}
      >
        {/* Background Mesh / Wallpaper / Custom Gradient */}
        <div
          className="absolute inset-0 w-full h-full transition-all duration-500 scale-105"
          style={{
            ...currentBgStyle,
            filter: project.effects?.backgroundBlurPx ? `blur(${project.effects.backgroundBlurPx}px)` : undefined,
          }}
        />

        {/* Cinematic Vignette Overlay */}
        {project.effects?.vignetteIntensity > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,${project.effects.vignetteIntensity * 0.85}) 100%)`,
            }}
          />
        )}

        {/* Framing Inset Container */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-all duration-300"
          style={{
            perspective: 1200, // 3D Perspective container
          }}
        >
          {isProjectEmpty ? (
            /* EMPTY STATE HERO */
            <div className="relative z-20 w-full max-w-lg p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/[0.12] shadow-2xl text-center space-y-6">
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
              className="relative z-20 flex items-center justify-center"
            >
              <WindowChrome
                frame={canvas.frame}
                cornerRadiusPx={canvas.cornerRadiusPx}
                width={frameWidth}
                height={frameHeight}
                aspectRatio={videoAspectRatio}
              >
                {/* Scalable Inner Content with Spring Camera Zoom & Pan */}
                <div
                  ref={containerRef}
                  onClick={handleCanvasClick}
                  style={{
                    transform: `scale(${springTransform.zoom}) translate(${panOffsetX}%, ${panOffsetY}%)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.05s linear',
                  }}
                  className={`relative w-full h-full bg-[#0b0c10] flex items-center justify-center overflow-hidden min-h-0 ${
                    activeTab === 'cursor' || activeTab === 'zoom' ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                >
                  {videoSourceUrl ? (
                    <video
                      ref={videoRef}
                      src={videoSourceUrl}
                      playsInline
                      onEnded={() => useStudioStore.getState().setIsPlaying(false)}
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

                  {/* Vector Cursor Overlay: only when in 'styled' mode */}
                  {(cursor.mode === 'styled' || (cursor.mode !== 'video' && cursor.mode !== 'hidden' && cursor.showOverlay)) && (
                    <VectorCursor
                      config={cursor}
                      position={cursorPosition}
                      isClicking={isCursorClicking}
                    />
                  )}
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
