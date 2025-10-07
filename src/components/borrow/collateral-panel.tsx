'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import { useSolanaBalance } from '@/hooks';
import { useWallet } from '@solana/wallet-adapter-react';

const ASSETS = [
  { symbol: 'SOL', name: 'Solana', price: 158.0 },
  { symbol: 'JitoSOL', name: 'Jito Staked SOL', price: 162.5 },
  { symbol: 'mSOL', name: 'Marinade Staked SOL', price: 159.8 },
];

export function CollateralPanel() {
  const { connected } = useWallet();
  const { balance } = useSolanaBalance();
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [amount, setAmount] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const usdValue = numericAmount * selectedAsset.price;

  const handleMax = () => {
    if (balance) {
      setAmount(balance.toFixed(4));
    }
  };

  const handleDeposit = () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    console.log('Deposit:', amount, selectedAsset.symbol);
  };

  return (
    <Card className="p-5">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-text-primary">Deposit Collateral</h3>
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Select Asset
          </label>
          <select
            value={selectedAsset.symbol}
            onChange={(e) => {
              const asset = ASSETS.find((a) => a.symbol === e.target.value);
              if (asset) setSelectedAsset(asset);
            }}
            className="w-full h-12 px-4 bg-elevated border border-border rounded-[16px] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            {ASSETS.map((asset) => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.symbol} - {asset.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Amount"
            type="text"
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
            formatNumber
            rightElement={
              <button
                onClick={handleMax}
                className="px-2 py-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
              >
                MAX
              </button>
            }
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-tertiary">Balance:</span>
            <span className="text-text-primary">
              {balance ? formatNumber(balance, 4) : '0.00'} {selectedAsset.symbol}
            </span>
          </div>
          {numericAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Value:</span>
              <span className="text-text-primary">
                {formatUSD(usdValue)}
              </span>
            </div>
          )}
        </div>

        <Button
          fullWidth
          onClick={handleDeposit}
          disabled={!connected || numericAmount <= 0 || numericAmount > (balance || 0)}
        >
          {!connected ? 'Connect Wallet' : 'Deposit Collateral'}
        </Button>
      </div>
    </Card>
  );
}
