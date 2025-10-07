'use client';

import { Card } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Zap, AlertTriangle } from 'lucide-react';

const ACTIVITIES = [
  {
    type: 'borrow',
    user: 'GjkL...x7Qm',
    amount: '5,000 VUSD',
    collateral: '32.5 SOL',
    time: new Date(Date.now() - 1000 * 60 * 2), // 2 min ago
    txHash: 'Fd8s...pL2k'
  },
  {
    type: 'repay',
    user: '8yHn...vM9p',
    amount: '12,300 VUSD',
    collateral: '78.2 SOL',
    time: new Date(Date.now() - 1000 * 60 * 8), // 8 min ago
    txHash: 'Ka9m...xT4r'
  },
  {
    type: 'liquidation',
    user: 'Bx3K...nR5w',
    amount: '8,900 VUSD',
    collateral: '56.4 jitoSOL',
    time: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    txHash: 'Qw7p...jY8s'
  },
  {
    type: 'borrow',
    user: 'Pz2L...dF6k',
    amount: '22,500 VUSD',
    collateral: '142.8 mSOL',
    time: new Date(Date.now() - 1000 * 60 * 28), // 28 min ago
    txHash: 'Nh4v...cB3m'
  },
  {
    type: 'repay',
    user: 'Vy5M...sW1q',
    amount: '3,200 VUSD',
    collateral: '20.5 SOL',
    time: new Date(Date.now() - 1000 * 60 * 42), // 42 min ago
    txHash: 'Lp9x...tK7n'
  },
  {
    type: 'borrow',
    user: 'Ju8T...hP2c',
    amount: '18,750 VUSD',
    collateral: '119.3 bSOL',
    time: new Date(Date.now() - 1000 * 60 * 58), // 58 min ago
    txHash: 'Ew6r...mV5g'
  },
];

export function ActivityFeed() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Live Activity</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-[10px]">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-bold text-success uppercase tracking-wide">Live</span>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-border max-h-[calc(100vh-280px)] overflow-y-auto">
          {ACTIVITIES.map((activity, idx) => {
            const getIcon = () => {
              switch (activity.type) {
                case 'borrow':
                  return <ArrowUpRight className="w-4 h-4 text-primary" />;
                case 'repay':
                  return <ArrowDownLeft className="w-4 h-4 text-success" />;
                case 'liquidation':
                  return <AlertTriangle className="w-4 h-4 text-warning" />;
                default:
                  return <Zap className="w-4 h-4 text-text-tertiary" />;
              }
            };

            const getLabel = () => {
              switch (activity.type) {
                case 'borrow':
                  return 'Borrowed';
                case 'repay':
                  return 'Repaid';
                case 'liquidation':
                  return 'Liquidated';
                default:
                  return 'Activity';
              }
            };

            return (
              <div key={idx} className="px-6 py-5 hover:bg-elevated transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-surface rounded-[14px] shrink-0">
                    {getIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">
                        {getLabel()}
                      </span>
                      <span className="text-[10px] text-text-tertiary uppercase tracking-wide shrink-0">
                        {formatRelativeTime(activity.time)}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-text-primary mb-2.5">
                      {activity.amount}
                    </div>
                    {activity.collateral && (
                      <div className="text-sm text-text-secondary font-semibold mb-2">
                        {activity.collateral}
                      </div>
                    )}
                    <div className="text-[10px] text-text-tertiary font-mono truncate">
                      {activity.user}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
