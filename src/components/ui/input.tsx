'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { formatInputNumber, parseFormattedNumber } from '@/lib/utils/formatters';

const inputVariants = cva(
  'w-full transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-base border border-border text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/50 focus:border-primary',
        filled:
          'bg-surface border border-border text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/50 focus:border-primary',
        ghost:
          'bg-transparent border-0 text-text-primary placeholder:text-text-tertiary focus:bg-surface/50',
        error:
          'bg-base border-2 border-error text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-error/50',
        success:
          'bg-base border-2 border-success text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-success/50',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm h-9',
        md: 'px-4 py-2.5 text-sm h-11',
        lg: 'px-4 py-3 text-base h-12',
        xl: 'px-5 py-4 text-lg h-14',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-md',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      radius: 'lg',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  formatNumber?: boolean;
  wrapperClassName?: string;
  labelClassName?: string;
  onChange?: (value: string) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      radius,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      leftElement,
      rightElement,
      formatNumber,
      wrapperClassName,
      labelClassName,
      disabled,
      value,
      onChange,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(value?.toString() || '');
    const hasError = !!error;
    const effectiveVariant = hasError ? 'error' : variant;

    useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(value.toString());
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      if (formatNumber && type === 'text') {
        newValue = formatInputNumber(newValue);
        setDisplayValue(newValue);
        const numericValue = parseFormattedNumber(newValue);
        onChange?.(numericValue.toString());
      } else {
        setDisplayValue(newValue);
        onChange?.(newValue);
      }
    };

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label
            className={cn(
              'block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2',
              disabled && 'opacity-50',
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {leftIcon}
            </div>
          )}

          {leftElement && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2">{leftElement}</div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            type={formatNumber ? 'text' : type}
            value={displayValue}
            onChange={handleChange}
            className={cn(
              inputVariants({ variant: effectiveVariant, size, radius }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              leftElement && 'pl-12',
              rightElement && 'pr-12',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {rightIcon}
            </div>
          )}

          {rightElement && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">{rightElement}</div>
          )}
        </div>

        {error && <p className="mt-1.5 text-xs text-error font-medium">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-text-tertiary">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea variant
const textareaVariants = cva(
  'w-full transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default:
          'bg-base border border-border text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/50 focus:border-primary',
        filled:
          'bg-surface border border-border text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/50 focus:border-primary',
        ghost:
          'bg-transparent border-0 text-text-primary placeholder:text-text-tertiary focus:bg-surface/50',
        error:
          'bg-base border-2 border-error text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-error/50',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-4 py-3 text-base',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-md',
        md: 'rounded-lg',
        lg: 'rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      radius: 'lg',
    },
  }
);

export interface TextareaProps
  extends Omit<InputHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  hint?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  wrapperClassName?: string;
  labelClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      radius,
      label,
      error,
      hint,
      rows = 4,
      maxLength,
      showCount = false,
      wrapperClassName,
      labelClassName,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const effectiveVariant = hasError ? 'error' : variant;
    const currentLength = value ? String(value).length : 0;

    return (
      <div className={cn('w-full', wrapperClassName)}>
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label
              className={cn(
                'text-xs font-semibold text-text-secondary uppercase tracking-wide',
                disabled && 'opacity-50',
                labelClassName
              )}
            >
              {label}
            </label>
          )}
          {showCount && maxLength && (
            <span className="text-xs text-text-tertiary">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={cn(textareaVariants({ variant: effectiveVariant, size, radius }), className)}
          {...props}
        />

        {error && <p className="mt-1.5 text-xs text-error font-medium">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-text-tertiary">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
