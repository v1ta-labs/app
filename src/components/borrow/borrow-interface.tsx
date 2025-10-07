'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TokenSelector } from '@/components/ui/token-selector';
import { AmountInput } from '@/components/ui/amount-input';
import { StatDisplay } from '@/components/ui/stat-display';
import { HealthGauge } from '@/components/ui/health-gauge';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import { ArrowDown, Info, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const COLLATERAL_TOKENS = [
  { symbol: 'SOL', name: 'Solana', icon: '◎', price: 0, balance: 0 },
  { symbol: 'jitoSOL', name: 'Jito Staked SOL', icon: '🔥', price: 0, balance: 0 },
  { symbol: 'mSOL', name: 'Marinade Staked SOL', icon: '⚓', price: 0, balance: 0 },
  { symbol: 'bSOL', name: 'BlazeStake SOL', icon: '🔆', price: 0, balance: 0 },
];

export function BorrowInterface() {
  const { connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState(COLLATERAL_TOKENS[0]);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');

  const collateralValue = parseFloat(collateralAmount || '0') * selectedToken.price;
  const borrowValue = parseFloat(borrowAmount || '0');

  const maxBorrow = collateralValue * 0.6667;
  const currentLTV = collateralValue > 0 ? (borrowValue / collateralValue) * 100 : 0;
  const healthFactor = currentLTV > 0 ? (66.67 / currentLTV) * 100 : 0;

  const handleMaxCollateral = () => {
    setCollateralAmount(selectedToken.balance.toString());
  };

  const handleMaxBorrow = () => {
    setBorrowAmount(maxBorrow.toFixed(2));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <StatDisplay
            label="Your Collateral"
            value={formatUSD(0)}
            change="+0%"
            changePositive
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <StatDisplay
            label="Total Borrowed"
            value="0"
            subtitle="VUSD"
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <StatDisplay
            label="Available"
            value={formatUSD(0)}
            subtitle="to borrow"
          />
        </motion.div>
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card className="p-0 overflow-hidden backdrop-blur-xl bg-surface/70 border-border/50">
          <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">DEPOSIT</span>
            <span className="text-xs text-text-tertiary">
              Balance: <span className="font-semibold text-text-secondary">{formatNumber(selectedToken.balance, 4)}</span>
            </span>
          </div>

          <AmountInput
            value={collateralAmount}
            onChange={setCollateralAmount}
            onMax={handleMaxCollateral}
            placeholder="0.00"
            leftElement={
              <TokenSelector
                selected={selectedToken}
                tokens={COLLATERAL_TOKENS}
                onSelect={setSelectedToken}
              />
            }
          />

          {collateralAmount && (
            <div className="mt-2 text-right">
              <span className="text-sm text-text-tertiary">
                ≈ {formatUSD(collateralValue)}
              </span>
            </div>
          )}
        </div>

        <div className="relative h-8 flex items-center justify-center">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border" />
          <div className="relative bg-surface border border-border rounded-full p-1.5">
            <ArrowDown className="w-4 h-4 text-text-secondary" />
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">BORROW</span>
            <button
              onClick={handleMaxBorrow}
              disabled={!collateralAmount}
              className="text-xs text-primary hover:text-primary-hover font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Max: <span className="font-semibold">{formatUSD(maxBorrow)}</span>
            </button>
          </div>

          <AmountInput
            value={borrowAmount}
            onChange={setBorrowAmount}
            placeholder="0.00"
            disabled={!collateralAmount}
            leftElement={
              <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border">
                <span className="text-lg">💵</span>
                <span className="font-semibold text-text-primary">VUSD</span>
              </div>
            }
          />

          {borrowAmount && (
            <div className="mt-2 text-right">
              <span className="text-sm text-text-tertiary">
                ≈ <span className="font-semibold text-text-secondary">{formatUSD(borrowValue)}</span>
              </span>
            </div>
          )}
        </div>

          {collateralAmount && borrowAmount && (
            <div className="p-5 pt-3">
              <div className="p-4 bg-base rounded-2xl border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-primary">Health Factor</span>
                  <button className="text-text-tertiary hover:text-text-secondary transition-colors">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xl font-bold text-text-primary">
                  {healthFactor.toFixed(0)}%
                </span>
              </div>
              <HealthGauge value={healthFactor} />
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-text-tertiary uppercase tracking-wide font-semibold">LTV RATIO</span>
                <span className="font-bold text-text-primary text-sm">{currentLTV.toFixed(1)}%</span>
              </div>
            </div>
            </div>
          )}
        </Card>
      </motion.div>

      <Button
        fullWidth
        size="lg"
        disabled={!connected || !collateralAmount || !borrowAmount}
        className="shadow-lg shadow-primary/20 h-11 text-sm font-bold"
      >
        {!connected
          ? 'Connect Wallet to Continue'
          : !collateralAmount
          ? 'Enter Collateral Amount'
          : !borrowAmount
          ? 'Enter Borrow Amount'
          : 'Confirm Transaction'}
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-primary/10 rounded-xl">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wide font-bold mb-1">INTEREST RATE</div>
                <div className="text-lg font-bold text-text-primary">0.5%</div>
                <div className="text-xs text-text-tertiary mt-0.5">Annual</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-warning/10 rounded-xl">
                <Info className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wide font-bold mb-1">LIQUIDATION</div>
                <div className="text-lg font-bold text-text-primary">
                  {collateralAmount ? `$${(collateralValue * 0.75).toFixed(2)}` : '$0.00'}
                </div>
                <div className="text-xs text-text-tertiary mt-0.5">At 110% CR</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
