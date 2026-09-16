import {
  FolderOpen,
  Layers,
  ZoomIn,
  MousePointer2,
  Sparkles,
  Captions,
  Volume2,
  Settings,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { ActiveToolTab } from '../../types/project';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export function LeftNav() {
  const { activeTab, setActiveTab } = useStudioStore();

  const tools: { id: ActiveToolTab; label: string; icon: React.ReactNode }[] = [
    { id: 'media', label: 'Media & Imports', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'canvas', label: 'Canvas & Frame', icon: <Layers className="w-4 h-4" /> },
    { id: 'zoom', label: 'Auto-Zoom', icon: <ZoomIn className="w-4 h-4" /> },
    { id: 'cursor', label: 'Cursor Studio', icon: <MousePointer2 className="w-4 h-4" /> },
    { id: 'effects', label: 'Effects & Polish', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'subtitles', label: 'Subtitles', icon: <Captions className="w-4 h-4" /> },
    { id: 'audio', label: 'Audio', icon: <Volume2 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-14 h-full flex flex-col items-center py-3 justify-between border-r border-white/[0.08] bg-[#0c0c10]/80 backdrop-blur-2xl select-none z-20">
      {/* Top Tool Buttons */}
      <div className="flex flex-col items-center gap-2">
        {tools.map((tool) => {
          const isActive = activeTab === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveTab(tool.id)}
              title={tool.label}
              className={clsx(
                'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer outline-none group',
                isActive
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
              )}
            >
              {tool.icon}

              {isActive && (
                <motion.div
                  layoutId="leftnav_active_indicator"
                  className="absolute inset-0 rounded-xl bg-white/[0.1] border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              {/* Tooltip on Hover */}
              <div className="absolute left-14 px-2 py-1 bg-zinc-900/90 text-white text-[11px] font-medium rounded-md shadow-lg border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {tool.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Settings Button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          title="Settings"
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer',
            activeTab === 'settings'
              ? 'text-white bg-white/[0.1]'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
          )}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
