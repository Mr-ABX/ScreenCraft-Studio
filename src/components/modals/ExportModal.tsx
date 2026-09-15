import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStudioStore } from '../../store/useStudioStore';
import { renderAndExportVideo } from '../../engine/videoExporter';
import {
  Download,
  X,
  Sparkles,
  CheckCircle2,
  Cpu,
  Film,
  Zap,
} from 'lucide-react';

export function ExportModal() {
  const { isExportModalOpen, setExportModalOpen, project, videoElement } = useStudioStore();

  const [resolution, setResolution] = useState<'4k' | '1080p' | '720p'>('1080p');
  const [format, setFormat] = useState<'mp4' | 'prores' | 'gif'>('mp4');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFps, setCurrentFps] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [completedBlob, setCompletedBlob] = useState<Blob | null>(null);

  if (!isExportModalOpen) return null;

  const handleStartExport = async () => {
    // If no video element is loaded yet, create a dummy one for rendering the showcase
    let activeVideo = videoElement;
    if (!activeVideo) {
      activeVideo = document.createElement('video');
      activeVideo.width = 1920;
      activeVideo.height = 1080;
    }

    setIsExporting(true);
    setProgress(0);
    setCompletedBlob(null);

    try {
      const blob = await renderAndExportVideo(activeVideo, project, {
        resolution,
        format,
        onProgress: (p) => {
          setProgress(p.percentage);
          setCurrentFps(p.fps);
          setCurrentFrame(p.currentFrame);
          setTotalFrames(p.totalFrames);
        },
      });

      setCompletedBlob(blob);
      setIsExporting(false);
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!completedBlob) return;
    const url = URL.createObjectURL(completedBlob);
    const a = document.createElement('a');
    a.href = url;
    const ext = completedBlob.type.includes('mp4') ? 'mp4' : 'webm';
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_${resolution}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl select-none p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="w-full max-w-md rounded-3xl bg-[#14141a]/95 border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_32px_80px_rgba(0,0,0,0.8)] p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Film className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Export Studio Video
              </h3>
              <p className="text-xs text-zinc-400">
                Hardware-accelerated GPU export pipeline
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExportModalOpen(false)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isExporting ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
              <Zap className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">
                Rendering {resolution.toUpperCase()} Master Video...
              </div>
              <div className="text-xs font-mono text-indigo-300">
                Hardware Encoding @ {currentFps || 60} FPS
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-0.5 border border-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-150 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-zinc-500">
              <span>Frame {currentFrame} / {totalFrames || '...'}</span>
              <span>{progress}%</span>
            </div>
          </div>
        ) : completedBlob ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-white">
                Render Complete!
              </div>
              <p className="text-xs text-zinc-400">
                {(completedBlob.size / (1024 * 1024)).toFixed(2)} MB • Ready to download
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs border border-white/20 shadow-lg shadow-emerald-600/40 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Video File</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Resolution Picker */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Resolution
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '4k', label: '4K Ultra HD', badge: '2160p' },
                  { id: '1080p', label: 'Full HD', badge: '1080p' },
                  { id: '720p', label: 'Fast Preview', badge: '720p' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setResolution(item.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      resolution === item.id
                        ? 'border-indigo-500/80 bg-indigo-500/15 text-white'
                        : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-xs font-semibold">{item.label}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{item.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Picker */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mp4', label: 'MP4 (H.264)', desc: 'High Bitrate' },
                  { id: 'prores', label: 'ProRes 422', desc: 'Master HQ' },
                  { id: 'gif', label: 'Animated GIF', desc: 'Social 60fps' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      format === item.id
                        ? 'border-indigo-500/80 bg-indigo-500/15 text-white'
                        : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-xs font-semibold">{item.label}</span>
                    <span className="text-[10px] text-zinc-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Info Box */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5 text-[11px] text-zinc-400">
              <Cpu className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>
                Using <strong>Hardware GPU</strong> acceleration (Baking background, 3D tilt, zoom, and cursor).
              </span>
            </div>

            {/* Start Export Button */}
            <button
              type="button"
              onClick={handleStartExport}
              className="w-full py-3 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold text-sm border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Render & Export Video</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
