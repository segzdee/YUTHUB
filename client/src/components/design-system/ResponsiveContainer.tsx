import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const maxWidthStyles = {
  sm: 'max-w-sm',      // 24rem (384px)
  md: 'max-w-md',      // 28rem (448px)
  lg: 'max-w-4xl',     // 56rem (896px)
  xl: 'max-w-6xl',     // 72rem (1152px)
  '2xl': 'max-w-7xl',  // 80rem (1280px)
  full: 'max-w-full',
};

const paddingStyles = {
  none: '',
  sm: 'px-4 py-2',
  md: 'px-6 py-4',
  lg: 'px-8 py-6',
};

export function ResponsiveContainer({
  maxWidth = 'lg',
  padding = 'md',
  className,
  children,
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthStyles[maxWidth],
      paddingStyles[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Responsive breakpoint utilities
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
    isLarge: ['xl', '2xl'].includes(breakpoint),
  };
};