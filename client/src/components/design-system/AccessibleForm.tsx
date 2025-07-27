import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
  'aria-describedby'?: string;
}

export function AccessibleFormField({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  required = false,
  disabled = false,
  description,
  className,
  'aria-describedby': ariaDescribedBy,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);

  const fieldId = id;
  const errorId = `${fieldId}-error`;
  const successId = `${fieldId}-success`;
  const descriptionId = `${fieldId}-description`;

  const ariaDescribedByIds = [
    description && descriptionId,
    error && errorId,
    success && successId,
    ariaDescribedBy,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={fieldId}
        className={cn(
          'block text-sm font-medium transition-colors',
          hasError && 'text-destructive',
          hasSuccess && 'text-success',
          focused && 'text-primary',
          disabled && 'text-muted-foreground'
        )}
      >
        {label}
        {required && (
          <span className='text-destructive ml-1' aria-label='required'>
            *
          </span>
        )}
      </Label>

      {description && (
        <p id={descriptionId} className='text-sm text-muted-foreground'>
          {description}
        </p>
      )}

      <div className='relative'>
        <Input
          id={fieldId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onFocus={() => setFocused(true)}
          className={cn(
            'transition-all duration-200',
            hasError &&
              'border-destructive focus:border-destructive focus:ring-destructive',
            hasSuccess &&
              'border-success focus:border-success focus:ring-success',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={ariaDescribedByIds || undefined}
        />

        {/* Status icons */}
        {(hasError || hasSuccess) && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
            {hasError && <XCircle className='h-4 w-4 text-destructive' />}
            {hasSuccess && <CheckCircle className='h-4 w-4 text-success' />}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <Alert id={errorId} variant='destructive' className='py-2'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription className='text-sm'>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success message */}
      {success && (
        <Alert id={successId} className='py-2 border-success text-success'>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription className='text-sm'>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export function AccessibleForm({
  onSubmit,
  className,
  children,
  loading = false,
  disabled = false,
}: FormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && !disabled) {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      noValidate
    >
      <fieldset disabled={disabled || loading} className='space-y-4'>
        {children}
      </fieldset>
    </form>
  );
}

interface FormActionsProps {
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormActions({
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  loading = false,
  disabled = false,
  className,
}: FormActionsProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-3 sm:gap-4', className)}>
      <Button
        type='submit'
        className='order-2 sm:order-1'
        disabled={disabled || loading}
        loading={loading}
      >
        {submitText}
      </Button>

      {onCancel && (
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={loading}
          className='order-1 sm:order-2'
        >
          {cancelText}
        </Button>
      )}
    </div>
  );
}

// Form validation utilities
export const validators = {
  required: (value: string) => (value.trim() ? null : 'This field is required'),
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },
  minLength: (min: number) => (value: string) =>
    value.length >= min ? null : `Must be at least ${min} characters`,
  maxLength: (max: number) => (value: string) =>
    value.length <= max ? null : `Must be no more than ${max} characters`,
  pattern: (pattern: RegExp, message: string) => (value: string) =>
    pattern.test(value) ? null : message,
};

// Real-time validation hook
export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  validationRules: Record<keyof T, ((value: string) => string | null)[]>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = (name: keyof T, value: string) => {
    const rules = validationRules[name] || [];
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };

  const setValue = (name: keyof T, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const setTouched = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(values).forEach(key => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
    isValid: Object.keys(errors).length === 0,
  };
}
