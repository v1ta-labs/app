'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TokenSelector } from '@/components/ui/token-selector';
import { AmountInput } from '@/components/ui/amount-input';
import { StatDisplay } from '@/components/ui/stat-display';
import { HealthGauge } from '@/components/ui/health-gauge';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import { ArrowDown, Info, TrendingUp, AlertTriangle, Settings2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLLATERAL_TOKENS = [
  { symbol: 'SOL', name: 'Solana', icon: '◎', price: 0, balance: 0 },
  { symbol: 'jitoSOL', name: 'Jito Staked SOL', icon: '🔥', price: 0, balance: 0 },
  { symbol: 'mSOL', name: 'Marinade Staked SOL', icon: '⚓', price: 0, balance: 0 },
  { symbol: 'bSOL', name: 'BlazeStake SOL', icon: '🔆', price: 0, balance: 0 },
];

type InterestRateMode = 'protocol' | 'manual';

const BASE_RATE_MIN = 0;
const BASE_RATE_MAX = 4.5;
const FEE_FLOOR = 0.5;
const FEE_CAP = 5;

const calculateBorrowingFee = (borrowAmount: number, baseRate: number): {
  feePercentage: number;
  feeAmount: number;
  baseRateComponent: number;
  floorComponent: number;
} => {
  const baseRateComponent = baseRate;
  const floorComponent = FEE_FLOOR;
  const feePercentage = Math.min((baseRateComponent + floorComponent), FEE_CAP);
  const feeAmount = (borrowAmount * feePercentage) / 100;

  return {
    feePercentage,
    feeAmount,
    baseRateComponent,
    floorComponent,
  };
};

const getRedemptionRisk = (interestRate: number): {
  level: 'low' | 'medium' | 'high' | 'critical';
  label: string;
  color: string;
} => {
  if (interestRate <= 0.5) {
    return { level: 'low', label: 'Low Risk', color: 'text-success' };
  } else if (interestRate <= 2) {
    return { level: 'medium', label: 'Medium Risk', color: 'text-warning' };
  } else if (interestRate <= 5) {
    return { level: 'high', label: 'High Risk', color: 'text-error' };
  } else {
    return { level: 'critical', label: 'Critical Risk', color: 'text-error' };
  }
};

const calculateOptimalRate = (
  collateralValue: number,
  borrowAmount: number,
  systemUtilization: number = 0.6
): number => {
  const ltv = borrowAmount / collateralValue;

  let rate = 0.5;

  if (ltv > 0.5) {
    rate += (ltv - 0.5) * 2;
  }

  if (systemUtilization > 0.8) {
    rate += (systemUtilization - 0.8) * 5; 
  }

  return Math.min(rate, 10);
};

export function BorrowInterface() {
  const { connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState(COLLATERAL_TOKENS[0]);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');

  const [rateMode, setRateMode] = useState<InterestRateMode>('protocol');
  const [manualRate, setManualRate] = useState(0.5);
  const [showRateSettings, setShowRateSettings] = useState(false);
  const [showFeeTooltip, setShowFeeTooltip] = useState(false);

  const [baseRate] = useState(0);

  const collateralValue = parseFloat(collateralAmount || '0') * selectedToken.price;
  const borrowValue = parseFloat(borrowAmount || '0');

  // Calculate borrowing fee with dynamic base rate
  const feeInfo = calculateBorrowingFee(borrowValue, baseRate);

  const maxBorrow = collateralValue / 1.10;
  const currentLTV = collateralValue > 0 ? (borrowValue / collateralValue) * 100 : 0;
  const healthFactor = borrowValue > 0 ? (collateralValue / borrowValue) * 100 : 0;

  const interestRate = rateMode === 'protocol'
    ? calculateOptimalRate(collateralValue, borrowValue)
    : manualRate;

  const redemptionRisk = getRedemptionRisk(interestRate);

  const liquidationPrice = borrowValue > 0
    ? (borrowValue * 1.10) / parseFloat(collateralAmount || '1')
    : 0;

  const handleMaxCollateral = () => {
    setCollateralAmount(selectedToken.balance.toString());
  };

  const handleMaxBorrow = () => {
    setBorrowAmount(maxBorrow.toFixed(2));
  };

  const handleBorrow = async () => {
    if (!connected) return;

    console.log('Opening position:', {
      collateralType: selectedToken.symbol,
      collateralAmount: parseFloat(collateralAmount),
      borrowAmount: parseFloat(borrowAmount),
      interestRate,
      rateMode,
    });
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
            <>
              <div className="p-5 pt-0">
                <div className="p-4 bg-base rounded-2xl border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wide">Interest Rate</span>
                      <button
                        onClick={() => setShowRateSettings(!showRateSettings)}
                        className="text-text-tertiary hover:text-text-secondary transition-colors"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{interestRate.toFixed(2)}%</div>
                      <div className="text-[10px] text-text-tertiary uppercase">Annual</div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showRateSettings && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-border mt-3 space-y-3">
                          {/* Mode Selection */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setRateMode('protocol')}
                              className={`p-3 rounded-xl border transition-all ${
                                rateMode === 'protocol'
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'bg-surface border-border text-text-secondary hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold">Protocol Managed</span>
                              </div>
                              <div className="text-[10px] text-left opacity-70">
                                Lowest rate, minimal redemption risk
                              </div>
                            </button>

                            <button
                              onClick={() => setRateMode('manual')}
                              className={`p-3 rounded-xl border transition-all ${
                                rateMode === 'manual'
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'bg-surface border-border text-text-secondary hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Settings2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold">Set Manually</span>
                              </div>
                              <div className="text-[10px] text-left opacity-70">
                                Custom rate, higher risk
                              </div>
                            </button>
                          </div>

                          {rateMode === 'manual' && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-text-tertiary">Adjust Rate:</span>
                                <span className="font-bold text-text-primary">{manualRate.toFixed(2)}%</span>
                              </div>
                              <input
                                type="range"
                                min="0.5"
                                max="10"
                                step="0.1"
                                value={manualRate}
                                onChange={(e) => setManualRate(parseFloat(e.target.value))}
                                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                              />
                              <div className="flex justify-between text-[10px] text-text-tertiary">
                                <span>0.5% (Safest)</span>
                                <span>10% (Risky)</span>
                              </div>
                            </motion.div>
                          )}

                          <div className="p-3 bg-surface rounded-xl border border-border">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-text-tertiary">Redemption Risk:</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${redemptionRisk.color}`}>
                                  {redemptionRisk.label}
                                </span>
                                {redemptionRisk.level !== 'low' && (
                                  <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                                )}
                              </div>
                            </div>
                            <div className="mt-2 text-[10px] text-text-tertiary">
                              {rateMode === 'protocol'
                                ? 'Protocol optimizes for lowest redemption risk'
                                : 'Higher rates increase your position\'s redemption priority'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-5 pt-0">
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

                  {/* Liquidation Warning */}
                  {healthFactor < 115 && (
                    <div className="mt-3 p-2 bg-warning/10 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                      <span className="text-xs text-warning font-semibold">
                        Close to liquidation threshold (110%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      </motion.div>

      <Button
        fullWidth
        size="lg"
        disabled={!connected || !collateralAmount || !borrowAmount || healthFactor < 110}
        onClick={handleBorrow}
        className="shadow-lg shadow-primary/20 h-11 text-sm font-bold"
      >
        {!connected
          ? 'Connect Wallet to Continue'
          : !collateralAmount
          ? 'Enter Collateral Amount'
          : !borrowAmount
          ? 'Enter Borrow Amount'
          : healthFactor < 110
          ? 'Health Factor Too Low (Min 110%)'
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
                <div className="text-[10px] text-text-tertiary uppercase tracking-wide font-bold mb-1">
                  {rateMode === 'protocol' ? 'OPTIMAL RATE' : 'CUSTOM RATE'}
                </div>
                <div className="text-lg font-bold text-text-primary">{interestRate.toFixed(2)}%</div>
                <div className="text-xs text-text-tertiary mt-0.5">
                  {redemptionRisk.label}
                </div>
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
                  {liquidationPrice > 0 ? `$${liquidationPrice.toFixed(2)}` : '$0.00'}
                </div>
                <div className="text-xs text-text-tertiary mt-0.5">
                  {selectedToken.symbol} price
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {borrowAmount && (
        <div className="p-4 bg-surface/50 rounded-xl border border-border/50">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-text-tertiary">One-Time Borrowing Fee:</span>
                <div className="relative">
                  <button
                    onClick={() => setShowFeeTooltip(!showFeeTooltip)}
                    className="text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {showFeeTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72"
                      >
                        <div className="bg-base border border-border rounded-xl p-3 shadow-xl">
                          <div className="text-xs font-bold text-text-primary mb-2">
                            Dynamic Borrowing Fee
                          </div>
                          <div className="text-[11px] text-text-secondary space-y-2">
                            <p>
                              <span className="font-semibold text-text-primary">Fee = (Base Rate + 0.5%) × Amount</span>
                            </p>
                            <div className="space-y-1">
                              <div>• Minimum: 0.5%</div>
                              <div>• Maximum: 5%</div>
                            </div>
                            <p className="pt-2 border-t border-border/30">
                              <span className="font-semibold">Base Rate</span> increases with VUSD redemptions and decays over time (12h half-life).
                            </p>
                            <p className="text-text-tertiary text-[10px]">
                              When VUSD depegs, high redemptions → higher fees → discourages new borrowing → helps restore peg.
                            </p>
                            <div className="pt-2 border-t border-border/30 text-warning text-[10px] font-semibold">
                              MVP: Base rate fixed at 0% (0.5% fee). Dynamic rates in v2.
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-text-primary">
                  {formatUSD(feeInfo.feeAmount)}
                </div>
                <div className="text-[10px] text-text-tertiary">
                  {feeInfo.feePercentage.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="pl-3 space-y-1 border-l-2 border-border/30">
              <div className="flex justify-between text-[11px]">
                <span className="text-text-tertiary">Base Rate:</span>
                <span className="font-medium text-text-secondary">
                  {feeInfo.baseRateComponent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-text-tertiary">Minimum Fee Floor:</span>
                <span className="font-medium text-text-secondary">
                  {feeInfo.floorComponent.toFixed(2)}%
                </span>
              </div>
              {feeInfo.feePercentage === FEE_CAP && (
                <div className="flex items-center gap-1 text-[10px] text-warning mt-1">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>Fee capped at {FEE_CAP}%</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border/30">
              <div className="flex justify-between">
                <span className="text-text-tertiary font-semibold">You will receive:</span>
                <span className="font-bold text-text-primary">
                  {formatNumber(borrowValue - feeInfo.feeAmount, 2)} VUSD
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-text-tertiary">Min Collateral Ratio:</span>
              <span className="font-semibold text-text-primary">110%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
