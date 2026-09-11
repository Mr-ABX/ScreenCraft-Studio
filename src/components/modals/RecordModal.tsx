import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Monitor,
  Camera,
  Mic,
  Volume2,
  X,
  Play,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export function RecordModal() {
  const { isRecordModalOpen, setRecordModalOpen, setIsPlaying } = useStudioStore();

  const [captureSource, setCaptureSource] = useState<'screen' | 'window'>('screen');
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [systemAudioEnabled, setSystemAudioEnabled] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  if (!isRecordModalOpen) return null;

  const handleStartCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setRecordModalOpen(false);
          setCountdown(null);
          setIsPlaying(true);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl select-none p-4">
      <AnimatePresence mode="wait">
        {countdown !== null ? (
          <motion.div
            key="countdown"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <span className="font-mono text-9xl font-black text-white drop-shadow-[0_0_40px_rgba(99,102,241,0.8)]">
              {countdown}
            </span>
            <span className="text-zinc-400 font-medium text-sm mt-4">
              Get ready to record...
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="modal"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="w-full max-w-lg rounded-3xl bg-[#14141a]/95 border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_32px_80px_rgba(0,0,0,0.8)] p-6 space-y-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Screen & Audio Recording
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Capture 4K screen stream with sub-pixel mouse telemetry
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRecordModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Capture Surface
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCaptureSource('screen')}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                    captureSource === 'screen'
                      ? 'border-indigo-500/80 bg-indigo-500/15 shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                      : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <Monitor className="w-6 h-6 text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Entire Display
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Retina 4K (Up to 120fps)
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCaptureSource('window')}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                    captureSource === 'window'
                      ? 'border-indigo-500/80 bg-indigo-500/15 shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                      : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <Monitor className="w-6 h-6 text-zinc-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Application Window
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Isolated App Bounding Box
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Stream Toggles */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Inputs & Overlays
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWebcamEnabled(!webcamEnabled)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    webcamEnabled
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                      : 'border-white/[0.08] bg-white/[0.03] text-zinc-500'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Camera PiP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    micEnabled
                      ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-300'
                      : 'border-white/[0.08] bg-white/[0.03] text-zinc-500'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Microphone</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSystemAudioEnabled(!systemAudioEnabled)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    systemAudioEnabled
                      ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-300'
                      : 'border-white/[0.08] bg-white/[0.03] text-zinc-500'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-[11px] font-medium">System Audio</span>
                </button>
              </div>
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={handleStartCountdown}
              className="w-full py-3 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-semibold text-sm border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>Start Recording</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
