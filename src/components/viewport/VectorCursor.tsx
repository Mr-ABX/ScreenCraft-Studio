import { motion } from 'framer-motion';
import { CursorConfig } from '../../types/project';

interface VectorCursorProps {
  config: CursorConfig;
  position: { x: number; y: number }; // normalized [0, 1]
  isClicking?: boolean;
}

export function VectorCursor({
  config,
  position,
  isClicking = false,
}: VectorCursorProps) {
  const scale = config.scale || 1.4;

  return (
    <div
      className="absolute pointer-events-none z-40 transform -translate-x-1 -translate-y-1"
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
      }}
    >
      {/* Click Halo Ripple Shockwave */}
      {config.clickEffect.enabled && isClicking && (
        <motion.div
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute -top-4 -left-4 w-12 h-12 rounded-full border-2 border-indigo-400/80 bg-indigo-500/25 shadow-[0_0_16px_rgba(99,102,241,0.6)]"
        />
      )}

      {/* High-DPI Vector macOS Arrow Cursor */}
      {config.style === 'macos_arrow' && (
        <motion.svg
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
        >
          <path
            d="M3 3L10.5 21L13.5 13.5L21 10.5L3 3Z"
            fill="black"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}

      {/* Pointer Hand Cursor */}
      {config.style === 'pointer' && (
        <motion.svg
          animate={{ scale }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
        >
          <path
            d="M8 3V13M8 13L4.5 9.5L3 11L8.5 16.5C10 18 11.5 19 13.5 19H17C19.2 19 21 17.2 21 15V9.5C21 8.7 20.3 8 19.5 8C19 8 18.5 8.3 18.2 8.7C17.9 8.3 17.4 8 16.8 8C16.3 8 15.8 8.3 15.5 8.7C15.2 8.3 14.7 8 14.1 8C13.3 8 12.6 8.7 12.6 9.5V11"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="black"
          />
        </motion.svg>
      )}

      {/* Glow Dot Cursor */}
      {config.style === 'glow_dot' && (
        <motion.div
          animate={{ scale }}
          className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-[0_0_12px_rgba(99,102,241,0.8)]"
        />
      )}
    </div>
  );
}
