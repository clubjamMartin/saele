import { cn } from '@/lib/utils/cn';

export interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  'aria-label'?: string;
}

const variantStyles = {
  primary: 'bg-[--color-saele-primary] text-white hover:bg-[--color-saele-primary]/90',
  secondary: 'bg-[--color-saele-secondary] text-white hover:bg-[--color-saele-secondary]/90',
  ghost: 'bg-transparent text-[--color-saele-primary] hover:bg-[--color-saele-primary]/10',
};

export function IconButton({
  icon,
  label,
  onClick,
  variant = 'primary',
  className,
  'aria-label': ariaLabel,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={cn(
        'flex flex-col items-center justify-center gap-2 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-saele-primary]',
        'min-w-[44px] min-h-[44px]', // Accessibility: minimum touch target
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center justify-center">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
