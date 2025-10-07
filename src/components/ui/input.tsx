import { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatInputNumber, parseFormattedNumber } from '@/lib/utils/formatters';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  formatNumber?: boolean;
  rightElement?: React.ReactNode;
  onChange?: (value: string) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      formatNumber,
      rightElement,
      onChange,
      value,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(value?.toString() || '');

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
      <div className="w-full">
        {label && (
          <label className="block text-sm text-text-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={formatNumber ? 'text' : type}
            value={displayValue}
            onChange={handleChange}
            className={cn(
              'w-full h-12 px-4 bg-surface border border-border rounded-input',
              'text-text-primary placeholder:text-text-tertiary',
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              'transition-all duration-200',
              error && 'border-error focus:border-error focus:ring-error',
              rightElement && 'pr-20',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-error mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
