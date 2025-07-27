import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import React from 'react';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline' | 'lead' | 'large' | 'small' | 'muted';
  component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
  className?: string;
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'inherit';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  noWrap?: boolean;
  asChild?: boolean;
}

const variantStyles = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
  h6: 'scroll-m-20 text-base font-semibold tracking-tight',
  body1: 'leading-7',
  body2: 'text-sm leading-6',
  lead: 'text-xl text-muted-foreground',
  large: 'text-lg font-semibold',
  small: 'text-sm font-medium leading-none',
  muted: 'text-sm text-muted-foreground',
  caption: 'text-xs text-muted-foreground',
  overline: 'text-xs uppercase font-medium tracking-wider text-muted-foreground',
};

const colorStyles = {
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
  info: 'text-info',
  muted: 'text-muted-foreground',
  inherit: 'text-inherit',
};

const weightStyles = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const alignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
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
  asChild = false,
  ...props
}: TypographyProps) {
  const Comp = asChild ? Slot : (component || getDefaultComponent(variant));
  
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
    <Comp className={classes} {...props}>
      {children}
    </Comp>
  );
}

function getDefaultComponent(variant: string): keyof JSX.IntrinsicElements {
  if (variant.startsWith('h')) return variant as keyof JSX.IntrinsicElements;
  if (variant === 'lead' || variant === 'body1' || variant === 'body2') return 'p';
  return 'span';
}

// Convenient component variations
export const Heading = ({ level = 1, ...props }: { level?: 1 | 2 | 3 | 4 | 5 | 6 } & Omit<TypographyProps, 'variant'>) => (
  <Typography variant={`h${level}` as TypographyProps['variant']} {...props} />
);

export const Text = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body1" {...props} />
);

export const Lead = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="lead" {...props} />
);

export const Large = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="large" {...props} />
);

export const Small = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="small" {...props} />
);

export const Muted = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="muted" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" {...props} />
);

export const Overline = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="overline" {...props} />
);