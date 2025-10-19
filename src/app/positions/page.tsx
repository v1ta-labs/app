'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import { ArrowUpRight, TrendingUp, AlertTriangle, Edit, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePosition, useSolPrice, useVitaClient } from '@/hooks';
import { useAppKitAccount } from '@reown/appkit/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PositionsPage() {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();
  const { price: solPrice } = useSolPrice();
  const { health, collateralSol, debtVusd, hasPosition, isLoading } = usePosition(solPrice);
  const vitaClient = useVitaClient();

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [collateralChange, setCollateralChange] = useState('');
  const [debtChange, setDebtChange] = useState('');

  async function handleAdjustPosition() {
    if (!vitaClient) return;

    try {
      setIsAdjusting(true);
      const signature = await vitaClient.adjustPosition(
        parseFloat(collateralChange || '0'),
        parseFloat(debtChange || '0')
      );
      console.log('Position adjusted!', signature);
      alert('Position adjusted successfully!');
      setShowAdjustModal(false);
      setCollateralChange('');
      setDebtChange('');
      window.location.reload();
    } catch (error) {
      console.error('Adjust failed:', error);
      alert(`Adjust failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAdjusting(false);
    }
  }

  async function handleClosePosition() {
    if (!vitaClient || !confirm('Are you sure you want to close this position?')) return;

    try {
      setIsClosing(true);
      const signature = await vitaClient.closePosition();
      console.log('Position closed!', signature);
      alert('Position closed successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Close failed:', error);
      alert(`Close failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsClosing(false);
    }
  }

  // Calculate stats from real position data
  const totalCollateral = health?.collateralValue || 0;
  const totalBorrowed = debtVusd;
  const avgHealthFactor = health?.collateralRatio || 0;
  const maxLtv = 90.9; // 110% collateral ratio = 90.9% LTV
  const availableToBorrow = Math.max(0, (totalCollateral * maxLtv) / 100 - totalBorrowed);

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-8">
          <Card className="p-12 max-w-lg mx-auto text-center backdrop-blur-xl bg-surface/70 border-border/50">
            <h2 className="text-2xl font-bold text-text-primary mb-3">Connect Your Wallet</h2>
            <p className="text-text-secondary mb-8">
              Please connect your Solana wallet to view your positions.
            </p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Your Positions</h1>
            <p className="text-sm text-text-tertiary">
              Manage your borrowing positions and collateral
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Total Collateral
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatUSD(totalCollateral)}
              </div>
              <div className="text-xs text-success mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +5.2% (24h)
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Total Borrowed
              </div>
              <div className="text-2xl font-bold text-text-primary">{formatUSD(totalBorrowed)}</div>
              <div className="text-xs text-text-tertiary mt-1">VUSD</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Avg Health Factor
              </div>
              <div className="text-2xl font-bold text-success">{avgHealthFactor.toFixed(0)}%</div>
              <div className="text-xs text-text-tertiary mt-1">Healthy</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Available to Borrow
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatUSD(availableToBorrow)}
              </div>
              <div className="text-xs text-text-tertiary mt-1">Max VUSD</div>
            </Card>
          </div>

          {/* Positions List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Active Positions</h2>
              <div className="text-sm text-text-tertiary">
                {hasPosition ? '1 position' : '0 positions'}
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <Card className="p-12 backdrop-blur-xl bg-surface/70 border-border/50 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-sm text-text-tertiary">Loading positions...</p>
                </Card>
              ) : !hasPosition ? (
                <Card className="p-12 backdrop-blur-xl bg-surface/70 border-border/50 text-center">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-text-primary mb-2">No positions yet</h3>
                    <p className="text-sm text-text-tertiary">
                      Open your first position to start borrowing VUSD against your collateral
                    </p>
                  </div>
                </Card>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
                    <div className="flex items-start gap-6">
                      {/* Collateral Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="text-xl font-bold text-primary">◎</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-text-primary mb-1">
                              CDP Position
                            </div>
                            <div className="text-xs text-text-tertiary">Using SOL as collateral</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Collateral</div>
                            <div className="text-base font-bold text-text-primary">
                              {formatNumber(collateralSol, 4)} SOL
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {formatUSD(totalCollateral)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Borrowed</div>
                            <div className="text-base font-bold text-text-primary">
                              {formatNumber(debtVusd, 2)} VUSD
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {formatUSD(debtVusd)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Interest Rate</div>
                            <div className="text-base font-bold text-text-primary">0%</div>
                            <div className="text-xs text-text-tertiary">APR</div>
                          </div>
                        </div>
                      </div>

                      {/* Health Factor */}
                      <div className="w-64 shrink-0">
                        <div className="p-4 bg-base rounded-xl border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-bold text-text-primary">
                              Collateral Ratio
                            </div>
                            <div
                              className={`text-xl font-bold ${
                                (health?.collateralRatio || 0) >= 150
                                  ? 'text-success'
                                  : (health?.collateralRatio || 0) >= 110
                                    ? 'text-warning'
                                    : 'text-error'
                              }`}
                            >
                              {health?.collateralRatio.toFixed(0) || 0}%
                            </div>
                          </div>

                          <div className="h-2 bg-surface rounded-full overflow-hidden mb-3">
                            <div
                              className={`h-full transition-all ${
                                (health?.collateralRatio || 0) >= 150
                                  ? 'bg-success'
                                  : (health?.collateralRatio || 0) >= 110
                                    ? 'bg-warning'
                                    : 'bg-error'
                              }`}
                              style={{
                                width: `${Math.min((health?.collateralRatio || 0) * 0.5, 100)}%`,
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs mb-3">
                            <span className="text-text-tertiary uppercase tracking-wider font-semibold">
                              Status
                            </span>
                            <span className="font-bold text-text-primary">
                              {health?.status || 'Unknown'}
                            </span>
                          </div>

                          {health && health.collateralRatio < 150 && (
                            <div className="flex items-center gap-2 mt-3 p-2 bg-warning/10 rounded-lg">
                              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                              <span className="text-xs text-warning font-semibold">
                                {health.collateralRatio < 110
                                  ? 'Liquidatable!'
                                  : 'Add collateral'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => router.push('/#borrow-section')}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Adjust
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2" disabled>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Repay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-error border-error/30 hover:bg-error/10"
                          disabled
                        >
                          <X className="w-3.5 h-3.5" />
                          Close
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>

          {/* Create New Position CTA */}
          {!hasPosition && (
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
          )}
        </div>
      </div>
    </AppLayout>
  );
}
