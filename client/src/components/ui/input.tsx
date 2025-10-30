import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-4 py-4 text-base',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    icon,
    size = 'md',
    className = '',
    ...props
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-500 text-black mb-2">
            {label}
            {props.required && <span className="text-accent-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full rounded-lg border-2 transition-all duration-200
              bg-white placeholder-gray-400 text-black
              focus:outline-none
              ${icon ? 'pl-11 pr-4' : 'px-4'}
              ${sizeStyles[size]}
              ${
                error
                  ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-200'
                  : 'border-gray-200 focus:border-accent-500 focus:ring-1 focus:ring-accent-100'
              }
              disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>

        {error && (
          <p className="text-sm font-400 text-red-500 mt-2">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({
    label,
    error,
    rows = 4,
    className = '',
    ...props
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-500 text-black mb-2">
            {label}
            {props.required && <span className="text-accent-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full rounded-lg border-2 transition-all duration-200
            bg-white placeholder-gray-400 text-black
            focus:outline-none px-4 py-3 text-base
            resize-none
            ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-200'
                : 'border-gray-200 focus:border-accent-500 focus:ring-1 focus:ring-accent-100'
            }
            disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="text-sm font-400 text-red-500 mt-2">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    error,
    options,
    className = '',
    ...props
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-500 text-black mb-2">
            {label}
            {props.required && <span className="text-accent-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full rounded-lg border-2 transition-all duration-200
              bg-white text-black px-4 py-3 text-base
              focus:outline-none appearance-none cursor-pointer
              ${
                error
                  ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-200'
                  : 'border-gray-200 focus:border-accent-500 focus:ring-1 focus:ring-accent-100'
              }
              disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {error && (
          <p className="text-sm font-400 text-red-500 mt-2">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex items-center gap-3">
        <input
          ref={ref}
          type="checkbox"
          className={`
            w-5 h-5 rounded-lg border-2 border-gray-200
            accent-accent-500 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {label && (
          <label className="text-sm font-400 text-gray-700 cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex items-center gap-3">
        <input
          ref={ref}
          type="radio"
          className={`
            w-5 h-5 border-2 border-gray-200
            accent-accent-500 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {label && (
          <label className="text-sm font-400 text-gray-700 cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
