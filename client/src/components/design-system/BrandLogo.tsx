import { cn } from '@/lib/utils';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'light' | 'dark';
  showText?: boolean;
  showSlogan?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    logo: 'h-6 w-6',
    text: 'text-base',
    slogan: 'text-[10px]',
  },
  md: {
    logo: 'h-8 w-8',
    text: 'text-xl',
    slogan: 'text-xs',
  },
  lg: {
    logo: 'h-12 w-12',
    text: 'text-3xl',
    slogan: 'text-sm',
  },
  xl: {
    logo: 'h-16 w-16',
    text: 'text-4xl',
    slogan: 'text-base',
  },
};

const variantConfig = {
  default: {
    gradient: 'from-blue-600 to-cyan-500',
    text: 'text-slate-900',
    slogan: 'text-slate-600',
  },
  light: {
    gradient: 'from-blue-600 to-cyan-500',
    text: 'text-slate-900',
    slogan: 'text-slate-700',
  },
  dark: {
    gradient: 'from-blue-500 to-cyan-400',
    text: 'text-white',
    slogan: 'text-slate-300',
  },
};

export default function BrandLogo({
  size = 'md',
  variant = 'default',
  showText = true,
  showSlogan = false,
  className,
}: BrandLogoProps) {
  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative rounded-xl bg-gradient-to-br shadow-lg',
          variantStyles.gradient,
          sizeStyles.logo,
          'flex items-center justify-center flex-shrink-0'
        )}
        aria-hidden='true'
      >
        <svg
          viewBox='0 0 24 24'
          fill='none'
          className='w-3/4 h-3/4'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z'
            stroke='white'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M9 22V12H15V22'
            stroke='white'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
      {showText && (
        <div className='flex flex-col'>
          <span
            className={cn(
              'font-bold tracking-tight leading-none',
              sizeStyles.text,
              variantStyles.text
            )}
          >
            YUTHUB
          </span>
          {showSlogan && (
            <span
              className={cn(
                'font-medium tracking-wide uppercase mt-0.5',
                sizeStyles.slogan,
                variantStyles.slogan
              )}
            >
              Empowering Youth. Building Futures.
            </span>
          )}
        </div>
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
      <defs>
        <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#2563EB' />
          <stop offset='100%' stopColor='#06B6D4' />
        </linearGradient>
      </defs>
      <rect width='32' height='32' rx='8' fill='url(#gradient)' />
      <path
        d='M6 14L16 7L26 14V24C26 24.5304 25.7893 25.0391 25.4142 25.4142C25.0391 25.7893 24.5304 26 24 26H8C7.46957 26 6.96086 25.7893 6.58579 25.4142C6.21071 25.0391 6 24.5304 6 24V14Z'
        stroke='white'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 26V17H20V26'
        stroke='white'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
