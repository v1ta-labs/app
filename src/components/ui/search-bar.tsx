'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function SearchBar() {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 px-4 h-10 bg-surface border border-border rounded-[12px] transition-all',
        isFocused && 'border-primary/50 ring-1 ring-primary/20'
      )}
    >
      <Search className="w-4 h-4 text-text-tertiary shrink-0" />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search by token or Solana address..."
        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="p-1 hover:bg-elevated rounded-[8px] transition-colors"
        >
          <X className="w-3.5 h-3.5 text-text-tertiary" />
        </button>
      )}
    </div>
  );
}
