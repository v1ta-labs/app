'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils/formatters';
import { Lock, TrendingUp } from 'lucide-react';

const MOCK_STAKING_POSITION = {
  staked: 12500,
  apy: 18.5,
  pendingRewards: 234.56,
  totalEarned: 1876.43,
  unlockDate: new Date('2025-12-15'),
};

export function StakingPositions() {
  const hasPosition = MOCK_STAKING_POSITION.staked > 0;

  if (!hasPosition) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-text-secondary">No VITA tokens staked</p>
          <Button>Stake VITA</Button>
        </div>
      </Card>
    );
  }

  const daysUntilUnlock = Math.ceil(
    (MOCK_STAKING_POSITION.unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">VITA Staking</h3>
            <p className="text-sm text-text-tertiary mt-1">
              Earn protocol fees and governance rights
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Stake More
            </Button>
            <Button variant="outline" size="sm" disabled={daysUntilUnlock > 0}>
              Unstake
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-sm text-text-secondary mb-1">Staked Amount</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatNumber(MOCK_STAKING_POSITION.staked, 0)}
            </p>
            <p className="text-xs text-text-tertiary mt-1">VITA</p>
          </div>

          <div>
            <p className="text-sm text-text-secondary mb-1">Current APY</p>
            <p className="text-2xl font-bold text-success">{MOCK_STAKING_POSITION.apy}%</p>
          </div>

          <div>
            <p className="text-sm text-text-secondary mb-1">Pending Rewards</p>
            <p className="text-xl font-semibold text-text-primary">
              {MOCK_STAKING_POSITION.pendingRewards.toFixed(2)}
            </p>
            <p className="text-xs text-text-tertiary mt-1">VITA</p>
          </div>

          <div>
            <p className="text-sm text-text-secondary mb-1">Total Earned</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <p className="text-xl font-semibold text-text-primary">
                {MOCK_STAKING_POSITION.totalEarned.toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-text-tertiary mt-1">VITA</p>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface">
                <Lock className="w-5 h-5 text-text-secondary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Unlock Date</p>
                <p className="text-base font-semibold text-text-primary">
                  {MOCK_STAKING_POSITION.unlockDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  <span className="text-sm text-text-tertiary ml-2">({daysUntilUnlock} days)</span>
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
