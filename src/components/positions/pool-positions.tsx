'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatUSD } from '@/lib/utils/formatters';
import { TrendingUp } from 'lucide-react';

const MOCK_POOL_POSITION = {
  deposited: 50000,
  share: 2.34,
  pendingRewards: {
    sol: 1.234,
    vita: 567.89,
  },
  totalEarned: {
    sol: 5.678,
    vita: 2345.67,
  },
};

export function PoolPositions() {
  const hasPosition = MOCK_POOL_POSITION.deposited > 0;

  if (!hasPosition) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-text-secondary">No Stability Pool deposits</p>
          <Button href="/pool">Deposit to Stability Pool</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Stability Pool Deposit
            </h3>
            <p className="text-sm text-text-tertiary mt-1">
              Earn liquidation gains and VITA rewards
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" href="/pool">
              Deposit More
            </Button>
            <Button variant="outline" size="sm">
              Withdraw
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-text-secondary mb-1">Your Deposit</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatUSD(MOCK_POOL_POSITION.deposited)}
            </p>
            <p className="text-xs text-text-tertiary mt-1">VUSD</p>
          </div>

          <div>
            <p className="text-sm text-text-secondary mb-1">Pool Share</p>
            <p className="text-2xl font-bold text-primary">
              {MOCK_POOL_POSITION.share}%
            </p>
            <Progress value={MOCK_POOL_POSITION.share} className="mt-2" />
          </div>

          <div>
            <p className="text-sm text-text-secondary mb-1">Total Earned</p>
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">
                  {MOCK_POOL_POSITION.totalEarned.sol.toFixed(3)} SOL
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">
                  {MOCK_POOL_POSITION.totalEarned.vita.toFixed(2)} VITA
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-2">Pending Rewards</p>
              <div className="space-y-1">
                <p className="text-base font-semibold text-text-primary">
                  {MOCK_POOL_POSITION.pendingRewards.sol.toFixed(3)} SOL
                </p>
                <p className="text-base font-semibold text-text-primary">
                  {MOCK_POOL_POSITION.pendingRewards.vita.toFixed(2)} VITA
                </p>
              </div>
            </div>
            <Button>Claim Rewards</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
