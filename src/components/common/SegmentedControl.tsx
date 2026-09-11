import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  const sizeStyles = {
    sm: 'p-0.5 gap-0.5 text-[11px] h-7',
    md: 'p-1 gap-1 text-[12px] h-9',
    lg: 'p-1.5 gap-1.5 text-[13px] h-11',
  };

  const itemPadding = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  };

  return (
    <div
      className={twMerge(
        'relative inline-flex items-center rounded-xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-md',
        sizeStyles[size],
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              'relative z-10 flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors duration-150 outline-none cursor-pointer select-none',
              itemPadding[size],
              isSelected
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {option.icon && (
              <span className="w-3.5 h-3.5 flex items-center justify-center">
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>

            {isSelected && (
              <motion.div
                layoutId={`segmented_active_indicator_${options.map(o => o.value).join('_')}`}
                className="absolute inset-0 z-[-1] rounded-lg bg-white/[0.12] border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.3)]"
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 35,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
