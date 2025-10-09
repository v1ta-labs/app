'use client';

import { StatsCard } from './stats-card';
import { formatUSD, formatPercentage } from '@/lib/utils/formatters';

interface StatsBarProps {
  collateral: number;
  borrowed: number;
  available: number;
  healthFactor: number;
}

export function StatsBar({ collateral, borrowed, available, healthFactor }: StatsBarProps) {
  const getHealthIndicator = (health: number): 'safe' | 'warning' | 'danger' => {
    if (health >= 130) return 'safe';
    if (health >= 110) return 'warning';
    return 'danger';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatsCard
        title="Collateral"
        value={formatUSD(collateral)}
        change={{ value: '+2.4%', isPositive: true }}
      />

      <StatsCard
        title="Borrowed"
        value={formatUSD(borrowed)}
        subtitle={`${(borrowed / 1000).toFixed(0)}K VUSD`}
      />

      <StatsCard title="Available" value={formatUSD(available)} subtitle="to borrow" />

      <StatsCard
        title="Health Factor"
        value={formatPercentage(healthFactor)}
        indicator={getHealthIndicator(healthFactor)}
      />
    </div>
  );
}
