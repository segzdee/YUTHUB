import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Email input with mobile optimization
export function EmailInput({
  label,
  placeholder = 'Enter your email',
  className,
  ...props
}: React.ComponentProps<typeof Input> & { label?: string }) {
  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        type='email'
        inputMode='email'
        autoComplete='email'
        placeholder={placeholder}
        className={cn('touch-target', className)}
        {...props}
      />
    </div>
  );
}

// Phone input with mobile optimization
export function PhoneInput({
  label,
  placeholder = 'Enter phone number',
  className,
  ...props
}: React.ComponentProps<typeof Input> & { label?: string }) {
  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        type='tel'
        inputMode='tel'
        autoComplete='tel'
        placeholder={placeholder}
        className={cn('touch-target', className)}
        {...props}
      />
    </div>
  );
}

// Number input with mobile optimization
export function NumberInput({
  label,
  placeholder = 'Enter number',
  className,
  ...props
}: React.ComponentProps<typeof Input> & { label?: string }) {
  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        type='number'
        inputMode='numeric'
        placeholder={placeholder}
        className={cn('touch-target', className)}
        {...props}
      />
    </div>
  );
}

// Search input with mobile optimization
export function SearchInput({
  label,
  placeholder = 'Search...',
  className,
  ...props
}: React.ComponentProps<typeof Input> & { label?: string }) {
  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        type='search'
        inputMode='search'
        autoComplete='off'
        placeholder={placeholder}
        className={cn('touch-target', className)}
        {...props}
      />
    </div>
  );
}

// URL input with mobile optimization
export function URLInput({
  label,
  placeholder = 'Enter URL',
  className,
  ...props
}: React.ComponentProps<typeof Input> & { label?: string }) {
  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        type='url'
        inputMode='url'
        autoComplete='url'
        placeholder={placeholder}
        className={cn('touch-target', className)}
        {...props}
      />
    </div>
  );
}

// Name input with mobile optimization
export function NameInput({
  label,
  placeholder = 'Enter name',
  className,
  autoComplete = 'name',
  ...props
}: React.ComponentProps<typeof Input> & {
  label?: string;
  autoComplete?:
    | 'name'
    | 'given-name'
    | 'family-name'
    | 'honorific-prefix'
    | 'honorific-suffix';
}) {
  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        type='text'
        inputMode='text'
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={cn('touch-target', className)}
        {...props}
      />
    </div>
  );
}

// Address input with mobile optimization
export function AddressInput({
  label,
  placeholder = 'Enter address',
  className,
  addressType = 'street-address',
  ...props
}: React.ComponentProps<typeof Input> & {
  label?: string;
  addressType?:
    | 'street-address'
    | 'address-line1'
    | 'address-line2'
    | 'postal-code'
    | 'country';
}) {
  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        type='text'
        inputMode='text'
        autoComplete={addressType}
        placeholder={placeholder}
        className={cn('touch-target', className)}
        {...props}
      />
    </div>
  );
}

// Date input with mobile optimization
export function DateInput({
  label,
  placeholder = 'Select date',
  className,
  ...props
}: React.ComponentProps<typeof Input> & { label?: string }) {
  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        type='date'
        autoComplete='bday'
        placeholder={placeholder}
        className={cn('touch-target', className)}
        {...props}
      />
    </div>
  );
}

// Time input with mobile optimization
export function TimeInput({
  label,
  placeholder = 'Select time',
  className,
  ...props
}: React.ComponentProps<typeof Input> & { label?: string }) {
  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        type='time'
        placeholder={placeholder}
        className={cn('touch-target', className)}
        {...props}
      />
    </div>
  );
}

// Password input with mobile optimization
export function PasswordInput({
  label,
  placeholder = 'Enter password',
  className,
  autoComplete = 'current-password',
  ...props
}: React.ComponentProps<typeof Input> & {
  label?: string;
  autoComplete?: 'current-password' | 'new-password';
}) {
  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        type='password'
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={cn('touch-target', className)}
        {...props}
      />
    </div>
  );
}
