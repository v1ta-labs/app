'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, Lock } from 'lucide-react';

const STATS = [
  { label: 'TVL', value: '$124.5M', change: '+5.2%', positive: true, icon: DollarSign },
  { label: 'Total Borrowed', value: '$89.2M', change: '+3.1%', positive: true, icon: Lock },
  { label: 'Active Users', value: '12,458', change: '+124', positive: true, icon: Users },
];

const COLLATERAL_MARKETS = [
  { token: 'SOL', icon: '◎', apy: '0.5%', tvl: '$45.2M', volume: '$12.3M', utilization: '67%' },
  { token: 'jitoSOL', icon: '🔥', apy: '0.6%', tvl: '$38.1M', volume: '$8.9M', utilization: '72%' },
  { token: 'mSOL', icon: '⚓', apy: '0.55%', tvl: '$31.4M', volume: '$7.2M', utilization: '65%' },
  { token: 'bSOL', icon: '🔆', apy: '0.58%', tvl: '$9.8M', volume: '$2.1M', utilization: '58%' },
];

export function MarketStats() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-5">
          Protocol Stats
        </h2>
        <div className="space-y-4">
          {STATS.map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-primary/10 rounded-[12px]">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-text-primary tracking-tight">
                  {stat.value}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-5">
          Markets
        </h2>
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {COLLATERAL_MARKETS.map(market => (
              <button
                key={market.token}
                className="w-full px-5 py-5 hover:bg-elevated transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{market.icon}</span>
                    <span className="text-sm font-bold text-text-primary">{market.token}</span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-[10px]">
                    {market.apy}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-text-tertiary block mb-1">TVL</span>
                    <div className="text-text-primary font-bold">{market.tvl}</div>
                  </div>
                  <div>
                    <span className="text-text-tertiary block mb-1">24h Vol</span>
                    <div className="text-text-primary font-bold">{market.volume}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: market.utilization }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary font-bold min-w-[32px] text-right">
                    {market.utilization}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
