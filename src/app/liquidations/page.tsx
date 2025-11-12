'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import {
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Flame,
  Shield,
  Loader2,
  Target,
  CheckCircle2,
  Coins,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useVitaClient, useSolPrice } from '@/hooks';
import { useAppKitAccount } from '@reown/appkit/react';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PROTOCOL_PARAMS } from '@/lib/vita/constants';

interface AtRiskPosition {
  owner: string;
  collateral: string;
  collateralAmount: number;
  collateralValue: number;
  debt: number;
  healthFactor: number;
  collateralRatio: number;
  liquidationPrice: number;
}

export default function LiquidationsPage() {
  const [selectedCollateral, setSelectedCollateral] = useState<string | null>(null);
  const [atRiskPositions, setAtRiskPositions] = useState<AtRiskPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liquidatingPosition, setLiquidatingPosition] = useState<string | null>(null);
  const [vusdBalance, setVusdBalance] = useState<number>(0);
  const [stabilityPoolVusd, setStabilityPoolVusd] = useState<number>(0);

  const { isConnected, address } = useAppKitAccount();
  const { client: vitaClient } = useVitaClient();
  const { price: solPrice } = useSolPrice();

  // Fetch stability pool vUSD
  const fetchStabilityPoolVusd = useCallback(async () => {
    if (!vitaClient) {
      setStabilityPoolVusd(0);
      return;
    }

    try {
      const stabilityPool = await vitaClient.getStabilityPool();
      if (stabilityPool) {
        const vusdDeposited = stabilityPool.totalVusdDeposited.toNumber() / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS;
        setStabilityPoolVusd(vusdDeposited);
      } else {
        setStabilityPoolVusd(0);
      }
    } catch (error) {
      console.error('Failed to fetch stability pool vUSD:', error);
      setStabilityPoolVusd(0);
    }
  }, [vitaClient]);

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

  // Fetch at-risk positions
  const fetchAtRiskPositions = useCallback(async () => {
    if (!vitaClient || !solPrice) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all positions from the protocol
      const allPositions = await (vitaClient.program.account as any).position.all();

      // Filter for at-risk positions (CR < 120%)
      const atRisk: AtRiskPosition[] = [];

      for (const positionAccount of allPositions) {
        const position = positionAccount.account;

        // Skip inactive positions or positions with no debt
        if (!('active' in position.status) || position.debt.toNumber() === 0) {
          continue;
        }

        const collateralSol = position.collateral.toNumber() / LAMPORTS_PER_SOL;
        const debtVusd = position.debt.toNumber() / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS;
        const collateralValue = collateralSol * solPrice;
        const collateralRatio = (collateralValue / debtVusd) * 100;

        // Position is at risk if CR < 120% (110% is liquidation threshold + 10% buffer)
        if (collateralRatio < 120 && debtVusd > 0) {
          const healthFactor = (collateralRatio / 110) * 100; // % of liquidation threshold
          const liquidationPrice = (debtVusd * 1.1) / collateralSol; // SOL price where CR = 110%

          atRisk.push({
            owner: position.owner.toString(),
            collateral: 'SOL',
            collateralAmount: collateralSol,
            collateralValue,
            debt: debtVusd,
            healthFactor,
            collateralRatio,
            liquidationPrice,
          });
        }
      }

      // Sort by health factor (lowest first - most at risk)
      atRisk.sort((a, b) => a.healthFactor - b.healthFactor);

      setAtRiskPositions(atRisk);
    } catch (error) {
      console.error('Failed to fetch at-risk positions:', error);
      setAtRiskPositions([]);
    } finally {
      setIsLoading(false);
    }
  }, [vitaClient, solPrice]);

  useEffect(() => {
    fetchAtRiskPositions();
    fetchVusdBalance();
    fetchStabilityPoolVusd();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAtRiskPositions();
      fetchVusdBalance();
      fetchStabilityPoolVusd();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAtRiskPositions, fetchVusdBalance, fetchStabilityPoolVusd]);

  // Calculate stats
  const totalAtRisk = atRiskPositions.reduce((sum, p) => sum + p.collateralValue, 0);
  const avgHealthFactor =
    atRiskPositions.length > 0
      ? atRiskPositions.reduce((sum, p) => sum + p.healthFactor, 0) / atRiskPositions.length
      : 0;

  const filteredPositions = selectedCollateral
    ? atRiskPositions.filter(p => p.collateral === selectedCollateral)
    : atRiskPositions;

  // Handle liquidation
  async function handleLiquidate(position: AtRiskPosition) {
    if (!vitaClient || !isConnected || liquidatingPosition) return;

    // Check if stability pool has enough vUSD
    if (stabilityPoolVusd < position.debt) {
      toast.error(
        <div>
          <div className="font-semibold">Insufficient Stability Pool Funds</div>
          <div className="text-xs mt-1">
            Stability pool has {formatNumber(stabilityPoolVusd, 2)} vUSD but needs {formatNumber(position.debt, 2)} vUSD to liquidate this position
          </div>
        </div>,
        { duration: 5000 }
      );
      return;
    }

    // Check if user has enough vUSD to liquidate
    if (vusdBalance < position.debt) {
      toast.error(
        <div>
          <div className="font-semibold">Insufficient vUSD Balance</div>
          <div className="text-xs mt-1">
            You need {formatNumber(position.debt, 2)} vUSD to liquidate this position, but you only have{' '}
            {formatNumber(vusdBalance, 2)} vUSD
          </div>
        </div>,
        { duration: 5000 }
      );
      return;
    }

    const positionKey = position.owner;
    const toastId = toast.loading('Preparing liquidation...');
    setLiquidatingPosition(positionKey);

    try {
      toast.loading('Waiting for wallet approval...', { id: toastId });

      // Call liquidate function with PublicKey
      const ownerPublicKey = new PublicKey(position.owner);
      const signature = await vitaClient.liquidate(ownerPublicKey);

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <div>
            <div className="font-semibold">Position liquidated!</div>
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

      // Refresh positions and balance after liquidation
      setTimeout(() => {
        fetchAtRiskPositions();
        fetchVusdBalance();
        fetchStabilityPoolVusd();
      }, 2000);
    } catch (error) {
      console.error('Liquidation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      toast.error(
        <div>
          <div className="font-semibold">Liquidation failed</div>
          <div className="text-xs mt-1">{errorMessage}</div>
        </div>,
        { id: toastId, duration: 5000 }
      );
    } finally {
      setLiquidatingPosition(null);
    }
  }

  // Wallet connection check
  if (!isConnected) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-8">
          <Card className="p-12 max-w-lg mx-auto text-center backdrop-blur-xl bg-surface/70 border-border/50">
            <Target className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">Connect Your Wallet</h2>
            <p className="text-text-secondary mb-8">
              Connect your Solana wallet to view at-risk positions and participate in liquidations.
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
                <Target className="w-8 h-8 text-primary" />
                Liquidations
              </h1>
              <p className="text-sm text-text-tertiary">
                Monitor at-risk positions and liquidation opportunities
              </p>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Refreshing...
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                At Risk Positions
              </div>
              <div className="text-2xl font-bold text-warning">
                {isLoading ? '-' : atRiskPositions.length}
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {formatUSD(totalAtRisk)} at risk
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5" />
                Avg Health Factor
              </div>
              <div className={`text-2xl font-bold ${avgHealthFactor < 100 ? 'text-error' : avgHealthFactor < 110 ? 'text-warning' : 'text-success'}`}>
                {isLoading ? '-' : avgHealthFactor.toFixed(0)}%
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {avgHealthFactor < 100 ? 'Liquidatable' : 'Below threshold'}
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Liquidation Threshold
              </div>
              <div className="text-2xl font-bold text-text-primary">110%</div>
              <div className="text-xs text-text-tertiary mt-1">Minimum collateral ratio</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Stability Pool vUSD
              </div>
              <div className="text-2xl font-bold text-success">
                {isLoading ? '-' : formatNumber(stabilityPoolVusd, 2)}
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {formatUSD(stabilityPoolVusd)} available for liquidations
              </div>
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
                {isLoading ? (
                  // Loading state
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : filteredPositions.length === 0 ? (
                  // Empty state
                  <Card className="p-12 text-center backdrop-blur-xl bg-surface/70 border-border/50">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-success opacity-50" />
                    <h3 className="text-lg font-bold text-text-primary mb-2">All Positions Healthy!</h3>
                    <p className="text-sm text-text-secondary">
                      No positions are currently at risk of liquidation. All collateral ratios are above 120%.
                    </p>
                  </Card>
                ) : (
                  filteredPositions.map((position, index) => (
                    <motion.div
                      key={position.owner}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className={`p-5 backdrop-blur-xl border ${
                        position.healthFactor < 100
                          ? 'bg-error/5 border-error/30'
                          : 'bg-surface/70 border-warning/30'
                      }`}>
                      <div className="flex items-start gap-4">
                        {/* Warning Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          position.healthFactor < 100
                            ? 'bg-error/20'
                            : 'bg-warning/10'
                        }`}>
                          <AlertTriangle className={`w-6 h-6 ${
                            position.healthFactor < 100 ? 'text-error' : 'text-warning'
                          }`} />
                        </div>

                        {/* Position Info */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Position Owner</div>
                            <div className="text-sm font-mono font-bold text-text-primary">
                              {position.owner.slice(0, 4)}...{position.owner.slice(-4)}
                            </div>
                            <div className="text-xs text-text-tertiary mt-1">
                              {position.collateral} collateral
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Collateral</div>
                            <div className="text-sm font-bold text-text-primary">
                              {formatNumber(position.collateralAmount, 4)} {position.collateral}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {formatUSD(position.collateralValue)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-tertiary mb-1">Debt</div>
                            <div className="text-sm font-bold text-text-primary">
                              {formatNumber(position.debt, 2)} vUSD
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {formatUSD(position.debt)}
                            </div>
                          </div>
                        </div>

                        {/* Health Factor */}
                        <div className="w-48 shrink-0">
                          <div className={`p-3 bg-base rounded-xl border ${
                            position.healthFactor < 100
                              ? 'border-error/30'
                              : 'border-warning/30'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-text-primary">Health</span>
                              <span className={`text-lg font-bold ${
                                position.healthFactor < 100 ? 'text-error' : 'text-warning'
                              }`}>
                                {position.healthFactor.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-2">
                              <div
                                className={`h-full transition-all ${
                                  position.healthFactor < 100 ? 'bg-error' : 'bg-warning'
                                }`}
                                style={{ width: `${Math.min(position.healthFactor, 100)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-tertiary">
                                CR: {position.collateralRatio.toFixed(1)}%
                              </span>
                              <span className="text-success font-semibold">
                                +8% bonus
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Liquidate Button */}
                        <Button
                          size="sm"
                          onClick={() => handleLiquidate(position)}
                          disabled={
                            position.healthFactor >= 100 ||
                            liquidatingPosition === position.owner ||
                            vusdBalance < position.debt ||
                            stabilityPoolVusd < position.debt
                          }
                          className={`gap-2 shrink-0 ${
                            position.healthFactor < 100 && vusdBalance >= position.debt && stabilityPoolVusd >= position.debt
                              ? 'bg-error/20 text-error border border-error/40 hover:bg-error/30'
                              : 'bg-warning/20 text-warning border border-warning/40 hover:bg-warning/30 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {liquidatingPosition === position.owner ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Liquidating...
                            </>
                          ) : stabilityPoolVusd < position.debt ? (
                            <>
                              <Shield className="w-3.5 h-3.5" />
                              Pool: {formatNumber(stabilityPoolVusd, 2)} vUSD
                            </>
                          ) : vusdBalance < position.debt ? (
                            <>
                              <Coins className="w-3.5 h-3.5" />
                              Need {formatNumber(position.debt, 2)} vUSD
                            </>
                          ) : (
                            <>
                              <Flame className="w-3.5 h-3.5" />
                              {position.healthFactor < 100 ? 'Liquidate Now' : 'Not Yet'}
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                  ))
                )}
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

            {/* Liquidation Guide */}
            <div className="space-y-6">
              {/* Estimated Profit */}
              {filteredPositions.length > 0 && !isLoading && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-4">Potential Earnings</h2>
                  <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-success/10 to-primary/5 border-success/30">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <div className="text-xs text-text-tertiary mb-1">Total Liquidation Bonus</div>
                        <div className="text-2xl font-bold text-success">
                          {formatUSD(
                            filteredPositions
                              .filter(p => p.healthFactor < 100)
                              .reduce((sum, p) => sum + p.debt * 0.08, 0)
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-text-secondary">
                      Liquidate {filteredPositions.filter(p => p.healthFactor < 100).length} position
                      {filteredPositions.filter(p => p.healthFactor < 100).length !== 1 ? 's' : ''} to
                      earn an 8% bonus on the debt repaid.
                    </div>
                  </Card>
                </div>
              )}

              {/* How It Works */}
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-4">How Liquidations Work</h2>
                <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-primary/5 to-surface/70 border-border/50">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary mb-1">Monitor Positions</div>
                        <div className="text-sm text-text-secondary">
                          Watch for positions where health factor drops below 100% (CR &lt; 110%)
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary mb-1">Repay Debt</div>
                        <div className="text-sm text-text-secondary">
                          You repay the position's vUSD debt to liquidate it
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-success">3</span>
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary mb-1">Earn Bonus</div>
                        <div className="text-sm text-text-secondary">
                          Receive the collateral plus an 8% liquidation penalty as profit
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-4">Requirements</h2>
                <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-base rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold text-text-primary">
                          Have vUSD to repay debt
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-base rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold text-text-primary">
                          Position CR &lt; 110%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-base rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold text-text-primary">
                          Connected wallet
                        </span>
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
