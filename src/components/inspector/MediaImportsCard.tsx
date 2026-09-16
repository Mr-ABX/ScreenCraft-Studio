import React, { useRef } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Film,
  Upload,
  Monitor,
  Sparkles,
  FileVideo,
  Clock,
  Volume2,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

export function MediaImportsCard() {
  const {
    project,
    videoSourceUrl,
    videoSourceBlob,
    isDemoMode,
    setVideoSource,
    setRecordModalOpen,
    loadDemoProject,
    clearProject,
    setCustomBackgroundImage,
  } = useStudioStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      {/* 1. Active Media Source Details */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileVideo className="w-3.5 h-3.5 text-zinc-500" />
          <span>Active Video Source</span>
        </label>

        {videoSourceUrl || isDemoMode ? (
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <Film className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate max-w-[170px]">
                    {project.title || 'Active Video Clip'}
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {formatDuration(project.durationSeconds)}
                    </span>
                    <span>•</span>
                    <span>60 FPS</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={clearProject}
                title="Remove Video"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Replace / Record Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-[11px] font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span>Replace Video</span>
              </button>

              <button
                type="button"
                onClick={() => setRecordModalOpen(true)}
                className="py-2 px-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[11px] font-semibold border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5 text-rose-400" />
                <span>Record New</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-3">
            <p className="text-xs text-zinc-400">
              No video imported yet. Upload a recording or start a new capture.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Video (.mp4, .mov)</span>
              </button>

              <button
                type="button"
                onClick={() => setRecordModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                <span>Record Screen Stream</span>
              </button>

              <button
                type="button"
                onClick={loadDemoProject}
                className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Load Demo Showcase</span>
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setVideoSource(f);
          }}
        />
      </div>

      <div className="w-full h-[1px] bg-white/[0.06]" />

      {/* 2. Custom Background Assets */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
          <span>Custom Studio Wallpaper</span>
        </label>

        <p className="text-[11px] text-zinc-400">
          Upload custom high-res images, brand logos, or office wallpapers to render behind the 3D window mockup.
        </p>

        <button
          type="button"
          onClick={() => bgInputRef.current?.click()}
          className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4 text-zinc-400" />
          <span>Upload Background Image</span>
        </button>

        <input
          ref={bgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setCustomBackgroundImage(f);
          }}
        />
      </div>
    </div>
  );
}
