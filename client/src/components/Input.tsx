import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-3 py-2.5 text-sm min-h-[36px]',
  md: 'px-4 py-3 text-base min-h-[44px]',
  lg: 'px-4 py-4 text-base min-h-[48px]',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    icon,
    inputSize = 'md',
    className = '',
    ...props
  }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
            {props.required && <span className="text-error ml-1" aria-label="required">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}

          <input
            {...props}
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`
              w-full rounded-lg border-2 transition-all duration-200
              bg-card text-foreground placeholder:text-muted-foreground
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              ${icon ? 'pl-11 pr-4' : 'px-4'}
              ${sizeStyles[inputSize]}
              ${
                error
                  ? 'border-error focus:border-error focus-visible:ring-error'
                  : 'border-border focus:border-primary focus-visible:ring-primary'
              }
              disabled:bg-muted disabled:text-muted-foreground disabled:border-border disabled:cursor-not-allowed disabled:opacity-60
              ${className}
            `}
          />
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-sm font-normal text-error mt-2"
          >
            {error}
          </p>
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
    const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
            {props.required && <span className="text-error ml-1" aria-label="required">*</span>}
          </label>
        )}

        <textarea
          {...props}
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={`
            w-full rounded-lg border-2 transition-all duration-200 min-h-[120px]
            bg-card text-foreground placeholder:text-muted-foreground
            focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            px-4 py-3 text-base resize-y
            ${
              error
                ? 'border-error focus:border-error focus-visible:ring-error'
                : 'border-border focus:border-primary focus-visible:ring-primary'
            }
            disabled:bg-muted disabled:text-muted-foreground disabled:border-border disabled:cursor-not-allowed disabled:opacity-60
            ${className}
          `}
        />

        {error && (
          <p
            id={`${textareaId}-error`}
            role="alert"
            className="text-sm font-normal text-error mt-2"
          >
            {error}
          </p>
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
    const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
            {props.required && <span className="text-error ml-1" aria-label="required">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            {...props}
            ref={ref}
            id={selectId}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${selectId}-error` : undefined}
            className={`
              w-full rounded-lg border-2 transition-all duration-200 min-h-[44px]
              bg-card text-foreground px-4 py-3 text-base pr-10
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              appearance-none cursor-pointer
              ${
                error
                  ? 'border-error focus:border-error focus-visible:ring-error'
                  : 'border-border focus:border-primary focus-visible:ring-primary'
              }
              disabled:bg-muted disabled:text-muted-foreground disabled:border-border disabled:cursor-not-allowed disabled:opacity-60
              ${className}
            `}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {error && (
          <p
            id={`${selectId}-error`}
            role="alert"
            className="text-sm font-normal text-error mt-2"
          >
            {error}
          </p>
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
    const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-3 min-h-[44px]">
        <input
          {...props}
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`
            w-5 h-5 rounded border-2 border-border
            text-primary cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60
            ${className}
          `}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm font-normal text-foreground cursor-pointer select-none"
          >
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
    const radioId = props.id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-3 min-h-[44px]">
        <input
          {...props}
          ref={ref}
          type="radio"
          id={radioId}
          className={`
            w-5 h-5 border-2 border-border
            text-primary cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60
            ${className}
          `}
        />
        {label && (
          <label
            htmlFor={radioId}
            className="text-sm font-normal text-foreground cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
