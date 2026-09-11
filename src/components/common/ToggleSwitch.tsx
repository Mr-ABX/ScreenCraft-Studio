import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  className?: string;
}

export function ToggleSwitch({
  label,
  checked,
  onChange,
  description,
  className,
}: ToggleSwitchProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-3 py-1 cursor-pointer select-none',
        className
      )}
      onClick={() => onChange(!checked)}
    >
      <div>
        <div className="text-[12px] font-medium text-zinc-200">{label}</div>
        {description && (
          <div className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
            {description}
          </div>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={clsx(
          'relative w-9 h-5 rounded-full transition-colors duration-200 p-0.5 outline-none cursor-pointer flex-shrink-0',
          checked
            ? 'bg-indigo-600 border border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
            : 'bg-white/[0.1] border border-white/[0.08]'
        )}
      >
        <motion.div
          animate={{ x: checked ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-4 h-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
        />
      </button>
    </div>
  );
}
