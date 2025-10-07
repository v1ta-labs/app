'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  balance: number;
}

interface TokenSelectorProps {
  selected: Token;
  tokens: Token[];
  onSelect: (token: Token) => void;
}

export function TokenSelector({ selected, tokens, onSelect }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-surface rounded-[12px] border border-border hover:border-primary/50 transition-all"
      >
        <span className="text-lg">{selected.icon}</span>
        <span className="font-semibold text-text-primary">{selected.symbol}</span>
        <ChevronDown className={cn(
          'w-4 h-4 text-text-secondary transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-[16px] shadow-xl z-50 overflow-hidden">
            {tokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => {
                  onSelect(token);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between p-3 hover:bg-elevated transition-colors',
                  selected.symbol === token.symbol && 'bg-primary/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{token.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-text-primary">{token.symbol}</div>
                    <div className="text-xs text-text-tertiary">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-text-primary">
                    ${token.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {token.balance.toFixed(4)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
