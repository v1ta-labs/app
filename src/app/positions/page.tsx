'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import { ArrowUpRight, TrendingUp, AlertTriangle, Edit, X, Loader2, Plus, Minus, ArrowDown, Info, Zap, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePosition, useSolPrice, useVitaClient } from '@/hooks';
import { useAppKitAccount } from '@reown/appkit/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import { AmountInput } from '@/components/ui/amount-input';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

export default function PositionsPage() {
  const router = useRouter();
  const { isConnected, address } = useAppKitAccount();
  const { price: solPrice } = useSolPrice();
  const { health, collateralSol, debtVusd, hasPosition, isLoading } = usePosition(solPrice);
  const { client: vitaClient } = useVitaClient();

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [collateralChange, setCollateralChange] = useState('');
  const [debtChange, setDebtChange] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [adjustMode, setAdjustMode] = useState<'collateral' | 'debt'>('collateral');
  const [collateralAction, setCollateralAction] = useState<'add' | 'remove'>('add');
  const [debtAction, setDebtAction] = useState<'borrow' | 'repay'>('borrow');
  const [vusdBalance, setVusdBalance] = useState<number>(0);

  // Fetch vUSD balance
  const fetchVusdBalance = useCallback(async () => {
    if (!vitaClient || !address || !isConnected) {
      setVusdBalance(0);
      return;
    }

    try {
      const connection = vitaClient.provider.connection;
      const userVusdAccount = await getAssociatedTokenAddress(
        vitaClient.pdas.vusdMint,
        new PublicKey(address)
      );

      const accountInfo = await connection.getAccountInfo(userVusdAccount);
      if (!accountInfo) {
        setVusdBalance(0);
        return;
      }

      const balance = await connection.getTokenAccountBalance(userVusdAccount);
      const uiAmount = parseFloat(balance.value.uiAmount?.toString() || '0');
      setVusdBalance(uiAmount);
      console.log('vUSD Balance fetched:', uiAmount);
    } catch (error) {
      console.error('Failed to fetch vUSD balance:', error);
      setVusdBalance(0);
    }
  }, [vitaClient, address, isConnected]);

  // Fetch balance when modal opens or when dependencies change
  useEffect(() => {
    if (showRepayModal || showAdjustModal) {
      fetchVusdBalance();
    }
  }, [showRepayModal, showAdjustModal, fetchVusdBalance]);

  async function handleAdjustPosition() {
    if (!vitaClient) return;

    const toastId = toast.loading('Preparing adjustment...');

    try {
      setIsAdjusting(true);

      toast.loading('Waiting for wallet approval...', { id: toastId });

      // Convert action modes to signed values
      const collateralDelta = collateralAction === 'add'
        ? parseFloat(collateralChange || '0')
        : -parseFloat(collateralChange || '0');

      const debtDelta = debtAction === 'borrow'
        ? parseFloat(debtChange || '0')
        : -parseFloat(debtChange || '0');

      const signature = await vitaClient.adjustPosition(collateralDelta, debtDelta);

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <div>
            <div className="font-semibold">Position adjusted successfully!</div>
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>,
        { id: toastId, duration: 5000 }
      );

      setShowAdjustModal(false);
      setCollateralChange('');
      setDebtChange('');
      setCollateralAction('add');
      setDebtAction('borrow');

      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Adjust failed:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(
        <div>
          <div className="font-semibold">Adjustment failed</div>
          <div className="text-xs mt-1">{errorMessage}</div>
        </div>,
        { id: toastId, duration: 5000 }
      );
    } finally {
      setIsAdjusting(false);
    }
  }

  async function handleRepay() {
    if (!vitaClient || !repayAmount) return;

    const toastId = toast.loading('Preparing repayment...');

    try {
      setIsRepaying(true);

      toast.loading('Waiting for wallet approval...', { id: toastId });

      // Repay is just adjustPosition with negative debt change
      const signature = await vitaClient.adjustPosition(0, -parseFloat(repayAmount));

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <div>
            <div className="font-semibold">Debt repaid successfully!</div>
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>,
        { id: toastId, duration: 5000 }
      );

      setShowRepayModal(false);
      setRepayAmount('');

      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Repay failed:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(
        <div>
          <div className="font-semibold">Repayment failed</div>
          <div className="text-xs mt-1">{errorMessage}</div>
        </div>,
        { id: toastId, duration: 5000 }
      );
    } finally {
      setIsRepaying(false);
    }
  }

  async function handleClosePosition() {
    if (!vitaClient) return;

    // Confirmation dialog
    if (!confirm('Are you sure you want to close this position? All collateral will be returned and all debt must be repaid.')) {
      return;
    }

    const toastId = toast.loading('Preparing to close position...');

    try {
      setIsClosing(true);

      toast.loading('Waiting for wallet approval...', { id: toastId });

      const signature = await vitaClient.closePosition();

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <div>
            <div className="font-semibold">Position closed successfully!</div>
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>,
        { id: toastId, duration: 5000 }
      );

      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Close failed:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(
        <div>
          <div className="font-semibold">Failed to close position</div>
          <div className="text-xs mt-1">{errorMessage}</div>
        </div>,
        { id: toastId, duration: 5000 }
      );
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

  // Calculate projected position after adjustment
  const projectedPosition = useMemo(() => {
    // Convert action modes to signed values
    const collateralDelta = collateralAction === 'add'
      ? parseFloat(collateralChange || '0')
      : -parseFloat(collateralChange || '0');

    const debtDelta = debtAction === 'borrow'
      ? parseFloat(debtChange || '0')
      : -parseFloat(debtChange || '0');

    const newCollateralSol = collateralSol + collateralDelta;
    const newCollateralValue = newCollateralSol * solPrice;
    const newDebt = debtVusd + debtDelta;

    const newCollateralRatio = newDebt > 0 ? (newCollateralValue / newDebt) * 100 : 0;
    const newLtv = newCollateralValue > 0 ? (newDebt / newCollateralValue) * 100 : 0;

    const getRisk = (cr: number) => {
      if (cr >= 200) return { level: 'safe', label: 'Very Safe', color: 'text-success' };
      if (cr >= 150) return { level: 'moderate', label: 'Safe', color: 'text-success' };
      if (cr >= 110) return { level: 'risky', label: 'At Risk', color: 'text-warning' };
      return { level: 'danger', label: 'Danger', color: 'text-error' };
    };

    // Check if user has enough vUSD when repaying
    const hasEnoughVusd = debtAction === 'repay'
      ? parseFloat(debtChange || '0') <= vusdBalance
      : true;

    return {
      collateralSol: newCollateralSol,
      collateralValue: newCollateralValue,
      debt: newDebt,
      collateralRatio: newCollateralRatio,
      ltv: newLtv,
      risk: getRisk(newCollateralRatio),
      isValid: newCollateralSol >= 0 && newDebt >= 0 && newCollateralRatio >= 110 && hasEnoughVusd,
      hasEnoughVusd,
    };
  }, [collateralChange, debtChange, collateralSol, debtVusd, solPrice, collateralAction, debtAction, vusdBalance]);

  // Calculate projected position after repayment
  const projectedRepay = useMemo(() => {
    const repayDelta = parseFloat(repayAmount || '0');

    const newDebt = Math.max(0, debtVusd - repayDelta);
    const newCollateralValue = collateralSol * solPrice;
    const newCollateralRatio = newDebt > 0 ? (newCollateralValue / newDebt) * 100 : Infinity;

    const getRisk = (cr: number) => {
      if (cr >= 200 || cr === Infinity) return { level: 'safe', label: 'Very Safe', color: 'text-success' };
      if (cr >= 150) return { level: 'moderate', label: 'Safe', color: 'text-success' };
      if (cr >= 110) return { level: 'risky', label: 'At Risk', color: 'text-warning' };
      return { level: 'danger', label: 'Danger', color: 'text-error' };
    };

    return {
      debt: newDebt,
      collateralRatio: newCollateralRatio === Infinity ? 0 : newCollateralRatio,
      risk: getRisk(newCollateralRatio),
      isValid: repayDelta > 0 && repayDelta <= Math.min(debtVusd, vusdBalance),
    };
  }, [repayAmount, debtVusd, collateralSol, solPrice, vusdBalance]);

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
                          onClick={() => setShowAdjustModal(true)}
                          disabled={isAdjusting || isClosing}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Adjust
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => setShowRepayModal(true)}
                          disabled={isRepaying || isAdjusting || isClosing}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Repay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-error border-error/30 hover:bg-error/10"
                          onClick={handleClosePosition}
                          disabled={isClosing || isAdjusting}
                        >
                          {isClosing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                          {isClosing ? 'Closing...' : 'Close'}
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

        {/* Adjust Position Dialog */}
        <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] sm:max-w-[750px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-0 rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-surface/95 via-surface/90 to-base/95 border-2 border-primary/20 shadow-2xl shadow-primary/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            {/* Header with Gradient */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-success/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-bold text-text-primary">
                  Adjust Position
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm text-text-tertiary ml-13">
                Modify your collateral and debt to manage your position health
              </DialogDescription>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-6 space-y-6"
            >
              {/* Mode Tabs with Animation */}
              <div className="flex gap-2 p-1.5 bg-gradient-to-r from-base/80 to-surface/80 rounded-xl border border-border/30 shadow-inner">
                <motion.button
                  onClick={() => setAdjustMode('collateral')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                    adjustMode === 'collateral'
                      ? 'text-white shadow-xl'
                      : 'text-text-tertiary hover:text-text-primary hover:bg-surface/50'
                  }`}
                >
                  {adjustMode === 'collateral' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-lg"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-lg">◎</span>
                    Collateral
                  </span>
                </motion.button>
                <motion.button
                  onClick={() => setAdjustMode('debt')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                    adjustMode === 'debt'
                      ? 'text-white shadow-xl'
                      : 'text-text-tertiary hover:text-text-primary hover:bg-surface/50'
                  }`}
                >
                  {adjustMode === 'debt' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-lg"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-lg">💵</span>
                    Debt
                  </span>
                </motion.button>
              </div>

              {/* Current Position Stats with Enhanced Styling */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="p-5 bg-gradient-to-br from-surface/60 via-surface/40 to-base/60 border-border/30 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                      <Info className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      Current Position
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-base/40 border border-border/20">
                      <div className="text-xs text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Collateral</div>
                      <div className="text-xl font-bold text-text-primary mb-1">
                        {formatNumber(collateralSol, 4)} SOL
                      </div>
                      <div className="text-xs text-text-tertiary">{formatUSD(totalCollateral)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-base/40 border border-border/20">
                      <div className="text-xs text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Debt</div>
                      <div className="text-xl font-bold text-text-primary mb-1">
                        {formatNumber(debtVusd, 2)} vUSD
                      </div>
                      <div className="text-xs text-text-tertiary">{formatUSD(debtVusd)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-success/10 to-primary/10 border border-success/20">
                      <div className="text-xs text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Health Factor</div>
                      <div className={`text-xl font-bold mb-1 ${(health?.collateralRatio || 0) >= 150 ? 'text-success' : (health?.collateralRatio || 0) >= 110 ? 'text-warning' : 'text-error'}`}>
                        {avgHealthFactor.toFixed(0)}%
                      </div>
                      <div className="text-xs font-semibold text-success">{health?.status}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Adjustment Input */}
              {adjustMode === 'collateral' ? (
                <div className="space-y-3">
                  {/* Action Mode Toggle */}
                  <div className="flex gap-2 p-1 bg-base/60 rounded-lg border border-border/30">
                    <button
                      onClick={() => setCollateralAction('add')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all ${
                        collateralAction === 'add'
                          ? 'bg-success text-white shadow-md'
                          : 'text-text-tertiary hover:text-text-primary'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 inline mr-1" />
                      Add Collateral
                    </button>
                    <button
                      onClick={() => setCollateralAction('remove')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all ${
                        collateralAction === 'remove'
                          ? 'bg-warning text-white shadow-md'
                          : 'text-text-tertiary hover:text-text-primary'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5 inline mr-1" />
                      Remove Collateral
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                      {collateralAction === 'add' ? 'Add' : 'Remove'} Amount
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {collateralAction === 'add' ? 'Available in wallet: ' : 'Current collateral: '}
                      <span className="font-semibold text-text-secondary">
                        {collateralAction === 'add' ? '0.00' : formatNumber(collateralSol, 4)} SOL
                      </span>
                    </span>
                  </div>

                  <AmountInput
                    value={collateralChange}
                    onChange={setCollateralChange}
                    placeholder="0.00"
                    leftElement={
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="text-xl">◎</span>
                        <span className="font-semibold text-text-primary">SOL</span>
                      </div>
                    }
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCollateralChange((collateralSol * 0.5).toFixed(4))}
                      className="text-xs"
                    >
                      50% {collateralAction === 'add' ? 'Wallet' : 'Current'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCollateralChange(collateralSol.toFixed(4))}
                      className="text-xs font-bold"
                    >
                      {collateralAction === 'add' ? 'ALL Wallet' : 'ALL Current'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Action Mode Toggle */}
                  <div className="flex gap-2 p-1 bg-base/60 rounded-lg border border-border/30">
                    <button
                      onClick={() => setDebtAction('borrow')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all ${
                        debtAction === 'borrow'
                          ? 'bg-primary text-white shadow-md'
                          : 'text-text-tertiary hover:text-text-primary'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 inline mr-1" />
                      Borrow More
                    </button>
                    <button
                      onClick={() => setDebtAction('repay')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all ${
                        debtAction === 'repay'
                          ? 'bg-success text-white shadow-md'
                          : 'text-text-tertiary hover:text-text-primary'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5 inline mr-1" />
                      Repay Debt
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                      {debtAction === 'borrow' ? 'Borrow' : 'Repay'} Amount
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {debtAction === 'borrow' ? 'Max available: ' : 'vUSD Balance: '}
                      <span className="font-semibold text-text-secondary">
                        {debtAction === 'borrow' ? formatNumber(availableToBorrow, 2) : formatNumber(vusdBalance, 2)} vUSD
                      </span>
                    </span>
                  </div>

                  <AmountInput
                    value={debtChange}
                    onChange={setDebtChange}
                    placeholder="0.00"
                    leftElement={
                      <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border">
                        <span className="text-lg">💵</span>
                        <span className="font-semibold text-text-primary">vUSD</span>
                      </div>
                    }
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDebtChange(debtAction === 'borrow' ? (availableToBorrow * 0.5).toFixed(2) : (Math.min(debtVusd, vusdBalance) * 0.5).toFixed(2))}
                      className="text-xs"
                    >
                      50%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDebtChange(debtAction === 'borrow' ? availableToBorrow.toFixed(2) : Math.min(debtVusd, vusdBalance).toFixed(2))}
                      className="text-xs font-bold"
                    >
                      MAX
                    </Button>
                  </div>

                  {/* Warnings and Info */}
                  {debtAction === 'borrow' && parseFloat(debtChange || '0') > 0 && (
                    <div className="p-3 bg-success/10 rounded-xl border border-success/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-3.5 h-3.5 text-success" />
                        <span className="text-xs font-bold text-text-primary">0% Interest</span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        Borrowing fee: <span className="font-bold text-primary">{formatUSD((parseFloat(debtChange) * 0.005))}</span> (0.5% one-time)
                      </div>
                    </div>
                  )}

                  {debtAction === 'repay' && !projectedPosition.hasEnoughVusd && parseFloat(debtChange || '0') > 0 && (
                    <div className="p-3 bg-error/10 rounded-xl border border-error/30">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-error" />
                        <span className="text-xs font-bold text-error">Insufficient vUSD Balance</span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        You're trying to repay {formatNumber(parseFloat(debtChange), 2)} vUSD but only have {formatNumber(vusdBalance, 2)} vUSD available.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Projected Position */}
              {(collateralChange || debtChange) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                      New Position Preview
                    </span>
                  </div>

                  <Card className={`p-4 border-2 ${
                    projectedPosition.isValid
                      ? projectedPosition.collateralRatio >= 150
                        ? 'bg-success/5 border-success/30'
                        : 'bg-warning/5 border-warning/30'
                      : 'bg-error/5 border-error/30'
                  }`}>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-text-tertiary mb-1">New Collateral</div>
                        <div className="text-lg font-bold text-text-primary">
                          {formatNumber(projectedPosition.collateralSol, 4)} SOL
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {formatUSD(projectedPosition.collateralValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-tertiary mb-1">New Debt</div>
                        <div className="text-lg font-bold text-text-primary">
                          {formatNumber(projectedPosition.debt, 2)} vUSD
                        </div>
                        <div className="text-xs text-text-tertiary">{formatUSD(projectedPosition.debt)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-tertiary mb-1">New Health</div>
                        <div className={`text-lg font-bold ${projectedPosition.risk.color}`}>
                          {projectedPosition.collateralRatio.toFixed(0)}%
                        </div>
                        <div className={`text-xs font-semibold ${projectedPosition.risk.color}`}>
                          {projectedPosition.risk.label}
                        </div>
                      </div>
                    </div>

                    {!projectedPosition.isValid && (
                      <div className="flex items-center gap-2 p-2 bg-error/10 rounded-lg border border-error/30">
                        <AlertTriangle className="w-4 h-4 text-error shrink-0" />
                        <span className="text-xs text-error font-semibold">
                          Invalid adjustment: Health factor must be ≥ 110%
                        </span>
                      </div>
                    )}

                    {projectedPosition.isValid && projectedPosition.collateralRatio < 150 && (
                      <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-lg border border-warning/30">
                        <Info className="w-4 h-4 text-warning shrink-0" />
                        <span className="text-xs text-warning font-semibold">
                          Warning: Health factor below recommended 150%
                        </span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowAdjustModal(false);
                    setCollateralChange('');
                    setDebtChange('');
                    setCollateralAction('add');
                    setDebtAction('borrow');
                  }}
                  disabled={isAdjusting}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={handleAdjustPosition}
                  disabled={isAdjusting || (!collateralChange && !debtChange) || !projectedPosition.isValid}
                  className="shadow-lg shadow-primary/20"
                >
                  {isAdjusting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adjusting...
                    </span>
                  ) : (
                    'Confirm Adjustment'
                  )}
                </Button>
              </div>
            </motion.div>
          </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Repay Modal */}
        <Dialog open={showRepayModal} onOpenChange={setShowRepayModal}>
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] sm:max-w-[600px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-0 rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-surface/95 via-surface/90 to-base/95 border-2 border-success/20 shadow-2xl shadow-success/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 border-b border-border/50 bg-gradient-to-r from-success/5 via-transparent to-primary/5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-success" />
                  </div>
                  <DialogTitle className="text-2xl font-bold text-text-primary">
                    Repay Debt
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-text-tertiary ml-13">
                  Repay your vUSD debt to improve your position health
                </DialogDescription>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-6 space-y-6"
              >
                {/* Current Debt Display */}
                <Card className="p-5 bg-gradient-to-br from-surface/60 via-surface/40 to-base/60 border-border/30 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning/20 to-error/20 flex items-center justify-center">
                      <Info className="w-4 h-4 text-warning" />
                    </div>
                    <div className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      Current Debt
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-text-primary mb-2">
                      {formatNumber(debtVusd, 2)} vUSD
                    </div>
                    <div className="text-sm text-text-tertiary">{formatUSD(debtVusd)}</div>
                  </div>
                </Card>

                {/* Repay Amount Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                      Repay Amount
                    </span>
                    <span className="text-xs text-text-tertiary">
                      Available: <span className="font-semibold text-text-secondary">{formatNumber(vusdBalance, 2)} vUSD</span>
                    </span>
                  </div>

                  <AmountInput
                    value={repayAmount}
                    onChange={setRepayAmount}
                    placeholder="0.00"
                    leftElement={
                      <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border">
                        <span className="text-lg">💵</span>
                        <span className="font-semibold text-text-primary">vUSD</span>
                      </div>
                    }
                  />

                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRepayAmount((debtVusd * 0.25).toFixed(2))}
                      className="text-xs"
                    >
                      25%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRepayAmount((debtVusd * 0.5).toFixed(2))}
                      className="text-xs"
                    >
                      50%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRepayAmount((debtVusd * 0.75).toFixed(2))}
                      className="text-xs"
                    >
                      75%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRepayAmount(debtVusd.toFixed(2))}
                      className="text-xs font-bold"
                    >
                      MAX
                    </Button>
                  </div>

                  {/* Insufficient Balance Warning */}
                  {repayAmount && parseFloat(repayAmount) > vusdBalance && (
                    <div className="p-3 bg-error/10 rounded-xl border border-error/30">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-error" />
                        <span className="text-xs font-bold text-error">Insufficient vUSD Balance</span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        You're trying to repay {formatNumber(parseFloat(repayAmount), 2)} vUSD but only have {formatNumber(vusdBalance, 2)} vUSD available.
                      </div>
                    </div>
                  )}
                </div>

                {/* Projected Health After Repayment */}
                {repayAmount && projectedRepay.isValid && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowDown className="w-4 h-4 text-text-tertiary" />
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                        After Repayment
                      </span>
                    </div>

                    <Card className="p-4 border-2 bg-success/5 border-success/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-text-tertiary mb-1">Remaining Debt</div>
                          <div className="text-2xl font-bold text-text-primary">
                            {formatNumber(projectedRepay.debt, 2)} vUSD
                          </div>
                          <div className="text-xs text-text-tertiary">{formatUSD(projectedRepay.debt)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-text-tertiary mb-1">New Health</div>
                          <div className={`text-2xl font-bold ${projectedRepay.risk.color}`}>
                            {projectedRepay.debt > 0 ? `${projectedRepay.collateralRatio.toFixed(0)}%` : 'Debt Free'}
                          </div>
                          <div className={`text-xs font-semibold ${projectedRepay.risk.color}`}>
                            {projectedRepay.risk.label}
                          </div>
                        </div>
                      </div>

                      {projectedRepay.debt === 0 && (
                        <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/30">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <span className="text-xs text-success font-semibold">
                              All debt repaid! You can withdraw your collateral.
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setShowRepayModal(false);
                      setRepayAmount('');
                    }}
                    disabled={isRepaying}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    onClick={handleRepay}
                    disabled={isRepaying || !repayAmount || !projectedRepay.isValid}
                    className="shadow-lg shadow-success/20 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70"
                  >
                    {isRepaying ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Repaying...
                      </span>
                    ) : (
                      'Confirm Repayment'
                    )}
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    </AppLayout>
  );
}
