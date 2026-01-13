import { cn } from '@/lib/utils/cn';

export interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'light';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
}

const variantStyles = {
  primary: 'bg-[--color-saele-primary] text-white',
  secondary: 'bg-[--color-saele-secondary] text-white',
  light: 'bg-[--color-saele-background] text-[--color-saele-primary]',
};

const roundedStyles = {
  sm: 'rounded-[10px]',
  md: 'rounded-[15px]',
  lg: 'rounded-[20px]',
  xl: 'rounded-[30px]',
};

export function Card({
  className,
  children,
  variant = 'light',
  rounded = 'lg',
}: CardProps) {
  return (
    <div
      className={cn(
        'shadow-sm transition-all duration-200',
        variantStyles[variant],
        roundedStyles[rounded],
        className
      )}
    >
      {children}
    </div>
  );
}
