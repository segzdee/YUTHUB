import React from 'react';
import { cn } from '@/lib/utils';

interface SpacingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  direction?: 'all' | 'horizontal' | 'vertical' | 'top' | 'bottom' | 'left' | 'right';
  type?: 'padding' | 'margin';
  className?: string;
  children: React.ReactNode;
}

const sizeMap = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
};

const getSpacingClasses = (size: string, direction: string, type: string) => {
  const prefix = type === 'padding' ? 'p' : 'm';
  const sizeClass = size === 'xs' ? '1' : 
                   size === 'sm' ? '2' :
                   size === 'md' ? '4' :
                   size === 'lg' ? '6' :
                   size === 'xl' ? '8' :
                   size === '2xl' ? '12' :
                   size === '3xl' ? '16' :
                   size === '4xl' ? '24' : '4';

  switch (direction) {
    case 'horizontal':
      return `${prefix}x-${sizeClass}`;
    case 'vertical':
      return `${prefix}y-${sizeClass}`;
    case 'top':
      return `${prefix}t-${sizeClass}`;
    case 'bottom':
      return `${prefix}b-${sizeClass}`;
    case 'left':
      return `${prefix}l-${sizeClass}`;
    case 'right':
      return `${prefix}r-${sizeClass}`;
    default:
      return `${prefix}-${sizeClass}`;
  }
};

export function Spacing({
  size = 'md',
  direction = 'all',
  type = 'padding',
  className,
  children,
}: SpacingProps) {
  const spacingClass = getSpacingClasses(size, direction, type);
  
  return (
    <div className={cn(spacingClass, className)}>
      {children}
    </div>
  );
}

// Convenient spacing components
export const Stack = ({ 
  gap = 'md', 
  direction = 'vertical',
  align = 'start',
  justify = 'start',
  className,
  children 
}: {
  gap?: SpacingProps['size'];
  direction?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  className?: string;
  children: React.ReactNode;
}) => {
  const gapClass = gap === 'xs' ? 'gap-1' : 
                  gap === 'sm' ? 'gap-2' :
                  gap === 'md' ? 'gap-4' :
                  gap === 'lg' ? 'gap-6' :
                  gap === 'xl' ? 'gap-8' :
                  gap === '2xl' ? 'gap-12' :
                  gap === '3xl' ? 'gap-16' :
                  gap === '4xl' ? 'gap-24' : 'gap-4';

  const flexDirection = direction === 'horizontal' ? 'flex-row' : 'flex-col';
  
  const alignItems = align === 'center' ? 'items-center' :
                    align === 'end' ? 'items-end' :
                    align === 'stretch' ? 'items-stretch' :
                    'items-start';

  const justifyContent = justify === 'center' ? 'justify-center' :
                        justify === 'end' ? 'justify-end' :
                        justify === 'between' ? 'justify-between' :
                        justify === 'around' ? 'justify-around' :
                        justify === 'evenly' ? 'justify-evenly' :
                        'justify-start';

  return (
    <div className={cn(
      'flex',
      flexDirection,
      gapClass,
      alignItems,
      justifyContent,
      className
    )}>
      {children}
    </div>
  );
};

export const Grid = ({
  cols = 1,
  gap = 'md',
  className,
  children
}: {
  cols?: number | 'auto-fit' | 'auto-fill';
  gap?: SpacingProps['size'];
  className?: string;
  children: React.ReactNode;
}) => {
  const gapClass = gap === 'xs' ? 'gap-1' : 
                  gap === 'sm' ? 'gap-2' :
                  gap === 'md' ? 'gap-4' :
                  gap === 'lg' ? 'gap-6' :
                  gap === 'xl' ? 'gap-8' :
                  gap === '2xl' ? 'gap-12' :
                  gap === '3xl' ? 'gap-16' :
                  gap === '4xl' ? 'gap-24' : 'gap-4';

  const gridCols = typeof cols === 'number' ? 
    `grid-cols-${cols}` :
    cols === 'auto-fit' ? 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]' :
    'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]';

  return (
    <div className={cn(
      'grid',
      gridCols,
      gapClass,
      className
    )}>
      {children}
    </div>
  );
};