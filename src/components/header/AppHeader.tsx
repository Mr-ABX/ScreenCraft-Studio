import React, { useState } from 'react';
import {
  Video,
  Upload,
  Download,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { TrafficLights } from '../common/TrafficLights';
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
    <header className="h-12 w-full px-4 flex items-center justify-between border-b border-white/[0.08] bg-[#0c0c10]/90 backdrop-blur-2xl select-none z-30">
      {/* Left: macOS Traffic Lights & Project Name */}
      <div className="flex items-center gap-4 min-w-[240px]">
        <TrafficLights size="md" />

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
              className="text-[12px] font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/[0.05] cursor-pointer"
            >
              <span>{project.title}</span>
              <span className="text-[10px] text-zinc-500 font-mono">.screencraft</span>
            </button>
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

      {/* Right: Record, Import, and Export Buttons */}
      <div className="flex items-center gap-2.5 min-w-[240px] justify-end">
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
