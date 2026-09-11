import React from 'react';
import { clsx } from 'clsx';

interface NumberSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function NumberSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  defaultValue,
  onChange,
  className,
}: NumberSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleReset = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
    }
  };

  return (
    <div className={clsx('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-400 font-medium">{label}</span>
        <button
          type="button"
          onDoubleClick={handleReset}
          title="Double-click to reset"
          className="font-mono text-zinc-200 hover:text-white transition-colors cursor-pointer"
        >
          {value}
          <span className="text-zinc-500 ml-0.5">{unit}</span>
        </button>
      </div>

      <div className="relative flex items-center group">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/[0.08] rounded-full appearance-none cursor-pointer outline-none transition-all focus:bg-white/[0.12]
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3.5
          [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.3)]
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-115
          [&::-webkit-slider-thumb]:active:scale-95"
          style={{
            background: `linear-gradient(to right, #6366F1 0%, #6366F1 ${percentage}%, rgba(255,255,255,0.08) ${percentage}%, rgba(255,255,255,0.08) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
