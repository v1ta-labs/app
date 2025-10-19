'use client';

import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppKitAccount } from '@reown/appkit/react';
import { useVitaClient, usePosition, useSolPrice } from '@/hooks';
import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { formatNumber, formatUSD } from '@/lib/utils/formatters';
import { getPositionPda } from '@/lib/vita/constants';

export default function DebugPage() {
  const { isConnected, address } = useAppKitAccount();
  const { client, isLoading: clientLoading, error: clientError } = useVitaClient();
  const { price: solPrice } = useSolPrice();
  const { position, health, collateralSol, debtVusd, hasPosition, isLoading, error } =
    usePosition(solPrice);
  const [positionPDA, setPositionPDA] = useState<string>('');

  // Calculate position PDA when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      try {
        const publicKey = new PublicKey(address);
        const [pda] = getPositionPda(publicKey);
        setPositionPDA(pda.toBase58());
      } catch (err) {
        console.error('Error calculating PDA:', err);
      }
    }
  }, [isConnected, address]);

  return (
    <AppLayout>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Position Debug Info</h1>
            <p className="text-sm text-text-tertiary">
              Check if your position exists and troubleshoot issues
            </p>
          </div>

          {/* Wallet Status */}
          <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
            <h2 className="text-xl font-bold text-text-primary mb-4">Wallet Connection</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Connected:</span>
                <span className={isConnected ? 'text-success' : 'text-error'}>
                  {isConnected ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              {address && (
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Address:</span>
                  <span className="text-text-primary">{address}</span>
                </div>
              )}
            </div>
          </Card>

          {/* V1TA Client Status */}
          <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
            <h2 className="text-xl font-bold text-text-primary mb-4">V1TA Client</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Loading:</span>
                <span className={clientLoading ? 'text-warning' : 'text-success'}>
                  {clientLoading ? '⏳ Yes' : '✅ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Client Created:</span>
                <span className={client ? 'text-success' : 'text-error'}>
                  {client ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              {clientError && (
                <div className="mt-2 p-3 bg-error/10 rounded text-error text-xs">
                  Error: {clientError.message}
                </div>
              )}
            </div>
          </Card>

          {/* Position PDA */}
          {positionPDA && (
            <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
              <h2 className="text-xl font-bold text-text-primary mb-4">Position PDA</h2>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">PDA Address:</span>
                  <span className="text-text-primary break-all">{positionPDA}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.open(
                      `https://explorer.solana.com/address/${positionPDA}?cluster=devnet`,
                      '_blank'
                    );
                  }}
                  className="w-full mt-2"
                >
                  View on Solana Explorer
                </Button>
              </div>
            </Card>
          )}

          {/* Position Fetch Status */}
          <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
            <h2 className="text-xl font-bold text-text-primary mb-4">Position Data</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Loading:</span>
                <span className={isLoading ? 'text-warning' : 'text-success'}>
                  {isLoading ? '⏳ Yes' : '✅ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Position Exists:</span>
                <span className={hasPosition ? 'text-success' : 'text-error'}>
                  {hasPosition ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              {error && (
                <div className="mt-2 p-3 bg-error/10 rounded text-error text-xs">
                  Error: {error.message}
                </div>
              )}
            </div>

            {hasPosition && position && (
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="font-bold text-text-primary mb-2">Position Details:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Collateral:</span>
                    <span className="text-text-primary">
                      {formatNumber(collateralSol, 4)} SOL ({formatUSD(health?.collateralValue || 0)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Debt:</span>
                    <span className="text-text-primary">
                      {formatNumber(debtVusd, 2)} VUSD ({formatUSD(debtVusd)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Collateral Ratio:</span>
                    <span
                      className={
                        (health?.collateralRatio || 0) >= 150
                          ? 'text-success'
                          : (health?.collateralRatio || 0) >= 110
                            ? 'text-warning'
                            : 'text-error'
                      }
                    >
                      {health?.collateralRatio.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Status:</span>
                    <span className="text-text-primary">{health?.status || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Healthy:</span>
                    <span className={health?.isHealthy ? 'text-success' : 'text-error'}>
                      {health?.isHealthy ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* SOL Price */}
          <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
            <h2 className="text-xl font-bold text-text-primary mb-4">SOL Price</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Current Price:</span>
                <span className="text-text-primary">{formatUSD(solPrice)}</span>
              </div>
            </div>
          </Card>

          {/* Raw Position Object */}
          {position && (
            <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
              <h2 className="text-xl font-bold text-text-primary mb-4">Raw Position Object</h2>
              <pre className="text-xs bg-base p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(
                  {
                    owner: position.owner.toBase58(),
                    collateral: position.collateral.toString(),
                    debt: position.debt.toString(),
                    status: position.status,
                  },
                  null,
                  2
                )}
              </pre>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
