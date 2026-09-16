import React, { useEffect, useRef } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Scissors,
  Copy,
  Trash2,
  Plus,
  RotateCcw,
  RotateCw,
  ZoomIn,
} from 'lucide-react';

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetType: 'video' | 'zoom' | 'track';
  clipId?: string;
  clickTime?: number;
}

interface TimelineContextMenuProps {
  menuState: ContextMenuState;
  onClose: () => void;
}

export function TimelineContextMenu({
  menuState,
  onClose,
}: TimelineContextMenuProps) {
  const {
    splitAtPlayhead,
    duplicateClip,
    deleteVideoClip,
    deleteZoomClip,
    addZoomClip,
    updateZoomClip,
    undo,
    redo,
    canUndo,
    canRedo,
    project,
  } = useStudioStore();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (menuState.isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuState.isOpen, onClose]);

  if (!menuState.isOpen) return null;

  // Bound within viewport bounds
  const menuWidth = 210;
  const menuHeight = 260;
  const adjustedX = Math.min(window.innerWidth - menuWidth - 12, menuState.x);
  const adjustedY = Math.min(window.innerHeight - menuHeight - 12, menuState.y);

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-52 p-1.5 rounded-2xl bg-[#12131a]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] text-xs text-zinc-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* 1. Split at Playhead */}
      <button
        type="button"
        onClick={() => {
          splitAtPlayhead(menuState.clickTime);
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <Scissors className="w-3.5 h-3.5 text-indigo-400" />
          <span>Split at Playhead</span>
        </div>
        <kbd className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
          S
        </kbd>
      </button>

      {/* 2. Duplicate Clip */}
      <button
        type="button"
        disabled={!menuState.clipId}
        onClick={() => {
          if (menuState.clipId) duplicateClip(menuState.clipId);
          onClose();
        }}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
          menuState.clipId
            ? 'hover:bg-white/10 text-zinc-200'
            : 'text-zinc-600 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-2">
          <Copy className="w-3.5 h-3.5 text-zinc-400" />
          <span>Duplicate Clip</span>
        </div>
        <kbd className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
          D
        </kbd>
      </button>

      {/* 3. Delete Clip */}
      <button
        type="button"
        disabled={!menuState.clipId}
        onClick={() => {
          if (menuState.clipId) {
            if (menuState.targetType === 'zoom') {
              deleteZoomClip(menuState.clipId);
            } else {
              deleteVideoClip(menuState.clipId);
            }
          }
          onClose();
        }}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
          menuState.clipId
            ? 'hover:bg-rose-500/20 text-rose-300'
            : 'text-zinc-600 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-2">
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Delete Clip</span>
        </div>
        <kbd className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
          Del
        </kbd>
      </button>

      <div className="w-full h-[1px] bg-white/10 my-1" />

      {/* 4. Add Zoom at clicked position */}
      <button
        type="button"
        onClick={() => {
          const t = menuState.clickTime !== undefined ? menuState.clickTime : 0;
          addZoomClip({
            startTime: Math.round(t * 10) / 10,
            endTime: Math.min(
              project.durationSeconds,
              Math.round((t + 4.0) * 10) / 10
            ),
            zoomFactor: project.camera.defaultZoomFactor || 2.0,
            focusTarget: { x: 0.5, y: 0.5 },
          });
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add Zoom Keyframe</span>
        </div>
        <kbd className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
          Z
        </kbd>
      </button>

      {/* 5. Zoom Presets (if zoom clip) */}
      {menuState.targetType === 'zoom' && menuState.clipId && (
        <div className="pt-1 pb-1">
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <ZoomIn className="w-3 h-3 text-indigo-400" />
            <span>Set Magnification</span>
          </div>
          <div className="grid grid-cols-4 gap-1 px-2">
            {[1.2, 1.5, 2.0, 2.5].map((factor) => (
              <button
                key={factor}
                type="button"
                onClick={() => {
                  if (menuState.clipId) {
                    updateZoomClip(menuState.clipId, { zoomFactor: factor });
                  }
                  onClose();
                }}
                className="py-1 rounded-lg bg-white/5 hover:bg-indigo-600 hover:text-white text-[10px] font-mono font-bold text-zinc-300 transition-colors cursor-pointer text-center"
              >
                {factor}x
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full h-[1px] bg-white/10 my-1" />

      {/* 6. Undo / Redo */}
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => {
          undo();
          onClose();
        }}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
          canUndo
            ? 'hover:bg-white/10 text-zinc-200'
            : 'text-zinc-600 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Undo</span>
        </div>
        <kbd className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
          ⌘Z
        </kbd>
      </button>

      <button
        type="button"
        disabled={!canRedo}
        onClick={() => {
          redo();
          onClose();
        }}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
          canRedo
            ? 'hover:bg-white/10 text-zinc-200'
            : 'text-zinc-600 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-2">
          <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Redo</span>
        </div>
        <kbd className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
          ⌘⇧Z
        </kbd>
      </button>
    </div>
  );
}
