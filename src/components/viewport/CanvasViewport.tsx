import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '../../store/useStudioStore';
import { WindowChrome } from './WindowChrome';
import { VectorCursor } from './VectorCursor';
import { PlaybackHUD } from './PlaybackHUD';
import { SpringCameraEngine } from '../../engine/springPhysics';
import { Sparkles, Code2, ArrowRight, Upload, Video, Crosshair } from 'lucide-react';

export function CanvasViewport() {
  const {
    project,
    currentTime,
    isPlaying,
    seek,
    viewportScale,
    videoSourceUrl,
    setVideoElement,
    setVideoSource,
    selectedZoomClipId,
    setZoomClipFocus,
  } = useStudioStore();

  const { canvas, camera, cursor, zoomClips, subtitles } = project;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Real-time Spring Camera State
  const cameraEngineRef = useRef<SpringCameraEngine>(
    new SpringCameraEngine(camera.springPhysics)
  );

  const [springTransform, setSpringTransform] = useState({
    zoom: 1.0,
    focusX: 0.5,
    focusY: 0.5,
  });

  // Keep videoRef registered in store for Play/Pause and Exporter
  useEffect(() => {
    if (videoRef.current) {
      setVideoElement(videoRef.current);
    }
  }, [setVideoElement]);

  // Update spring config when project settings change
  useEffect(() => {
    cameraEngineRef.current.updateConfig(camera.springPhysics);
  }, [camera.springPhysics]);

  // Real-Time 60FPS Physics Tick Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
      lastTime = now;

      // Find active zoom clip at current playback time
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
  }, [currentTime, zoomClips, camera.autoZoomEnabled]);

  // Synchronize HTML5 video time updates with studio store
  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      seek(videoRef.current.currentTime);
    }
  };

  // Interactive Click to Reposition Camera Focus Target
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    // If an active or selected zoom clip is present, update its focus target
    const targetClip =
      zoomClips.find((z) => currentTime >= z.startTime && currentTime <= z.endTime) ||
      zoomClips.find((z) => z.id === selectedZoomClipId);

    if (targetClip) {
      setZoomClipFocus(targetClip.id, Math.max(0.1, Math.min(0.9, clickX)), Math.max(0.1, Math.min(0.9, clickY)));
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

  // Aspect ratio styling
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

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative flex-1 h-full w-full bg-[#050507] overflow-hidden flex items-center justify-center p-8 select-none"
    >
      {/* Studio Canvas Card */}
      <motion.div
        animate={{
          scale: viewportScale,
          rotateX: camera.perspective3D.pitchDeg,
          rotateY: camera.perspective3D.yawDeg,
        }}
        transition={{
          type: 'spring',
          stiffness: camera.springPhysics.stiffness,
          damping: camera.springPhysics.damping,
        }}
        style={{
          perspective: 1200,
          transformStyle: 'preserve-3d',
        }}
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
          }}
        >
          {/* Scalable Window Mockup Frame with Live Spring Transforms */}
          <div
            style={{
              transform: `scale(${springTransform.zoom}) translate(${panOffsetX}%, ${panOffsetY}%)`,
              transformOrigin: 'center center',
              transition: 'transform 0.05s linear',
            }}
            className="w-full h-full relative"
          >
            <WindowChrome frame={canvas.frame}>
              {/* Interactive Video Container */}
              <div
                ref={containerRef}
                onClick={handleCanvasClick}
                className="relative w-full h-full bg-[#0b0c10] flex items-center justify-center overflow-hidden cursor-crosshair group/canvas"
              >
                {videoSourceUrl ? (
                  <video
                    ref={videoRef}
                    src={videoSourceUrl}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  /* Rich Sample Mock Content when no video is imported yet */
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-md space-y-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] font-medium text-indigo-300">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>Next-Gen Screen Recording</span>
                      </div>

                      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Create Cinematic Product Demos in Seconds
                      </h1>

                      <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                        Drop any video here or click <strong>Record</strong> above to test automatic camera zoom & cursor tracking in real-time!
                      </p>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Sample Video</span>
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
          </div>
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
      <PlaybackHUD />
    </div>
  );
}
