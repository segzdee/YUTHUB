import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
  noWrap?: boolean;
}

const variantStyles = {
  h1: 'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight',
  h2: 'text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight',
  h3: 'text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
  h4: 'text-lg md:text-xl lg:text-2xl font-medium leading-snug',
  h5: 'text-base md:text-lg lg:text-xl font-medium leading-normal',
  h6: 'text-sm md:text-base lg:text-lg font-medium leading-normal',
  body1: 'text-base leading-relaxed',
  body2: 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
  overline: 'text-xs uppercase font-medium tracking-wide leading-normal',
};

const colorStyles = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-destructive',
  info: 'text-blue-600 dark:text-blue-400',
  muted: 'text-muted-foreground',
};

const weightStyles = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const alignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function Typography({
  variant = 'body1',
  component,
  className,
  children,
  color,
  weight,
  align,
  truncate,
  noWrap,
  ...props
}: TypographyProps) {
  const Component = component || (variant.startsWith('h') ? variant : 'p') as keyof JSX.IntrinsicElements;
  
  const classes = cn(
    'transition-colors duration-200',
    variantStyles[variant],
    color && colorStyles[color],
    weight && weightStyles[weight],
    align && alignStyles[align],
    truncate && 'truncate',
    noWrap && 'whitespace-nowrap',
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}

// Convenient component variations
export const Heading = ({ level = 1, ...props }: { level?: 1 | 2 | 3 | 4 | 5 | 6 } & Omit<TypographyProps, 'variant'>) => (
  <Typography variant={`h${level}` as TypographyProps['variant']} {...props} />
);

export const Text = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body1" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" {...props} />
);

export const Overline = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="overline" {...props} />
);