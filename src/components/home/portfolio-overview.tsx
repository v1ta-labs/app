'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatUSD } from '@/lib/utils/formatters';

export function PortfolioOverview() {
  return (
    <div className="py-20 px-8 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Your Portfolio</h2>
        <p className="text-text-tertiary">Track your assets and liabilities at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-text-tertiary mb-2">Portfolio Value</div>
              <div className="text-4xl font-bold">{formatUSD(45234.87)}</div>
            </div>
            <div className="flex items-center gap-2 text-success text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>+12.4%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface rounded-xl">
              <div className="text-xs text-text-tertiary uppercase tracking-wide font-bold mb-2">
                Total Assets
              </div>
              <div className="text-2xl font-bold text-success">{formatUSD(52847.33)}</div>
            </div>
            <div className="p-4 bg-surface rounded-xl">
              <div className="text-xs text-text-tertiary uppercase tracking-wide font-bold mb-2">
                Total Liabilities
              </div>
              <div className="text-2xl font-bold text-warning">{formatUSD(8412.46)}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-text-tertiary mb-2">Health Factor</div>
          <div className="text-5xl font-bold mb-4 text-success">2.8</div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success to-primary"
                style={{ width: '85%' }}
              />
            </div>
          </div>
          <div className="text-xs text-text-tertiary mt-3">Safe</div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <div className="text-sm font-bold text-text-secondary uppercase tracking-wide mb-4">
            Top Assets
          </div>
          <div className="space-y-3">
            {[
              { name: 'SOL', amount: 143.5, value: 22724.7, change: 2.4, icon: '◎' },
              { name: 'jitoSOL', amount: 82.3, value: 13373.75, change: 3.1, icon: '🔥' },
              { name: 'mSOL', amount: 65.8, value: 10516.84, change: -0.8, icon: '⚓' },
            ].map(asset => (
              <div key={asset.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{asset.icon}</span>
                  <div>
                    <div className="text-sm font-semibold">{asset.name}</div>
                    <div className="text-xs text-text-tertiary">{asset.amount.toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatUSD(asset.value)}</div>
                  <div
                    className={`text-xs flex items-center justify-end gap-1 ${asset.change > 0 ? 'text-success' : 'text-error'}`}
                  >
                    {asset.change > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(asset.change)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-bold text-text-secondary uppercase tracking-wide mb-4">
            Borrowed
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💵</span>
                <span className="text-sm font-semibold">VUSD</span>
              </div>
              <div className="text-2xl font-bold mb-1">{formatUSD(8412.46)}</div>
              <div className="text-xs text-text-tertiary">0.5% APR</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
