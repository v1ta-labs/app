'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import {
  TrendingUp,
  Wallet,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  Info,
  CheckCircle2,
  ExternalLink,
  Droplets,
  DollarSign,
  Award,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useVitaClient } from '@/hooks';
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
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PROTOCOL_PARAMS } from '@/lib/vita/constants';

export default function StabilityPoolPage() {
  const { isConnected, address } = useAppKitAccount();
  const { client: vitaClient } = useVitaClient();

  const [isLoading, setIsLoading] = useState(true);
  const [vusdBalance, setVusdBalance] = useState<number>(0);
  const [poolData, setPoolData] = useState<any>(null);
  const [userDeposit, setUserDeposit] = useState<any>(null);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

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
    } catch (error) {
      console.error('Failed to fetch vUSD balance:', error);
      setVusdBalance(0);
    }
  }, [vitaClient, address, isConnected]);

  // Fetch pool and user data
  const fetchData = useCallback(async () => {
    if (!vitaClient || !isConnected) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch pool data
      const pool = await vitaClient.getStabilityPool();
      setPoolData(pool);

      // Fetch user's deposit
      const deposit = await vitaClient.getStabilityDeposit();
      setUserDeposit(deposit);

      // Fetch vUSD balance
      await fetchVusdBalance();
    } catch (error) {
      console.error('Failed to fetch stability pool data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [vitaClient, isConnected, fetchVusdBalance]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (showDepositModal || showWithdrawModal) {
      fetchVusdBalance();
    }
  }, [showDepositModal, showWithdrawModal, fetchVusdBalance]);

  // Handle deposit
  async function handleDeposit() {
    if (!vitaClient || !depositAmount || isDepositing) return;

    const toastId = toast.loading('Preparing deposit...');

    try {
      setIsDepositing(true);
      toast.loading('Waiting for wallet approval...', { id: toastId });

      const signature = await vitaClient.depositStability(parseFloat(depositAmount));

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <div>
            <div className="font-semibold">Deposited successfully!</div>
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

      setShowDepositModal(false);
      setDepositAmount('');
      setTimeout(() => fetchData(), 1000);
    } catch (error) {
      console.error('Deposit failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if transaction might have succeeded despite error
      const isDuplicateError = errorMessage.includes('already been processed');

      toast.error(
        <div>
          <div className="font-semibold">
            Deposit {isDuplicateError ? 'may have succeeded' : 'failed'}
          </div>
          <div className="text-xs mt-1">
            {isDuplicateError
              ? 'Please check your deposit balance - the transaction may have gone through'
              : errorMessage}
          </div>
        </div>,
        { id: toastId, duration: 5000 }
      );

      // Refresh data even on error in case it actually succeeded
      if (isDuplicateError) {
        setShowDepositModal(false);
        setDepositAmount('');
        setTimeout(() => fetchData(), 1000);
      }
    } finally {
      setIsDepositing(false);
    }
  }

  // Handle withdrawal
  async function handleWithdraw() {
    if (!vitaClient || !withdrawAmount || isWithdrawing) return;

    const toastId = toast.loading('Preparing withdrawal...');

    try {
      setIsWithdrawing(true);
      toast.loading('Waiting for wallet approval...', { id: toastId });

      const signature = await vitaClient.withdrawStability(parseFloat(withdrawAmount));

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <div>
            <div className="font-semibold">Withdrawn successfully!</div>
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

      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setTimeout(() => fetchData(), 1000);
    } catch (error) {
      console.error('Withdrawal failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if transaction might have succeeded despite error
      const isDuplicateError = errorMessage.includes('already been processed');

      toast.error(
        <div>
          <div className="font-semibold">
            Withdrawal {isDuplicateError ? 'may have succeeded' : 'failed'}
          </div>
          <div className="text-xs mt-1">
            {isDuplicateError
              ? 'Please check your deposit balance - the transaction may have gone through'
              : errorMessage}
          </div>
        </div>,
        { id: toastId, duration: 5000 }
      );

      // Refresh data even on error in case it actually succeeded
      if (isDuplicateError) {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setTimeout(() => fetchData(), 1000);
      }
    } finally {
      setIsWithdrawing(false);
    }
  }

  // Calculate stats
  const totalDeposited = poolData
    ? poolData.totalVusdDeposited.toNumber() / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS
    : 0;

  const totalRewards = poolData ? poolData.totalSolRewards.toNumber() / LAMPORTS_PER_SOL : 0;

  const userDepositAmount = userDeposit
    ? userDeposit.amount.toNumber() / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS
    : 0;

  const userRewards = userDeposit ? userDeposit.solRewardEarned.toNumber() / LAMPORTS_PER_SOL : 0;

  const userSharePercent = totalDeposited > 0 ? (userDepositAmount / totalDeposited) * 100 : 0;

  // Deposit validation
  const depositValid = useMemo(() => {
    const amount = parseFloat(depositAmount || '0');
    return amount > 0 && amount <= vusdBalance;
  }, [depositAmount, vusdBalance]);

  // Withdraw validation
  const withdrawValid = useMemo(() => {
    const amount = parseFloat(withdrawAmount || '0');
    return amount > 0 && amount <= userDepositAmount;
  }, [withdrawAmount, userDepositAmount]);

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-8">
          <Card className="p-12 max-w-lg mx-auto text-center backdrop-blur-xl bg-surface/70 border-border/50">
            <Droplets className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">Connect Your Wallet</h2>
            <p className="text-text-secondary mb-8">
              Connect your Solana wallet to access the Stability Pool.
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
                <Droplets className="w-8 h-8 text-primary" />
                Stability Pool
              </h1>
              <p className="text-sm text-text-tertiary">
                Earn liquidation rewards by providing vUSD to the Stability Pool
              </p>
            </div>
          </div>

          {/* Pool Overview Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5" />
                Total Pool Size
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatNumber(totalDeposited, 2)} vUSD
              </div>
              <div className="text-xs text-text-tertiary mt-1">{formatUSD(totalDeposited)}</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <Award className="w-3.5 h-3.5" />
                Total SOL Rewards
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatNumber(totalRewards, 4)} SOL
              </div>
              <div className="text-xs text-success mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                From liquidations
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5" />
                Your Deposit
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatNumber(userDepositAmount, 2)} vUSD
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {userSharePercent > 0
                  ? `${formatNumber(userSharePercent, 2)}% of pool`
                  : 'No deposit yet'}
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-success/10 border-success/30">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                Your SOL Rewards
              </div>
              <div className="text-2xl font-bold text-success">
                {formatNumber(userRewards, 6)} SOL
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {userRewards > 0 ? formatUSD(userRewards * 150) : 'Earn from liquidations'}
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* How it Works */}
            <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-primary/5 to-surface/70 border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">How It Works</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary mb-1">Deposit vUSD</div>
                    <div className="text-sm text-text-secondary">
                      Provide your vUSD to the Stability Pool to help maintain the protocol's
                      stability
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary mb-1">Absorb Liquidations</div>
                    <div className="text-sm text-text-secondary">
                      When positions are liquidated, the pool's vUSD is used to pay off the debt
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">3</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary mb-1">Earn SOL Rewards</div>
                    <div className="text-sm text-text-secondary">
                      In return, you receive the liquidated SOL collateral proportional to your pool
                      share
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-warning/10 rounded-lg border border-warning/30 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <div className="text-xs text-text-secondary">
                      <span className="font-bold text-warning">Note:</span> Your vUSD deposit may
                      decrease during liquidations, but you'll receive SOL in return at a discount.
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Your Position */}
            <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-success" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Your Position</h2>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : userDepositAmount > 0 ? (
                <div className="space-y-6">
                  {/* Deposit Info */}
                  <div className="p-4 bg-base/40 rounded-xl border border-border/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-text-tertiary mb-1">Deposited</div>
                        <div className="text-xl font-bold text-text-primary">
                          {formatNumber(userDepositAmount, 2)} vUSD
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {formatUSD(userDepositAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-tertiary mb-1">SOL Earned</div>
                        <div className="text-xl font-bold text-success">
                          {formatNumber(userRewards, 6)} SOL
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {userRewards > 0 ? formatUSD(userRewards * 150) : '$0.00'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pool Share */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-tertiary font-semibold">
                        Your Pool Share
                      </span>
                      <span className="text-sm font-bold text-text-primary">
                        {formatNumber(userSharePercent, 2)}%
                      </span>
                    </div>
                    <div className="h-2 bg-base rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-success transition-all"
                        style={{ width: `${Math.min(userSharePercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      fullWidth
                      onClick={() => setShowDepositModal(true)}
                      disabled={isDepositing || isWithdrawing}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Deposit More
                    </Button>
                    <Button
                      fullWidth
                      variant="outline"
                      onClick={() => setShowWithdrawModal(true)}
                      disabled={isDepositing || isWithdrawing}
                      className="gap-2"
                    >
                      <Minus className="w-4 h-4" />
                      Withdraw
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Droplets className="w-12 h-12 mx-auto mb-4 text-text-tertiary opacity-50" />
                  <h3 className="text-lg font-bold text-text-primary mb-2">No Deposit Yet</h3>
                  <p className="text-sm text-text-secondary mb-6">
                    Start earning SOL rewards by depositing vUSD to the Stability Pool
                  </p>
                  <Button onClick={() => setShowDepositModal(true)} className="gap-2">
                    <ArrowDownCircle className="w-4 h-4" />
                    Make First Deposit
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Deposit Modal */}
        <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md" />
            <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] sm:max-w-[500px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-0 rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-surface/95 via-surface/90 to-base/95 border-2 border-primary/20 shadow-2xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-success/5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                    <ArrowDownCircle className="w-5 h-5 text-primary" />
                  </div>
                  <DialogTitle className="text-2xl font-bold text-text-primary">
                    Deposit vUSD
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-text-tertiary ml-13">
                  Deposit vUSD to earn SOL from liquidations
                </DialogDescription>
              </motion.div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                      Deposit Amount
                    </span>
                    <span className="text-xs text-text-tertiary">
                      Available:{' '}
                      <span className="font-semibold text-text-secondary">
                        {formatNumber(vusdBalance, 2)} vUSD
                      </span>
                    </span>
                  </div>

                  <AmountInput
                    value={depositAmount}
                    onChange={setDepositAmount}
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
                      onClick={() => setDepositAmount((vusdBalance * 0.25).toFixed(2))}
                      className="text-xs"
                    >
                      25%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDepositAmount((vusdBalance * 0.5).toFixed(2))}
                      className="text-xs"
                    >
                      50%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDepositAmount((vusdBalance * 0.75).toFixed(2))}
                      className="text-xs"
                    >
                      75%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDepositAmount(vusdBalance.toFixed(2))}
                      className="text-xs font-bold"
                    >
                      MAX
                    </Button>
                  </div>

                  {depositAmount && parseFloat(depositAmount) > vusdBalance && (
                    <div className="p-3 bg-error/10 rounded-xl border border-error/30">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-error" />
                        <span className="text-xs font-bold text-error">
                          Insufficient vUSD Balance
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setShowDepositModal(false);
                      setDepositAmount('');
                    }}
                    disabled={isDepositing}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    onClick={handleDeposit}
                    disabled={isDepositing || !depositValid}
                    className="shadow-lg shadow-primary/20"
                  >
                    {isDepositing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Depositing...
                      </span>
                    ) : (
                      'Confirm Deposit'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Withdraw Modal */}
        <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md" />
            <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] sm:max-w-[500px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-0 rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-surface/95 via-surface/90 to-base/95 border-2 border-warning/20 shadow-2xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border-b border-border/50 bg-gradient-to-r from-warning/5 via-transparent to-primary/5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning/20 to-primary/20 flex items-center justify-center">
                    <ArrowUpCircle className="w-5 h-5 text-warning" />
                  </div>
                  <DialogTitle className="text-2xl font-bold text-text-primary">
                    Withdraw vUSD
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-text-tertiary ml-13">
                  Withdraw your vUSD from the Stability Pool
                </DialogDescription>
              </motion.div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                      Withdrawal Amount
                    </span>
                    <span className="text-xs text-text-tertiary">
                      Deposited:{' '}
                      <span className="font-semibold text-text-secondary">
                        {formatNumber(userDepositAmount, 2)} vUSD
                      </span>
                    </span>
                  </div>

                  <AmountInput
                    value={withdrawAmount}
                    onChange={setWithdrawAmount}
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
                      onClick={() => setWithdrawAmount((userDepositAmount * 0.25).toFixed(2))}
                      className="text-xs"
                    >
                      25%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setWithdrawAmount((userDepositAmount * 0.5).toFixed(2))}
                      className="text-xs"
                    >
                      50%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setWithdrawAmount((userDepositAmount * 0.75).toFixed(2))}
                      className="text-xs"
                    >
                      75%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setWithdrawAmount(userDepositAmount.toFixed(2))}
                      className="text-xs font-bold"
                    >
                      MAX
                    </Button>
                  </div>

                  {withdrawAmount && parseFloat(withdrawAmount) > userDepositAmount && (
                    <div className="p-3 bg-error/10 rounded-xl border border-error/30">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-error" />
                        <span className="text-xs font-bold text-error">
                          Amount exceeds your deposit
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawAmount('');
                    }}
                    disabled={isWithdrawing}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawValid}
                    className="shadow-lg shadow-warning/20 bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70"
                  >
                    {isWithdrawing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Withdrawing...
                      </span>
                    ) : (
                      'Confirm Withdrawal'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    </AppLayout>
  );
}
