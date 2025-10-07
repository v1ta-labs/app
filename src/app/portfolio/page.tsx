'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export default function PortfolioPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-8">
          <Card className="p-12 max-w-lg mx-auto text-center backdrop-blur-xl bg-surface/70 border-border/50">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Connect Your Wallet
            </h2>
            <p className="text-text-secondary mb-8">
              Please connect your Solana wallet to view your portfolio overview and manage your positions.
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
            <p className="text-sm text-text-tertiary">Track your assets, positions, and performance</p>
          </div>

          {/* Empty State */}
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
        </div>
      </div>
    </AppLayout>
  );
}
