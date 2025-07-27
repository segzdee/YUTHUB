import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'light' | 'dark';
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    icon: 'h-4 w-4',
    text: 'text-lg',
  },
  md: {
    icon: 'h-6 w-6',
    text: 'text-xl',
  },
  lg: {
    icon: 'h-8 w-8',
    text: 'text-2xl',
  },
  xl: {
    icon: 'h-12 w-12',
    text: 'text-4xl',
  },
};

const variantConfig = {
  default: {
    icon: 'text-primary',
    text: 'text-foreground',
  },
  light: {
    icon: 'text-white',
    text: 'text-white',
  },
  dark: {
    icon: 'text-neutral-900',
    text: 'text-neutral-900',
  },
};

export default function BrandLogo({
  size = 'md',
  variant = 'default',
  showText = true,
  className,
}: BrandLogoProps) {
  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Building2
        className={cn(sizeStyles.icon, variantStyles.icon)}
        aria-hidden='true'
      />
      {showText && (
        <span
          className={cn(
            'font-bold tracking-tight',
            sizeStyles.text,
            variantStyles.text
          )}
        >
          YUTHUB
        </span>
      )}
    </div>
  );
}

// Favicon component for HTML head
export function YuthubFavicon() {
  return (
    <svg
      width='32'
      height='32'
      viewBox='0 0 32 32'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect width='32' height='32' rx='8' fill='#3B82F6' />
      <path
        d='M8 12C8 10.3431 9.34315 9 11 9H21C22.6569 9 24 10.3431 24 12V20C24 21.6569 22.6569 23 21 23H11C9.34315 23 8 21.6569 8 20V12Z'
        stroke='white'
        strokeWidth='2'
      />
      <path
        d='M12 13H20M12 16H20M12 19H17'
        stroke='white'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  );
}
