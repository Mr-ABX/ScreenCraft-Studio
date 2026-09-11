import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'raised' | 'floating' | 'subtle';
  children: React.ReactNode;
}

export function GlassPanel({
  variant = 'base',
  className,
  children,
  ...props
}: GlassPanelProps) {
  const variantStyles = {
    base: 'bg-[#101014]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_32px_rgba(0,0,0,0.4)]',
    raised: 'bg-[#16161c]/85 backdrop-blur-3xl border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_16px_40px_rgba(0,0,0,0.5)]',
    floating: 'bg-[#1c1c24]/90 backdrop-blur-3xl border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_24px_64px_rgba(0,0,0,0.6)]',
    subtle: 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  };

  return (
    <div
      className={twMerge(
        'rounded-2xl transition-all duration-200',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
