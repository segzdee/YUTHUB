import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
  tertiary: 'bg-transparent border-none text-foreground hover:text-primary underline-offset-2 hover:underline',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow',
  success: 'bg-success text-success-foreground hover:bg-success/90 shadow',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90 shadow',
  error: 'bg-error text-error-foreground hover:bg-error/90 shadow',
  outline: 'border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 min-h-[36px] rounded-md px-3 text-xs',
  md: 'h-10 min-h-[44px] rounded-md px-6 text-base',
  lg: 'h-11 min-h-[48px] rounded-md px-8 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    className = '',
    disabled = false,
    ...props
  }, ref) => {
    const borderRadiusClass = variant === 'primary' ? 'rounded-lg' : 'rounded-md';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${borderRadiusClass}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
