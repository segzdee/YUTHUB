import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  outline?: boolean;
}

const variantStyles = {
  primary: {
    solid: 'bg-black text-white',
    outline: 'bg-white text-black border border-black',
  },
  secondary: {
    solid: 'bg-gray-200 text-black',
    outline: 'bg-white text-gray-700 border border-gray-300',
  },
  accent: {
    solid: 'bg-accent-500 text-white',
    outline: 'bg-accent-50 text-accent-700 border border-accent-300',
  },
  success: {
    solid: 'bg-green-500 text-white',
    outline: 'bg-green-50 text-green-700 border border-green-300',
  },
  warning: {
    solid: 'bg-amber-500 text-white',
    outline: 'bg-amber-50 text-amber-700 border border-amber-300',
  },
  error: {
    solid: 'bg-red-500 text-white',
    outline: 'bg-red-50 text-red-700 border border-red-300',
  },
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs font-600',
  md: 'px-3 py-1.5 text-sm font-600',
  lg: 'px-4 py-2 text-base font-600',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  outline = false,
  className = '',
  ...props
}) => {
  const variantStyle = outline ? variantStyles[variant].outline : variantStyles[variant].solid;

  return (
    <span
      className={`
        inline-flex items-center rounded-full
        transition-all duration-200
        ${variantStyle}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onRemove?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
}

export const Pill: React.FC<PillProps> = ({
  children,
  icon,
  onRemove,
  variant = 'secondary',
  className = '',
  ...props
}) => {
  const backgroundColors = {
    primary: 'bg-black hover:bg-gray-800',
    secondary: 'bg-gray-200 hover:bg-gray-300',
    accent: 'bg-accent-500 hover:bg-accent-600',
  };

  const textColor = {
    primary: 'text-white',
    secondary: 'text-black',
    accent: 'text-white',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        ${backgroundColors[variant]} ${textColor[variant]}
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-sm font-500">{children}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 ml-1 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${children}`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const statusConfig = {
    active: { color: 'bg-green-500', text: 'Active' },
    inactive: { color: 'bg-gray-400', text: 'Inactive' },
    pending: { color: 'bg-amber-500', text: 'Pending' },
    completed: { color: 'bg-green-500', text: 'Completed' },
    failed: { color: 'bg-red-500', text: 'Failed' },
  };

  const config = statusConfig[status];

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-sm font-500 text-gray-700">{label || config.text}</span>
    </span>
  );
};

interface NotificationBadgeProps {
  count: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'error';
  max?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  variant = 'error',
  max = 99,
}) => {
  const variantClasses = {
    primary: 'bg-black text-white',
    secondary: 'bg-gray-300 text-gray-900',
    accent: 'bg-accent-500 text-white',
    error: 'bg-red-500 text-white',
  };

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[24px] h-6 px-1.5 rounded-full
        text-xs font-700
        ${variantClasses[variant]}
      `}
    >
      {displayCount}
    </span>
  );
};
