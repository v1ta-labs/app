'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, TrendingUp, DollarSign, Shield } from 'lucide-react';
import { usePosition, useSolPrice } from '@/hooks';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';

export default function PortfolioPage() {
  const { isConnected } = useAppKitAccount();
  const { price: solPrice } = useSolPrice();
  const { health, collateralSol, debtVusd, hasPosition, isLoading } = usePosition(solPrice);

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-8">
          <Card className="p-12 max-w-lg mx-auto text-center backdrop-blur-xl bg-surface/70 border-border/50">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Connect Your Wallet</h2>
            <p className="text-text-secondary mb-8">
              Please connect your Solana wallet to view your portfolio overview and manage your
              positions.
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
            <h1 className="text-3xl font-bold text-text-primary mb-2">Portfolio Overview</h1>
            <p className="text-sm text-text-tertiary">
              Track your assets, positions, and performance
            </p>
          </div>

          {isLoading ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-surface/70 border-border/50">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-sm text-text-tertiary">Loading portfolio...</p>
            </Card>
          ) : !hasPosition ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">No Positions Yet</h3>
                <p className="text-text-tertiary mb-6">
                  Start by depositing collateral and borrowing VUSD to see your portfolio grow
                </p>
                <Button
                  onClick={() => {
                    window.location.href = '/#borrow-section';
                  }}
                >
                  Start Borrowing
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Portfolio Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-sm text-text-tertiary uppercase tracking-wider font-bold">
                      Total Collateral
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-text-primary mb-1">
                    {formatUSD(health?.collateralValue || 0)}
                  </div>
                  <div className="text-sm text-text-tertiary">
                    {formatNumber(collateralSol, 4)} SOL @ {formatUSD(solPrice)}
                  </div>
                </Card>

                <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-warning" />
                    </div>
                    <div className="text-sm text-text-tertiary uppercase tracking-wider font-bold">
                      Total Debt
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-text-primary mb-1">
                    {formatUSD(debtVusd)}
                  </div>
                  <div className="text-sm text-text-tertiary">
                    {formatNumber(debtVusd, 2)} VUSD borrowed
                  </div>
                </Card>

                <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-success" />
                    </div>
                    <div className="text-sm text-text-tertiary uppercase tracking-wider font-bold">
                      Health Factor
                    </div>
                  </div>
                  <div
                    className={`text-3xl font-bold mb-1 ${
                      (health?.collateralRatio || 0) >= 150
                        ? 'text-success'
                        : (health?.collateralRatio || 0) >= 110
                          ? 'text-warning'
                          : 'text-error'
                    }`}
                  >
                    {health?.collateralRatio.toFixed(0) || 0}%
                  </div>
                  <div className="text-sm text-text-tertiary">{health?.status || 'Unknown'}</div>
                </Card>
              </div>

              {/* Position Details */}
              <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
                <h2 className="text-xl font-bold text-text-primary mb-4">Position Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-text-tertiary mb-2">Collateral Breakdown</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-base rounded-lg">
                        <span className="text-text-primary">SOL Collateral</span>
                        <span className="font-bold text-text-primary">
                          {formatNumber(collateralSol, 4)} SOL
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-base rounded-lg">
                        <span className="text-text-primary">USD Value</span>
                        <span className="font-bold text-text-primary">
                          {formatUSD(health?.collateralValue || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text-tertiary mb-2">Debt Breakdown</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-base rounded-lg">
                        <span className="text-text-primary">vUSD Borrowed</span>
                        <span className="font-bold text-text-primary">
                          {formatNumber(debtVusd, 2)} VUSD
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-base rounded-lg">
                        <span className="text-text-primary">Interest Rate</span>
                        <span className="font-bold text-success">0% APR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-primary/10 to-success/10 border-primary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-1">
                      Manage Your Position
                    </h3>
                    <p className="text-sm text-text-tertiary">
                      Add collateral, borrow more, or close your position
                    </p>
                  </div>
                  <Button onClick={() => (window.location.href = '/#borrow-section')}>
                    Manage Position
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
