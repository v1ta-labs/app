'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import { AlertTriangle, TrendingUp, ExternalLink, Flame, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const AT_RISK_POSITIONS: {
  id: number;
  owner: string;
  collateral: string;
  collateralAmount: number;
  collateralValue: number;
  debt: number;
  healthFactor: number;
  ltv: number;
  liquidationPrice: number;
  penalty: number;
}[] = [];

const RECENT_LIQUIDATIONS: {
  id: number;
  position: string;
  collateral: string;
  collateralAmount: number;
  collateralValue: number;
  debt: number;
  penalty: number;
  liquidator: string;
  timestamp: string;
}[] = [];

export default function LiquidationsPage() {
  const [selectedCollateral, setSelectedCollateral] = useState<string | null>(null);

  const totalAtRisk = 0;
  const totalLiquidated24h = 0;
  const avgHealthFactor = 0;
  const liquidationsCount24h = 0;

  const filteredPositions = selectedCollateral
    ? AT_RISK_POSITIONS.filter(p => p.collateral === selectedCollateral)
    : AT_RISK_POSITIONS;

  return (
    <AppLayout>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Liquidations</h1>
            <p className="text-sm text-text-tertiary">
              Monitor at-risk positions and liquidation opportunities
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                24h Liquidations
              </div>
              <div className="text-2xl font-bold text-text-primary">{liquidationsCount24h}</div>
              <div className="text-xs text-success mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +0% from avg
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                24h Volume
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatUSD(totalLiquidated24h)}
              </div>
              <div className="text-xs text-text-tertiary mt-1">Total liquidated</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                At Risk
              </div>
              <div className="text-2xl font-bold text-warning">{formatUSD(totalAtRisk)}</div>
              <div className="text-xs text-text-tertiary mt-1">
                {AT_RISK_POSITIONS.length} positions
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Avg Health Factor
              </div>
              <div className="text-2xl font-bold text-warning">{avgHealthFactor.toFixed(0)}%</div>
              <div className="text-xs text-text-tertiary mt-1">Below threshold</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* At Risk Positions */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary">At Risk Positions</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-tertiary">Filter:</span>
                  <div className="flex gap-1">
                    {['SOL', 'mSOL', 'jitoSOL'].map(asset => (
                      <button
                        key={asset}
                        onClick={() =>
                          setSelectedCollateral(selectedCollateral === asset ? null : asset)
                        }
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          selectedCollateral === asset
                            ? 'bg-warning/20 text-warning border border-warning/40'
                            : 'bg-base text-text-tertiary border border-border hover:bg-elevated'
                        }`}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {filteredPositions.map((position, index) => (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="p-5 backdrop-blur-xl bg-surface/70 border-warning/30">
                      <div className="flex items-start gap-4">
                        {/* Warning Icon */}
                        <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-6 h-6 text-warning" />
                        </div>

                        {/* Position Info */}
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Position</div>
                            <div className="text-sm font-mono font-bold text-text-primary">
                              {position.owner}
                            </div>
                            <div className="text-xs text-text-tertiary mt-1">
                              {position.collateral} collateral
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Collateral</div>
                            <div className="text-sm font-bold text-text-primary">
                              {formatNumber(position.collateralAmount, 2)} {position.collateral}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {formatUSD(position.collateralValue)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Debt</div>
                            <div className="text-sm font-bold text-text-primary">
                              {formatUSD(position.debt)}
                            </div>
                            <div className="text-xs text-text-tertiary">VUSD</div>
                          </div>
                        </div>

                        {/* Health Factor */}
                        <div className="w-48 shrink-0">
                          <div className="p-3 bg-base rounded-xl border border-warning/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-text-primary">Health</span>
                              <span className="text-lg font-bold text-warning">
                                {position.healthFactor}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-2">
                              <div
                                className="h-full bg-warning transition-all"
                                style={{ width: `${Math.min(position.healthFactor, 100)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-tertiary">
                                LTV: {position.ltv.toFixed(1)}%
                              </span>
                              <span className="text-warning font-semibold">
                                Penalty: {position.penalty}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Liquidate Button */}
                        <Button
                          size="sm"
                          className="gap-2 shrink-0 bg-warning/20 text-warning border border-warning/40 hover:bg-warning/30"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          Liquidate
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Info Banner */}
              <div className="mt-4 flex items-start gap-3 p-4 bg-primary/10 rounded-xl border border-primary/30">
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-text-primary mb-1">
                    Liquidation Mechanism
                  </div>
                  <div className="text-xs text-text-tertiary">
                    Positions become liquidatable when health factor drops below 110%. Liquidators
                    repay the debt and receive the collateral plus an 8% penalty, keeping the
                    protocol solvent.
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Liquidations */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-4">Recent Liquidations</h2>
                <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
                  <div className="space-y-3">
                    {RECENT_LIQUIDATIONS.map((liquidation, index) => (
                      <motion.div
                        key={liquidation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-3 bg-base rounded-xl"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Position</div>
                            <div className="text-sm font-mono font-bold text-text-primary">
                              {liquidation.position}
                            </div>
                          </div>
                          <button className="text-text-tertiary hover:text-primary transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-text-tertiary">Collateral</span>
                          <span className="font-bold text-text-primary">
                            {formatNumber(liquidation.collateralAmount, 2)} {liquidation.collateral}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-text-tertiary">Debt Repaid</span>
                          <span className="font-bold text-text-primary">
                            {formatUSD(liquidation.debt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs mb-3 pb-3 border-b border-border">
                          <span className="text-text-tertiary">Liquidator</span>
                          <span className="font-mono text-text-secondary">
                            {liquidation.liquidator}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-tertiary">
                            {liquidation.timestamp}
                          </span>
                          <span className="text-xs font-bold text-success">
                            +{formatUSD(liquidation.penalty)} profit
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Liquidation Stats */}
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-4">Top Liquidators (24h)</h2>
                <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
                  <div className="space-y-3">
                    {(
                      [] as {
                        rank: number;
                        liquidator: string;
                        count: number;
                        volume: number;
                        profit: number;
                      }[]
                    ).map(top => (
                      <div
                        key={top.rank}
                        className="flex items-center gap-3 p-3 bg-base rounded-xl"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            top.rank === 1
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : top.rank === 2
                                ? 'bg-gray-400/20 text-gray-400'
                                : 'bg-amber-700/20 text-amber-700'
                          }`}
                        >
                          #{top.rank}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-mono font-bold text-text-primary">
                            {top.liquidator}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {top.count} liquidations • {formatUSD(top.volume)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-success">
                            +{formatUSD(top.profit)}
                          </div>
                          <div className="text-xs text-text-tertiary">profit</div>
                        </div>
                      </div>
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
