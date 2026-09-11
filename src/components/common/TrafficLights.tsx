import React from 'react';
import { clsx } from 'clsx';

interface TrafficLightsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export function TrafficLights({
  size = 'md',
  className,
  onClose,
  onMinimize,
  onMaximize,
}: TrafficLightsProps) {
  const sizeMap = {
    sm: 'w-2.5 h-2.5 gap-1.5',
    md: 'w-3 h-3 gap-2',
    lg: 'w-3.5 h-3.5 gap-2.5',
  };

  const buttonSize = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  };

  return (
    <div className={clsx('flex items-center group', sizeMap[size], className)}>
      {/* Close (Red) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close window"
        className={clsx(
          'rounded-full bg-[#FF5F56] border border-[#E0443E]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer',
          buttonSize[size]
        )}
      >
        <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#4c0002] transition-opacity leading-none">
          ✕
        </span>
      </button>

      {/* Minimize (Yellow) */}
      <button
        type="button"
        onClick={onMinimize}
        aria-label="Minimize window"
        className={clsx(
          'rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer',
          buttonSize[size]
        )}
      >
        <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#5c3c00] transition-opacity leading-none">
          –
        </span>
      </button>

      {/* Maximize (Green) */}
      <button
        type="button"
        onClick={onMaximize}
        aria-label="Zoom window"
        className={clsx(
          'rounded-full bg-[#27C93F] border border-[#1AAB29]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer',
          buttonSize[size]
        )}
      >
        <span className="opacity-0 group-hover:opacity-100 text-[7px] font-bold text-[#003808] transition-opacity leading-none">
          ＋
        </span>
      </button>
    </div>
  );
}
