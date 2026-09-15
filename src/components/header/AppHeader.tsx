import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  Download,
  Film,
  PlusCircle,
  Video,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { SegmentedControl } from '../common/SegmentedControl';
import { AspectRatio } from '../../types/project';

export function AppHeader() {
  const {
    project,
    setProjectTitle,
    setAspectRatio,
    setRecordModalOpen,
    setExportModalOpen,
    setVideoSource,
    loadDemoProject,
    clearProject,
    isDemoMode,
  } = useStudioStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      setProjectTitle(titleInput.trim());
    } else {
      setTitleInput(project.title);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoSource(file);
    }
  };

  return (
    <header className="h-12 w-full px-4 flex items-center justify-between border-b border-white/[0.08] bg-[#0c0c10]/95 backdrop-blur-2xl select-none z-30">
      {/* Left: Clean Brand Logo & Project Title (Traffic lights removed for web shell) */}
      <div className="flex items-center gap-3 min-w-[280px]">
        {/* Studio Brand Icon */}
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 border border-white/20 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>

        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              autoFocus
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="px-2 py-0.5 text-[12px] font-medium text-white bg-white/[0.08] border border-indigo-500/50 rounded-md outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="text-[12px] font-semibold text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/[0.05] cursor-pointer"
            >
              <span>{project.title || 'ScreenCraft Studio'}</span>
              <span className="text-[10px] text-zinc-500 font-mono font-normal">.screencraft</span>
            </button>
          )}

          {isDemoMode && (
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-mono text-indigo-300">
              DEMO
            </span>
          )}
        </div>
      </div>

      {/* Center: Aspect Ratio & Canvas Presets */}
      <div className="flex items-center gap-2">
        <SegmentedControl<AspectRatio>
          size="sm"
          value={project.canvas.aspectRatio}
          onChange={setAspectRatio}
          options={[
            { value: '16:9', label: '16:9', icon: <span className="text-[9px]">🖥️</span> },
            { value: '9:16', label: '9:16', icon: <span className="text-[9px]">📱</span> },
            { value: '1:1', label: '1:1', icon: <span className="text-[9px]">⏹️</span> },
            { value: '4:5', label: '4:5', icon: <span className="text-[9px]">📸</span> },
          ]}
        />
      </div>

      {/* Right: Demo Loader, Record, Import, and Export Buttons */}
      <div className="flex items-center gap-2.5 min-w-[280px] justify-end">
        {/* Load Demo Project */}
        {!isDemoMode ? (
          <button
            type="button"
            onClick={loadDemoProject}
            title="Load sample demo video with zoom keyframes"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-xl text-indigo-300 hover:text-white bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 transition-all cursor-pointer"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Load Demo</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={clearProject}
            title="Start a fresh empty project"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        )}

        {/* Record New Button */}
        <button
          type="button"
          onClick={() => setRecordModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-xl text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Record</span>
        </button>

        {/* Media Import */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-xl text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95">
          <Upload className="w-3.5 h-3.5 text-zinc-400" />
          <span>Import</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </label>

        {/* Export Video Button */}
        <button
          type="button"
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold rounded-xl text-white bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_12px_rgba(99,102,241,0.35)] transition-all cursor-pointer active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
          <span className="text-[10px] text-indigo-200/70 ml-0.5 font-mono">⌘E</span>
        </button>
      </div>
    </header>
  );
}
