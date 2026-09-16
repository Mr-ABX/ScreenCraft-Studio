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
  const haloColor = config.clickEffect?.color || '#6366f1';

  return (
    <div
      className="absolute pointer-events-none z-40 transform -translate-x-1 -translate-y-1 transition-[opacity] duration-200"
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
      }}
    >
      {/* Click Halo Ripple Shockwave */}
      {config.clickEffect.enabled && isClicking && (
        <motion.div
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            borderColor: haloColor,
            backgroundColor: `${haloColor}33`,
            boxShadow: `0 0 20px ${haloColor}99`,
          }}
          className="absolute -top-5 -left-5 w-14 h-14 rounded-full border-2"
        />
      )}

      {/* 1. macOS Dark Modern Arrow Cursor */}
      {config.style === 'macos_arrow' && (
        <motion.svg
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          <path
            d="M3 3L10.5 21L13.5 13.5L21 10.5L3 3Z"
            fill="#111115"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}

      {/* 2. macOS Light / Classic Arrow Cursor */}
      {config.style === 'macos_white' && (
        <motion.svg
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
        >
          <path
            d="M3 3L10.5 21L13.5 13.5L21 10.5L3 3Z"
            fill="#FFFFFF"
            stroke="#111115"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}

      {/* 3. Windows 11 Fluent Arrow Cursor */}
      {config.style === 'windows_arrow' && (
        <motion.svg
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
        >
          <path
            d="M4 2L4 20L8.5 15.5L12.5 23L15.5 21.5L11.5 14L18 14L4 2Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}

      {/* 4. Pointer Hand Cursor */}
      {config.style === 'pointer' && (
        <motion.svg
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          <path
            d="M8 3V13M8 13L4.5 9.5L3 11L8.5 16.5C10 18 11.5 19 13.5 19H17C19.2 19 21 17.2 21 15V9.5C21 8.7 20.3 8 19.5 8C19 8 18.5 8.3 18.2 8.7C17.9 8.3 17.4 8 16.8 8C16.3 8 15.8 8.3 15.5 8.7C15.2 8.3 14.7 8 14.1 8C13.3 8 12.6 8.7 12.6 9.5V11"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#111115"
          />
        </motion.svg>
      )}

      {/* 5. Precision Crosshair Cursor */}
      {config.style === 'precision_cross' && (
        <motion.svg
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
        >
          <circle cx="12" cy="12" r="2.5" fill="#6366f1" stroke="#FFFFFF" strokeWidth="1" />
          <line x1="12" y1="2" x2="12" y2="8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="16" x2="12" y2="22" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="2" y1="12" x2="8" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="12" x2="22" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>
      )}

      {/* 6. Apple Glass Glow Dot Cursor */}
      {config.style === 'glow_dot' && (
        <motion.div
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            backgroundColor: haloColor,
            boxShadow: `0 0 16px ${haloColor}`,
          }}
          className="w-4 h-4 rounded-full border-2 border-white"
        />
      )}
    </div>
  );
}
