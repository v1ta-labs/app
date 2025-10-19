'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import {
  ArrowDown,
  Info,
  TrendingUp,
  AlertCircle,
  Coins,
  Loader2,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Percent,
  Vault,
} from 'lucide-react';
import { useVitaClient, useSolPrice } from '@/hooks';
import { useAppKitAccount } from '@reown/appkit/react';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';
import { PROTOCOL_PARAMS } from '@/lib/vita/constants';

export default function RedeemPage() {
  const [vusdAmount, setVusdAmount] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [vusdBalance, setVusdBalance] = useState(0);
  const [globalState, setGlobalState] = useState<any>(null);
  const [vaultBalance, setVaultBalance] = useState(0);

  const { isConnected, address } = useAppKitAccount();
  const { client: vitaClient } = useVitaClient();
  const { price: solPrice } = useSolPrice();


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

  // Fetch vault balance
  const fetchVaultBalance = useCallback(async () => {
    if (!vitaClient || !isConnected) {
      setVaultBalance(0);
      return;
    }

    try {
      const connection = vitaClient.provider.connection;
      const vaultPubkey = vitaClient.pdas.protocolVault;
      const balance = await connection.getBalance(vaultPubkey);

      // Account for rent-exempt reserve (PDAs need minimum balance)
      // Typical rent exemption is ~0.00089 SOL, but let's get the exact amount
      const rentExemption = await connection.getMinimumBalanceForRentExemption(0);
      const availableBalance = Math.max(0, balance - rentExemption);

      console.log('Vault total balance:', balance / LAMPORTS_PER_SOL, 'SOL');
      console.log('Rent exemption:', rentExemption / LAMPORTS_PER_SOL, 'SOL');
      console.log('Available balance:', availableBalance / LAMPORTS_PER_SOL, 'SOL');

      setVaultBalance(availableBalance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Failed to fetch vault balance:', error);
      setVaultBalance(0);
    }
  }, [vitaClient, isConnected]);

  // Fetch global state
  const fetchGlobalState = useCallback(async () => {
    if (!vitaClient || !isConnected) {
      return;
    }

    try {
      const state = await vitaClient.getGlobalState();
      setGlobalState(state);
      await Promise.all([fetchVusdBalance(), fetchVaultBalance()]);
    } catch (error) {
      console.error('Failed to fetch global state:', error);
    }
  }, [vitaClient, isConnected, fetchVusdBalance, fetchVaultBalance]);

  useEffect(() => {
    fetchGlobalState();
  }, [fetchGlobalState]);

  // Calculate redemption stats
  const redemptionFeeRate = 0.5; // 0.5%

  const vusdAmountNum = parseFloat(vusdAmount || '0');
  const fee = vusdAmountNum * (redemptionFeeRate / 100);
  const totalToBurn = vusdAmountNum + fee;

  // Estimate SOL to receive (matches on-chain calculation now)
  const estimatedReceiveSol = solPrice > 0 ? vusdAmountNum / solPrice : 0;
  const estimatedReceiveLamports = Math.floor(estimatedReceiveSol * LAMPORTS_PER_SOL);
  const vaultLamports = Math.floor(vaultBalance * LAMPORTS_PER_SOL);

  // Protocol stats
  const totalCollateralSol = globalState
    ? globalState.totalCollateral.toNumber() / LAMPORTS_PER_SOL
    : 0;
  const totalDebtVusd = globalState
    ? globalState.totalDebt.toNumber() / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS
    : 0;
  const totalCollateralValue = totalCollateralSol * solPrice;
  const vaultValue = vaultBalance * solPrice;

  // Validation - use vault balance
  const isValid = useMemo(() => {
    if (!vusdAmount || vusdAmountNum <= 0) return false;
    if (vusdAmountNum > vusdBalance) return false;
    if (totalToBurn > vusdBalance) return false;
    // Check if vault has enough SOL
    if (estimatedReceiveLamports > vaultLamports) return false;
    return true;
  }, [vusdAmount, vusdAmountNum, vusdBalance, totalToBurn, estimatedReceiveLamports, vaultLamports]);

  // Handle redeem
  async function handleRedeem() {
    if (!vitaClient || !vusdAmount || isRedeeming) return;

    // Debug logging
    console.log('=== Redeem Debug ===');
    console.log('vUSD Amount:', vusdAmountNum);
    console.log('SOL Price:', solPrice);
    console.log('Estimated Receive (SOL):', estimatedReceiveSol);
    console.log('Estimated Receive (lamports):', estimatedReceiveLamports);
    console.log('Vault Balance (SOL):', vaultBalance);
    console.log('Vault Balance (lamports):', vaultLamports);
    console.log('Is Valid:', isValid);
    console.log('Can redeem?', estimatedReceiveLamports <= vaultLamports);

    const toastId = toast.loading('Preparing redemption...');

    try {
      setIsRedeeming(true);
      toast.loading('Waiting for wallet approval...', { id: toastId });

      const signature = await vitaClient.redeem(parseFloat(vusdAmount));

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <div>
            <div className="font-semibold">Redeemed successfully!</div>
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

      setVusdAmount('');
      setTimeout(() => fetchGlobalState(), 1000);
    } catch (error) {
      console.error('Redeem failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if transaction might have succeeded despite error
      const isDuplicateError = errorMessage.includes('already been processed');

      toast.error(
        <div>
          <div className="font-semibold">
            Redemption {isDuplicateError ? 'may have succeeded' : 'failed'}
          </div>
          <div className="text-xs mt-1">
            {isDuplicateError
              ? 'Please check your balance - the transaction may have gone through'
              : errorMessage}
          </div>
        </div>,
        { id: toastId, duration: 5000 }
      );

      // Refresh data even on error in case it actually succeeded
      if (isDuplicateError) {
        setVusdAmount('');
        setTimeout(() => fetchGlobalState(), 1000);
      }
    } finally {
      setIsRedeeming(false);
    }
  }

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-8">
          <Card className="p-12 max-w-lg mx-auto text-center backdrop-blur-xl bg-surface/70 border-border/50">
            <Coins className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">Connect Your Wallet</h2>
            <p className="text-text-secondary mb-8">
              Connect your Solana wallet to redeem vUSD for SOL.
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
                <Coins className="w-8 h-8 text-primary" />
                Redeem vUSD
              </h1>
              <p className="text-sm text-text-tertiary">
                Exchange your vUSD for SOL at the current market price
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                Your vUSD Balance
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatNumber(vusdBalance, 2)} vUSD
              </div>
              <div className="text-xs text-text-tertiary mt-1">{formatUSD(vusdBalance)}</div>
            </Card>

            <Card className={`p-4 backdrop-blur-xl border-border/50 ${vaultBalance === 0 ? 'bg-warning/5 border-warning/30' : 'bg-surface/70'}`}>
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <Vault className="w-3.5 h-3.5" />
                Available to Redeem
              </div>
              <div className={`text-2xl font-bold ${vaultBalance === 0 ? 'text-warning' : 'text-text-primary'}`}>
                {formatNumber(vaultBalance, 4)} SOL
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {vaultBalance === 0 ? 'All SOL locked in positions' : formatUSD(vaultValue)}
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <Percent className="w-3.5 h-3.5" />
                Redemption Fee
              </div>
              <div className="text-2xl font-bold text-text-primary">{redemptionFeeRate}%</div>
              <div className="text-xs text-text-tertiary mt-1">Protocol fee</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Total Debt
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatNumber(totalDebtVusd, 2)} vUSD
              </div>
              <div className="text-xs text-success mt-1">{formatUSD(totalDebtVusd)}</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Redeem Interface */}
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-4">Redeem vUSD for SOL</h2>

              <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
                {/* Info Banner */}
                {vaultBalance === 0 ? (
                  <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-xl border border-warning/30 mb-6">
                    <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-text-primary mb-1">
                        No SOL Available for Redemption
                      </div>
                      <div className="text-xs text-text-tertiary">
                        All protocol SOL is currently locked in active positions. Redemptions become
                        available when positions are closed or liquidated.
                      </div>
                      <div className="text-xs text-text-tertiary mt-2">
                        <span className="font-semibold">Total locked:</span>{' '}
                        {formatNumber(totalCollateralSol, 4)} SOL in active positions
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl border border-primary/30 mb-6">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-text-primary mb-1">
                        How Redemption Works
                      </div>
                      <div className="text-xs text-text-tertiary">
                        Redeem your vUSD at face value ($1) for SOL at the current market price. A{' '}
                        {redemptionFeeRate}% redemption fee is burned.
                      </div>
                      {vaultBalance < totalCollateralSol && (
                        <div className="text-xs text-text-tertiary mt-2">
                          <span className="font-semibold">Note:</span>{' '}
                          {formatNumber(totalCollateralSol - vaultBalance, 4)} SOL is locked in active
                          positions and not available for redemption.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* vUSD Input */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                      Amount to Redeem
                    </span>
                    <span className="text-xs text-text-tertiary">
                      Balance:{' '}
                      <span className="font-semibold text-text-secondary">
                        {formatNumber(vusdBalance, 2)} vUSD
                      </span>
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={vusdAmount}
                      onChange={e => setVusdAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={vaultBalance === 0}
                      className="w-full px-4 py-4 pr-32 bg-base border border-border rounded-[16px] text-2xl font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        onClick={() => setVusdAmount((vaultBalance * solPrice).toString())}
                        disabled={vaultBalance === 0}
                        className="px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded-lg text-xs font-bold text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        MAX
                      </button>
                      <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border">
                        <span className="text-lg">💵</span>
                        <span className="text-sm font-semibold text-text-secondary">vUSD</span>
                      </div>
                    </div>
                  </div>

                  {vaultBalance === 0 && (
                    <div className="mt-2 p-3 bg-warning/10 rounded-lg border border-warning/30">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-warning" />
                        <span className="text-xs font-semibold text-warning">
                          Input disabled - No SOL available in vault
                        </span>
                      </div>
                    </div>
                  )}

                  {vusdAmount && vaultBalance > 0 && (
                    <div className="mt-2 text-right">
                      <span className="text-sm text-text-tertiary">
                        Value: {formatUSD(parseFloat(vusdAmount))}
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

                {/* Estimated Receive */}
                {vusdAmount && (
                  <div className="space-y-3 mb-6">
                    <div className="p-4 bg-gradient-to-br from-success/10 to-primary/5 rounded-xl border border-success/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-text-tertiary font-semibold">
                          You will receive
                        </span>
                        <span className="text-xl font-bold text-success">
                          {formatNumber(estimatedReceiveSol, 6)} SOL
                        </span>
                      </div>
                      <div className="text-xs text-text-tertiary">
                        ≈ {formatUSD(estimatedReceiveSol * solPrice)} at current price
                      </div>
                    </div>

                    <div className="p-4 bg-base rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-tertiary">vUSD to redeem</span>
                        <span className="font-semibold text-text-primary">
                          {formatNumber(vusdAmountNum, 2)} vUSD
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-tertiary">Redemption fee ({redemptionFeeRate}%)</span>
                        <span className="font-semibold text-warning">
                          {formatNumber(fee, 2)} vUSD
                        </span>
                      </div>
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="text-text-tertiary font-bold">Total to burn</span>
                        <span className="font-bold text-text-primary">
                          {formatNumber(totalToBurn, 2)} vUSD
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Warnings */}
                {vusdAmount && parseFloat(vusdAmount) > vusdBalance && (
                  <div className="flex items-start gap-3 p-4 bg-error/10 rounded-xl border border-error/30 mb-6">
                    <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                    <div className="text-xs font-semibold text-error">
                      Insufficient vUSD balance
                    </div>
                  </div>
                )}

                {vusdAmount && estimatedReceiveLamports > vaultLamports && (
                  <div className="flex items-start gap-3 p-4 bg-error/10 rounded-xl border border-error/30 mb-6">
                    <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                    <div className="text-xs font-semibold text-error">
                      Insufficient SOL available in vault. Only {formatNumber(vaultBalance, 4)} SOL
                      available (≈ {formatUSD(vaultBalance * solPrice)} worth of vUSD)
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button fullWidth size="lg" disabled={!isValid || isRedeeming || vaultBalance === 0} onClick={handleRedeem}>
                  {isRedeeming ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redeeming...
                    </span>
                  ) : vaultBalance === 0 ? (
                    'No SOL Available - Close Your Position First'
                  ) : !vusdAmount ? (
                    'Enter Amount to Redeem'
                  ) : parseFloat(vusdAmount) > vusdBalance ? (
                    'Insufficient vUSD Balance'
                  ) : estimatedReceiveLamports > vaultLamports ? (
                    `Only ${formatNumber(vaultBalance * solPrice, 2)} vUSD Worth Available`
                  ) : (
                    `Redeem ${formatNumber(vusdAmountNum, 2)} vUSD`
                  )}
                </Button>
              </Card>
            </div>

            {/* Info & Stats */}
            <div className="space-y-6">
              {/* No SOL Available Info */}
              {vaultBalance === 0 && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-4">
                    Why Can't I Redeem?
                  </h2>
                  <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-warning/5 to-surface/70 border-warning/30">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-warning">!</span>
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary mb-1">
                            All SOL is Locked
                          </div>
                          <div className="text-sm text-text-secondary">
                            The {formatNumber(totalCollateralSol, 4)} SOL in the protocol is currently
                            locked in active positions as collateral.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">→</span>
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary mb-1">What You Can Do</div>
                          <div className="text-sm text-text-secondary">
                            1. Close your position to release collateral to the vault
                            <br />
                            2. Wait for other positions to be closed or liquidated
                            <br />
                            3. Use the Stability Pool to earn SOL from liquidations instead
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* How It Works */}
              {vaultBalance > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-4">How It Works</h2>
                  <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-primary/5 to-surface/70 border-border/50">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary mb-1">Burn vUSD</div>
                          <div className="text-sm text-text-secondary">
                            Your vUSD (plus {redemptionFeeRate}% fee) is burned, reducing total supply
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary mb-1">Calculate SOL</div>
                          <div className="text-sm text-text-secondary">
                            System calculates SOL value based on current market price (1 vUSD = $1)
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-success">3</span>
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary mb-1">Receive SOL</div>
                          <div className="text-sm text-text-secondary">
                            SOL is transferred from protocol vault directly to your wallet
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Price Info */}
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-4">Current Pricing</h2>
                <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-base rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">◎</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-primary">SOL Price</div>
                          <div className="text-xs text-text-tertiary">Current market rate</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-text-primary">
                          {formatUSD(solPrice)}
                        </div>
                        <div className="text-xs text-success">Live from Pyth</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-base rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-lg">💵</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-primary">vUSD Value</div>
                          <div className="text-xs text-text-tertiary">Pegged to USD</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-text-primary">$1.00</div>
                        <div className="text-xs text-text-tertiary">Fixed peg</div>
                      </div>
                    </div>
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
