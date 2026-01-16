'use client';

import { type LucideIcon } from 'lucide-react';

interface CircularActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  backgroundColor: '#DD8A90' | '#94A395' | '#861309' | '#4F5F3F';
  size?: 'default' | 'small';
}

export function CircularActionButton({
  icon: Icon,
  label,
  onClick,
  backgroundColor,
  size = 'default',
}: CircularActionButtonProps) {
  const dimensions = size === 'small' ? { circle: 60, icon: 32 } : { circle: 83, icon: 48 };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer p-0"
      aria-label={label}
    >
      <div
        style={{
          width: `${dimensions.circle}px`,
          height: `${dimensions.circle}px`,
          borderRadius: '50%',
          background: backgroundColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 5px rgba(0,0,0,0.3)',
        }}
      >
        <Icon
          style={{
            width: `${dimensions.icon}px`,
            height: `${dimensions.icon}px`,
            color: 'white',
          }}
        />
      </div>
      <span
        style={{
          fontFamily: 'var(--font-josefin-sans)',
          fontSize: size === 'small' ? '15px' : '20px',
          fontWeight: 500,
          color: 'white',
          textShadow: '0 0 5px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  );
}
