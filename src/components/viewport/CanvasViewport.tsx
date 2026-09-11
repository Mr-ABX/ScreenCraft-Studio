import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '../../store/useStudioStore';
import { WindowChrome } from './WindowChrome';
import { VectorCursor } from './VectorCursor';
import { PlaybackHUD } from './PlaybackHUD';
import { Sparkles, Code2, Play, CheckCircle2, ArrowRight } from 'lucide-react';

export function CanvasViewport() {
  const { project, currentTime, isPlaying, seek, viewportScale } = useStudioStore();
  const { canvas, camera, cursor, zoomClips, subtitles } = project;

  // Find active zoom clip at current timecode
  const activeZoomClip = zoomClips.find(
    (z) => currentTime >= z.startTime && currentTime <= z.endTime
  );

  const zoomScale = activeZoomClip ? activeZoomClip.zoomFactor : 1.0;
  const focusX = activeZoomClip ? (0.5 - activeZoomClip.focusTarget.x) * (zoomScale - 1) * 100 : 0;
  const focusY = activeZoomClip ? (0.5 - activeZoomClip.focusTarget.y) * (zoomScale - 1) * 100 : 0;

  // Aspect Ratio calculations
  const aspectClassMap = {
    '16:9': 'aspect-video max-w-4xl',
    '9:16': 'aspect-[9/16] max-h-[85vh] max-w-sm',
    '1:1': 'aspect-square max-h-[85vh] max-w-xl',
    '4:5': 'aspect-[4/5] max-h-[85vh] max-w-lg',
  };

  // Background Mesh Gradients
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

  // Find active subtitle at current timecode
  const activeSubtitle = subtitles.enabled
    ? project.subtitleClips.find(
        (s) => currentTime >= s.start && currentTime <= s.end
      )
    : null;

  return (
    <div className="relative flex-1 h-full w-full bg-[#050507] overflow-hidden flex items-center justify-center p-8 select-none">
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
        className={`relative w-full ${aspectClassMap[canvas.aspectRatio]} rounded-3xl overflow-hidden shadow-[0_32px_96px_rgba(0,0,0,0.8)] border border-white/[0.08] flex items-center justify-center transition-all duration-300`}
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
          {/* 3D Scalable Window Mockup Frame */}
          <motion.div
            animate={{
              scale: zoomScale,
              x: `${focusX}%`,
              y: `${focusY}%`,
            }}
            transition={{
              type: 'spring',
              stiffness: camera.springPhysics.stiffness,
              damping: camera.springPhysics.damping,
            }}
            className="w-full h-full relative"
          >
            <WindowChrome frame={canvas.frame}>
              {/* Sample Recorded Web App Showcase */}
              <div className="relative w-full h-full bg-[#0b0c10] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Glow Sphere */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Mock UI Content */}
                <div className="relative z-10 max-w-md space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] font-medium text-indigo-300">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Next-Gen Screen Recording</span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Create Cinematic Product Demos in Seconds
                  </h1>

                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    ScreenCraft Pro transforms raw recordings into high-production videos with automatic zoom, smooth cursor physics, and 3D studio frames.
                  </p>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all">
                      <span>Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-zinc-300 text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Documentation</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Vector Cursor Tracking */}
                <VectorCursor
                  config={cursor}
                  position={{
                    x: activeZoomClip ? activeZoomClip.focusTarget.x : 0.55,
                    y: activeZoomClip ? activeZoomClip.focusTarget.y : 0.65,
                  }}
                  isClicking={currentTime % 2 > 1.6}
                />
              </div>
            </WindowChrome>
          </motion.div>
        </div>

        {/* Kinetic Subtitle Overlay */}
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
