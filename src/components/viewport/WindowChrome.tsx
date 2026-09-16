import React from 'react';
import { Lock, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrafficLights } from '../common/TrafficLights';
import { FrameConfig } from '../../types/project';

interface WindowChromeProps {
  frame: FrameConfig;
  cornerRadiusPx?: number;
  aspectRatio?: number;
  width?: number;
  height?: number;
  children: React.ReactNode;
}

export function WindowChrome({
  frame,
  cornerRadiusPx = 24,
  aspectRatio,
  width,
  height,
  children,
}: WindowChromeProps) {
  const isFrameless = frame.type === 'frameless';

  return (
    <div
      style={{
        borderRadius: `${cornerRadiusPx}px`,
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        maxWidth: '100%',
        maxHeight: '100%',
      }}
      className={`relative flex flex-col overflow-hidden bg-[#121216] transition-[width,height,border-radius] duration-150 ${
        isFrameless
          ? 'border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
          : 'border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_24px_64px_rgba(0,0,0,0.65)]'
      }`}
    >
      {/* Titlebar / Chrome Header (Rendered on top when frame is not frameless) */}
      {!isFrameless && (
        <div className="h-10 px-4 shrink-0 flex items-center justify-between border-b border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.01] select-none">
          {/* Traffic Lights */}
          <div className="flex items-center gap-3">
            {frame.showTrafficLights && <TrafficLights size="md" />}

            {/* Navigation Arrows for Safari */}
            {frame.type === 'safari' && (
              <div className="flex items-center gap-1 ml-2 text-zinc-500">
                <ChevronLeft className="w-3.5 h-3.5 hover:text-zinc-300 cursor-pointer" />
                <ChevronRight className="w-3.5 h-3.5 hover:text-zinc-300 cursor-pointer opacity-50" />
              </div>
            )}
          </div>

          {/* Safari URL Header Pill */}
          {frame.type === 'safari' && (
            <div className="flex-1 max-w-sm mx-4 h-6 px-3 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-1.5 truncate">
                <Lock className="w-2.5 h-2.5 text-zinc-400" />
                <span className="truncate font-medium">{frame.url}</span>
              </div>
              <RotateCw className="w-2.5 h-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer" />
            </div>
          )}

          {/* macOS Clean Header */}
          {frame.type === 'macos_clean' && (
            <div className="flex-1 text-center truncate text-[12px] font-medium text-zinc-400">
              {frame.title}
            </div>
          )}

          {/* Right side spacer */}
          <div className="w-12" />
        </div>
      )}

      {/* Screen Video / App Content Container */}
      <div
        style={!width && aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
        className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center min-h-0"
      >
        {children}
      </div>
    </div>
  );
}

