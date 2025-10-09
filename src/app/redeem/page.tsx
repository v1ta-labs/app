'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import { ArrowDown, Info, TrendingUp, AlertCircle, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RedeemPage() {
  const [vusdAmount, setVusdAmount] = useState('');
  const [selectedCollateral, setSelectedCollateral] = useState('SOL');

  const vusdBalance = 0;
  const redemptionRate = 0.995; // 0.5% redemption fee
  const estimatedReceive = (parseFloat(vusdAmount || '0') * redemptionRate) / 1; // Price placeholder

  const collateralOptions = [
    { symbol: 'SOL', price: 0, available: 0, total: 0 },
    { symbol: 'jitoSOL', price: 0, available: 0, total: 0 },
    { symbol: 'mSOL', price: 0, available: 0, total: 0 },
  ];

  const recentRedemptions: {
    amount: number;
    collateral: string;
    received: number;
    timestamp: string;
    fee: number;
  }[] = [];

  return (
    <AppLayout>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Redeem VUSD</h1>
            <p className="text-sm text-text-tertiary">
              Exchange your VUSD for underlying collateral at face value
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Your VUSD Balance
              </div>
              <div className="text-2xl font-bold text-text-primary">{formatUSD(vusdBalance)}</div>
              <div className="text-xs text-text-tertiary mt-1">Available to redeem</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Redemption Rate
              </div>
              <div className="text-2xl font-bold text-text-primary">1:1</div>
              <div className="text-xs text-text-tertiary mt-1">VUSD to USD value</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Redemption Fee
              </div>
              <div className="text-2xl font-bold text-text-primary">0.5%</div>
              <div className="text-xs text-text-tertiary mt-1">Protocol fee</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Total Redeemed
              </div>
              <div className="text-2xl font-bold text-text-primary">{formatUSD(0)}</div>
              <div className="text-xs text-success mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                All time
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Redeem Interface */}
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-4">Redeem VUSD</h2>

              <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl border border-primary/30 mb-6">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-text-primary mb-1">
                      How Redemption Works
                    </div>
                    <div className="text-xs text-text-tertiary">
                      Redeem your VUSD at face value ($1) for the lowest collateralized
                      positions&apos; assets. A 0.5% fee applies.
                    </div>
                  </div>
                </div>

                {/* VUSD Input */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                      Amount to Redeem
                    </span>
                    <span className="text-xs text-text-tertiary">
                      Balance:{' '}
                      <span className="font-semibold text-text-secondary">
                        {formatNumber(vusdBalance, 2)} VUSD
                      </span>
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={vusdAmount}
                      onChange={e => setVusdAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 pr-24 bg-base border border-border rounded-[16px] text-2xl font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        onClick={() => setVusdAmount(vusdBalance.toString())}
                        className="px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded-lg text-xs font-bold text-primary transition-colors"
                      >
                        MAX
                      </button>
                      <span className="text-sm font-semibold text-text-secondary">VUSD</span>
                    </div>
                  </div>

                  {vusdAmount && (
                    <div className="mt-2 text-right">
                      <span className="text-sm text-text-tertiary">
                        ≈ {formatUSD(parseFloat(vusdAmount))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow Divider */}
                <div className="relative h-8 flex items-center justify-center mb-6">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border" />
                  <div className="relative bg-surface border border-border rounded-full p-1.5">
                    <ArrowDown className="w-4 h-4 text-text-secondary" />
                  </div>
                </div>

                {/* Collateral Selection */}
                <div className="mb-6">
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-3">
                    Receive Collateral
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {collateralOptions.map(option => (
                      <button
                        key={option.symbol}
                        onClick={() => setSelectedCollateral(option.symbol)}
                        className={`p-3 rounded-xl border transition-all ${
                          selectedCollateral === option.symbol
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-base hover:bg-elevated'
                        }`}
                      >
                        <div className="text-sm font-bold text-text-primary mb-1">
                          {option.symbol}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {formatNumber(option.available, 2)} available
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Receive */}
                {vusdAmount && (
                  <div className="p-4 bg-base rounded-xl border border-border mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-tertiary">You will receive</span>
                      <span className="text-lg font-bold text-text-primary">
                        {formatNumber(estimatedReceive, 4)} {selectedCollateral}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-tertiary">
                      <span>Redemption fee (0.5%)</span>
                      <span>{formatUSD(parseFloat(vusdAmount) * 0.005)}</span>
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-xl border border-warning/30 mb-6">
                  <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="text-xs text-text-tertiary">
                    Redemptions directly affect the lowest collateralized positions. Consider the
                    impact on the protocol.
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  fullWidth
                  size="lg"
                  disabled={!vusdAmount || parseFloat(vusdAmount) > vusdBalance}
                >
                  {!vusdAmount
                    ? 'Enter Amount to Redeem'
                    : parseFloat(vusdAmount) > vusdBalance
                      ? 'Insufficient VUSD Balance'
                      : 'Redeem VUSD'}
                </Button>
              </Card>
            </div>

            {/* Recent Redemptions & Info */}
            <div className="space-y-6">
              {/* Available Collateral */}
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-4">Available Collateral</h2>
                <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
                  <div className="space-y-3">
                    {collateralOptions.map(option => (
                      <div
                        key={option.symbol}
                        className="flex items-center justify-between p-3 bg-base rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">
                              {option.symbol[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-text-primary">
                              {option.symbol}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              ${formatNumber(option.price, 2)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-text-primary">
                            {formatNumber(option.available, 2)}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            of {formatNumber(option.total, 2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Recent Redemptions */}
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  Your Recent Redemptions
                </h2>
                <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
                  <div className="space-y-3">
                    {recentRedemptions.map((redemption, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-base rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                            <Coins className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-text-primary">
                              {formatUSD(redemption.amount)}
                            </div>
                            <div className="text-xs text-text-tertiary">{redemption.timestamp}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-success">
                            +{formatNumber(redemption.received, 2)} {redemption.collateral}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            Fee: {formatUSD(redemption.fee)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
