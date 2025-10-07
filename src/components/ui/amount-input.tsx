'use client';

import { cn } from '@/lib/utils/cn';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onMax?: () => void;
  placeholder?: string;
  disabled?: boolean;
  leftElement?: React.ReactNode;
}

export function AmountInput({
  value,
  onChange,
  onMax,
  placeholder = '0.00',
  disabled = false,
  leftElement,
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className={cn(
      'relative flex items-center gap-3 p-4 bg-elevated rounded-[20px] border border-border',
      'focus-within:border-primary transition-all',
      disabled && 'opacity-50 cursor-not-allowed'
    )}>
      {leftElement && leftElement}

      <div className="flex-1">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent text-2xl font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
      </div>

      {onMax && (
        <button
          onClick={onMax}
          disabled={disabled}
          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-[10px] text-xs font-semibold text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          MAX
        </button>
      )}
    </div>
  );
}
