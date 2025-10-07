'use client';

import { useState } from 'react';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatUSD, formatPercentage } from '@/lib/utils/formatters';
import { useWallet } from '@solana/wallet-adapter-react';

interface BorrowPanelProps {
  maxBorrow: number;
  currentHealthFactor: number;
}

export function BorrowPanel({ maxBorrow, currentHealthFactor }: BorrowPanelProps) {
  const { connected } = useWallet();
  const [amount, setAmount] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const vusdPrice = 1.0;
  const usdValue = numericAmount * vusdPrice;

  const newHealthFactor = currentHealthFactor - (numericAmount / maxBorrow) * 20;

  const handleMax = () => {
    setAmount(maxBorrow.toFixed(2));
  };

  const handleBorrow = () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    console.log('Borrow:', amount, 'VUSD');
  };

  return (
    <Card className="p-5">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-text-primary">Borrow VUSD</h3>
        <div>
            <Input
              label="Amount to Borrow"
              type="text"
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              formatNumber
              rightElement={
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-secondary">VUSD</span>
                  <button
                    onClick={handleMax}
                    className="px-2 py-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    MAX
                  </button>
                </div>
              }
            />
        </div>

        {numericAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-text-tertiary">= USD Value:</span>
            <span className="text-text-primary">
              {formatUSD(usdValue)}
            </span>
          </div>
        )}

        <div className="p-4 bg-elevated rounded-[20px] border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-secondary">Health Factor</span>
              <span className="text-sm text-text-tertiary">
                Current: {formatPercentage(currentHealthFactor)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-text-primary">
                {formatPercentage(Math.max(100, newHealthFactor))}
              </span>
              <span className="text-xs text-text-tertiary">
                (after borrow)
              </span>
            </div>
            {newHealthFactor < 130 && (
              <p className="text-xs text-warning mt-2">
                ⚠️ Health factor will be in caution range
              </p>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-text-tertiary">Available to Borrow:</span>
            <span className="text-text-primary">
              {formatUSD(maxBorrow)}
            </span>
          </div>

          <Button
            fullWidth
            onClick={handleBorrow}
            disabled={!connected || numericAmount <= 0 || numericAmount > maxBorrow}
          >
            {!connected ? 'Connect Wallet' : 'Borrow VUSD'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
