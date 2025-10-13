'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AmountInput } from '@/components/ui/amount-input';
import { StatDisplay } from '@/components/ui/stat-display';
import { HealthGauge } from '@/components/ui/health-gauge';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import { ArrowDown, Info, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenInfo {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  balance: number;
}

const DEFAULT_TOKEN: TokenInfo = {
  symbol: 'SOL',
  name: 'Solana',
  icon: '◎',
  price: 0,
  balance: 0,
};

// V1TA Protocol Constants - IMMUTABLE
const BORROWING_FEE = 0.5; // 0.5% one-time fee

const calculateBorrowingFee = (borrowAmount: number): { feeAmount: number; totalDebt: number } => {
  const feeAmount = (borrowAmount * BORROWING_FEE) / 100;
  const totalDebt = borrowAmount + feeAmount;
  return { feeAmount, totalDebt };
};

const getLiquidationRisk = (
  cr: number
): { level: 'safe' | 'moderate' | 'risky' | 'danger'; label: string; color: string } => {
  if (cr >= 200) return { level: 'safe', label: 'Very Safe', color: 'text-success' };
  if (cr >= 150) return { level: 'moderate', label: 'Safe', color: 'text-success' };
  if (cr >= 120) return { level: 'risky', label: 'At Risk', color: 'text-warning' };
  return { level: 'danger', label: 'Danger Zone', color: 'text-error' };
};

export function BorrowInterface() {
  const { isConnected } = useAppKitAccount();
  const [selectedToken, setSelectedToken] = useState<TokenInfo>(DEFAULT_TOKEN);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [showFeeTooltip, setShowFeeTooltip] = useState(false);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [isPriceLoading, setIsPriceLoading] = useState(true);

  // Fetch SOL price from Pyth Hermes API
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        setIsPriceLoading(true);
        // Fetch from Pyth Hermes API (SOL/USD price feed ID)
        const response = await fetch(
          'https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d'
        );
        const data = await response.json();

        if (data.parsed && data.parsed[0]) {
          const priceData = data.parsed[0].price;
          // Pyth price format: price * 10^expo
          const priceInUsd = Number(priceData.price) * Math.pow(10, priceData.expo);
          setSolPrice(priceInUsd);
          setSelectedToken(prev => ({ ...prev, price: priceInUsd }));
        }
      } catch (error) {
        console.error('Failed to fetch SOL price from Pyth:', error);
      } finally {
        setIsPriceLoading(false);
      }
    };

    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, []);

  const collateralValue = parseFloat(collateralAmount || '0') * selectedToken.price;
  const borrowValue = parseFloat(borrowAmount || '0');

  // Calculate borrowing fee (0.5% one-time)
  const feeInfo = calculateBorrowingFee(borrowValue);

  // Health calculations use TOTAL DEBT (borrow amount + fee)
  const maxBorrow = collateralValue / 1.1; // Max at 110% CR
  const totalDebt = feeInfo.totalDebt;
  const currentLTV = collateralValue > 0 ? (totalDebt / collateralValue) * 100 : 0;
  const healthFactor = totalDebt > 0 ? (collateralValue / totalDebt) * 100 : 0; // Collateral Ratio
  const liquidationRisk = getLiquidationRisk(healthFactor);

  const liquidationPrice =
    totalDebt > 0 ? (totalDebt * 1.1) / parseFloat(collateralAmount || '1') : 0;

  const handleMaxCollateral = () => {
    setCollateralAmount(selectedToken.balance.toString());
  };

  const handleMaxBorrow = () => {
    setBorrowAmount(maxBorrow.toFixed(2));
  };

  const handleBorrow = async () => {
    if (!isConnected) return;

    // TODO: Implement actual position opening logic with V1TAClient
    // Opening position with collateral and borrow amounts
    void {
      collateralType: selectedToken.symbol,
      collateralAmount,
      borrowAmount: feeInfo.totalDebt, // Include 0.5% fee in total debt
    };
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <StatDisplay
            label="SOL Price"
            value={isPriceLoading ? 'Loading...' : formatUSD(solPrice)}
            subtitle="Live from Pyth"
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <StatDisplay label="Borrowing Fee" value="0.5%" subtitle="One-time only" />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <StatDisplay label="Interest Rate" value="0%" subtitle="Forever" />
        </motion.div>
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card className="p-0 overflow-hidden backdrop-blur-xl bg-surface/70 border-border/50">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                COLLATERAL
              </span>
              <span className="text-xs text-text-tertiary">
                Balance:{' '}
                <span className="font-semibold text-text-secondary">
                  {formatNumber(selectedToken.balance, 4)}
                </span>
              </span>
            </div>

            <AmountInput
              value={collateralAmount}
              onChange={setCollateralAmount}
              onMax={handleMaxCollateral}
              placeholder="0.00"
              leftElement={
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="text-xl">{selectedToken.icon}</span>
                  <span className="font-semibold text-text-primary">{selectedToken.symbol}</span>
                </div>
              }
            />

            {collateralAmount && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-text-tertiary">
                  SOL Price: {isPriceLoading ? 'Loading...' : formatUSD(solPrice)}
                </span>
                <span className="text-sm text-text-tertiary font-semibold">
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
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                MINT VUSD
              </span>
              <button
                onClick={handleMaxBorrow}
                disabled={!collateralAmount || isPriceLoading}
                className="text-xs text-primary hover:text-primary-hover font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Max at 110%: <span className="font-semibold">{formatUSD(maxBorrow)}</span>
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
                  ≈{' '}
                  <span className="font-semibold text-text-secondary">
                    {formatUSD(borrowValue)}
                  </span>
                </span>
              </div>
            )}
          </div>

          {collateralAmount && borrowAmount && (
            <>
              {/* V1TA 0% Interest Highlight */}
              <div className="p-5 pt-0">
                <div className="p-4 bg-gradient-to-br from-success/10 to-primary/10 rounded-2xl border border-success/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-success" />
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                        Interest Rate
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">0%</div>
                      <div className="text-[10px] text-text-tertiary uppercase">Forever</div>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">
                    No recurring interest. Ever. Only a{' '}
                    <span className="font-bold text-primary">0.5% one-time fee</span> when you mint
                    VUSD.{' '}
                    <span className="font-semibold">Decentralized. Efficient. Unstoppable.</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="p-4 bg-base rounded-2xl border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">Collateral Ratio</span>
                      <button className="text-text-tertiary hover:text-text-secondary transition-colors">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xl font-bold text-text-primary">
                      {healthFactor > 0 ? `${healthFactor.toFixed(0)}%` : '—'}
                    </span>
                  </div>
                  <HealthGauge value={healthFactor} />
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                    <div>
                      <span className="text-text-tertiary uppercase tracking-wide font-semibold block mb-1">
                        LTV RATIO
                      </span>
                      <span className="font-bold text-text-primary text-sm">
                        {currentLTV > 0 ? `${currentLTV.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-text-tertiary uppercase tracking-wide font-semibold block mb-1">
                        RISK
                      </span>
                      <span className={`font-bold text-sm ${liquidationRisk.color}`}>
                        {healthFactor > 0 ? liquidationRisk.label : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Liquidation Warning */}
                  {healthFactor > 0 && healthFactor < 115 && (
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
        disabled={
          !isConnected || !collateralAmount || !borrowAmount || healthFactor < 110 || isPriceLoading
        }
        onClick={handleBorrow}
        className="shadow-lg shadow-primary/20 h-11 text-sm font-bold"
      >
        {!isConnected
          ? 'Connect Wallet to Continue'
          : isPriceLoading
            ? 'Loading Price...'
            : !collateralAmount
              ? 'Enter Collateral Amount'
              : !borrowAmount
                ? 'Mint VUSD'
                : healthFactor < 110
                  ? 'Collateral Ratio Too Low (Min 110%)'
                  : 'Open Position & Mint VUSD'}
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-success/10 rounded-xl">
                <Zap className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wide font-bold mb-1">
                  INTEREST RATE
                </div>
                <div className="text-lg font-bold text-success">0%</div>
                <div className="text-xs text-text-tertiary mt-0.5">Forever</div>
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
                <div className="text-[10px] text-text-tertiary uppercase tracking-wide font-bold mb-1">
                  LIQUIDATION PRICE
                </div>
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
                            V1TA Borrowing Fee
                          </div>
                          <div className="text-[11px] text-text-secondary space-y-2">
                            <p>
                              <span className="font-semibold text-success">
                                0.5% one-time fee. 0% interest forever.
                              </span>
                            </p>
                            <div className="space-y-1">
                              <div>• No recurring interest charges</div>
                              <div>• No variable rates</div>
                              <div>• Immutable protocol design</div>
                            </div>
                            <p className="pt-2 border-t border-border/30 text-text-tertiary text-[10px]">
                              V1TA is designed for pure decentralization. Your debt never grows from
                              interest - only the initial 0.5% fee when you borrow.
                            </p>
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
                <div className="text-[10px] text-success font-bold">0.5%</div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/30">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Borrow Amount:</span>
                <span className="font-semibold text-text-primary">
                  {formatNumber(borrowValue, 2)} VUSD
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-text-tertiary font-semibold">Total Debt:</span>
              <span className="font-bold text-text-primary">
                {formatNumber(feeInfo.totalDebt, 2)} VUSD
              </span>
            </div>

            <div className="pt-2 border-t border-border/30 flex justify-between">
              <span className="text-text-tertiary">Min Collateral Ratio:</span>
              <span className="font-semibold text-text-primary">110%</span>
            </div>

            <div className="pt-2 border-t border-border/30 p-3 bg-base/50 rounded-xl">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wide font-bold mb-1.5">
                V1TA Protocol
              </div>
              <div className="text-xs text-text-secondary">
                <span className="text-success font-bold">0% interest forever</span> · Pure
                decentralized stablecoin · Your debt never compounds
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
