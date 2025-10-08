'use client';

import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import { ArrowUpRight, TrendingUp, AlertTriangle, Edit, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Position {
  id: string;
  type: string;
  collateral: string;
  collateralAmount: number;
  collateralValue: number;
  borrowed: number;
  interestRate: number;
  healthFactor: number;
  status: 'healthy' | 'warning' | 'liquidation';
  ltv: number;
}

export default function PositionsPage() {
  const router = useRouter();
  // TODO: Replace with actual positions from Solana/backend
  const positions: Position[] = [];

  const totalCollateral = positions.reduce((sum, p) => sum + p.collateralValue, 0);
  const totalBorrowed = positions.reduce((sum, p) => sum + p.borrowed, 0);
  const avgHealthFactor = positions.length > 0
    ? positions.reduce((sum, p) => sum + p.healthFactor, 0) / positions.length
    : 0;
  const availableToBorrow = totalCollateral * 0.6667 - totalBorrowed;

  return (
    <AppLayout>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Your Positions</h1>
            <p className="text-sm text-text-tertiary">Manage your borrowing positions and collateral</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">Total Collateral</div>
              <div className="text-2xl font-bold text-text-primary">{formatUSD(totalCollateral)}</div>
              <div className="text-xs text-success mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +5.2% (24h)
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">Total Borrowed</div>
              <div className="text-2xl font-bold text-text-primary">{formatUSD(totalBorrowed)}</div>
              <div className="text-xs text-text-tertiary mt-1">VUSD</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">Avg Health Factor</div>
              <div className="text-2xl font-bold text-success">{avgHealthFactor.toFixed(0)}%</div>
              <div className="text-xs text-text-tertiary mt-1">Healthy</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">Available to Borrow</div>
              <div className="text-2xl font-bold text-text-primary">{formatUSD(availableToBorrow)}</div>
              <div className="text-xs text-text-tertiary mt-1">Max VUSD</div>
            </Card>
          </div>

          {/* Positions List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Active Positions</h2>
              <div className="text-sm text-text-tertiary">{positions.length} positions</div>
            </div>

            <div className="space-y-4">
              {positions.length === 0 ? (
                <Card className="p-12 backdrop-blur-xl bg-surface/70 border-border/50 text-center">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-text-primary mb-2">No positions yet</h3>
                    <p className="text-sm text-text-tertiary">
                      Open your first position to start borrowing VUSD against your collateral
                    </p>
                  </div>
                </Card>
              ) : (
                positions.map((position, index) => (
                <motion.div
                  key={position.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
                    <div className="flex items-start gap-6">
                      {/* Collateral Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="text-xl font-bold text-primary">{position.collateral[0]}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-text-primary mb-1">{position.type} Position #{position.id}</div>
                            <div className="text-xs text-text-tertiary">Using {position.collateral} as collateral</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Collateral</div>
                            <div className="text-base font-bold text-text-primary">{formatNumber(position.collateralAmount, 2)} {position.collateral}</div>
                            <div className="text-xs text-text-tertiary">{formatUSD(position.collateralValue)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Borrowed</div>
                            <div className="text-base font-bold text-text-primary">{formatUSD(position.borrowed)}</div>
                            <div className="text-xs text-text-tertiary">VUSD</div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Interest Rate</div>
                            <div className="text-base font-bold text-text-primary">{position.interestRate}%</div>
                            <div className="text-xs text-text-tertiary">APR</div>
                          </div>
                        </div>
                      </div>

                      {/* Health Factor */}
                      <div className="w-64 shrink-0">
                        <div className="p-4 bg-base rounded-xl border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-bold text-text-primary">Health Factor</div>
                            <div className={`text-xl font-bold ${
                              position.status === 'healthy' ? 'text-success' :
                              position.status === 'warning' ? 'text-warning' :
                              'text-error'
                            }`}>
                              {position.healthFactor}%
                            </div>
                          </div>

                          <div className="h-2 bg-surface rounded-full overflow-hidden mb-3">
                            <div
                              className={`h-full transition-all ${
                                position.status === 'healthy' ? 'bg-success' :
                                position.status === 'warning' ? 'bg-warning' :
                                'bg-error'
                              }`}
                              style={{ width: `${Math.min(position.healthFactor, 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-tertiary uppercase tracking-wider font-semibold">LTV Ratio</span>
                            <span className="font-bold text-text-primary">{position.ltv.toFixed(1)}%</span>
                          </div>

                          {position.status === 'warning' && (
                            <div className="flex items-center gap-2 mt-3 p-2 bg-warning/10 rounded-lg">
                              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                              <span className="text-xs text-warning font-semibold">Close to liquidation</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button size="sm" className="gap-2">
                          <Edit className="w-3.5 h-3.5" />
                          Adjust
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Repay
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2 text-error border-error/30 hover:bg-error/10">
                          <X className="w-3.5 h-3.5" />
                          Close
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )))}
            </div>
          </div>

          {/* Create New Position CTA */}
          <Card className="p-8 backdrop-blur-xl bg-gradient-to-br from-primary/10 to-success/10 border-primary/30 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-text-primary mb-2">Open a New Position</h3>
              <p className="text-sm text-text-tertiary mb-4">
                Deposit collateral and borrow VUSD to maximize your capital efficiency
              </p>
              <Button className="gap-2" onClick={() => router.push('/#borrow-section')}>
                <ArrowUpRight className="w-4 h-4" />
                Create Position
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
