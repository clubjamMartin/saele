import { Maximize2 } from '@/components/ui/icons';

interface ExpandButtonProps {
  onClick?: () => void;
  backgroundColor: '#861309' | '#4F5F3F' | '#94A395' | '#DD8A90';
  iconColor?: 'white' | '#861309';
  size?: 'default' | 'small';
  ariaLabel?: string;
}

export function ExpandButton({
  onClick,
  backgroundColor,
  iconColor = 'white',
  size = 'default',
  ariaLabel = 'Erweitern',
}: ExpandButtonProps) {
  const dimensions = size === 'small' ? { button: 20, icon: 14 } : { button: 25, icon: 16 };

  const iconClass = iconColor === 'white' ? 'text-white' : 'text-[#861309]';
  const iconSizeClass = size === 'small' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center border-none cursor-pointer hover:opacity-80 transition-opacity"
      style={{
        width: `${dimensions.button}px`,
        height: `${dimensions.button}px`,
        background: backgroundColor,
        borderRadius: '5px',
      }}
      aria-label={ariaLabel}
    >
      <Maximize2 className={`${iconSizeClass} ${iconClass}`} />
    </button>
  );
}
