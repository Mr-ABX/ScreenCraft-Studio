import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { CanvasCard } from './CanvasCard';
import { CameraCard } from './CameraCard';
import { CursorCard } from './CursorCard';
import { SubtitlesCard } from './SubtitlesCard';
import { AudioCard } from './AudioCard';
import {
  Layers,
  ZoomIn,
  MousePointer2,
  Captions,
  Volume2,
  SlidersHorizontal,
} from 'lucide-react';

export function RightInspector() {
  const { activeTab } = useStudioStore();

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'zoom':
        return { title: 'Camera & Auto-Zoom', icon: <ZoomIn className="w-4 h-4 text-indigo-400" /> };
      case 'cursor':
        return { title: 'Cursor Styling', icon: <MousePointer2 className="w-4 h-4 text-indigo-400" /> };
      case 'frames':
        return { title: 'Window Frames', icon: <Layers className="w-4 h-4 text-indigo-400" /> };
      case 'subtitles':
        return { title: 'AI Kinetic Subtitles', icon: <Captions className="w-4 h-4 text-indigo-400" /> };
      case 'audio':
        return { title: 'Audio & Voice Polish', icon: <Volume2 className="w-4 h-4 text-indigo-400" /> };
      default:
        return { title: 'Canvas & Styling', icon: <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> };
    }
  };

  const { title, icon } = getSectionTitle();

  return (
    <aside className="w-80 h-full flex flex-col border-l border-white/[0.08] bg-[#0c0c10]/85 backdrop-blur-2xl select-none z-20 overflow-hidden">
      {/* Inspector Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-[13px] font-semibold text-white tracking-tight">
            {title}
          </h2>
        </div>
      </div>

      {/* Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {(activeTab === ('canvas' as any) || activeTab === 'frames') && <CanvasCard />}
        {activeTab === 'zoom' && <CameraCard />}
        {activeTab === 'cursor' && <CursorCard />}
        {activeTab === 'subtitles' && <SubtitlesCard />}
        {activeTab === 'audio' && <AudioCard />}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <CanvasCard />
            <div className="w-full h-[1px] bg-white/[0.06]" />
            <CameraCard />
            <div className="w-full h-[1px] bg-white/[0.06]" />
            <CursorCard />
          </div>
        )}
      </div>
    </aside>
  );
}
