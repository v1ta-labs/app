'use client';

import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatLargeNumber, formatPercentage } from '@/lib/utils/formatters';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const tvlData: { date: string; value: number }[] = [];

const supplyData: { date: string; value: number }[] = [];

const liquidationData: { hour: string; volume: number }[] = [];

export default function AnalyticsPage() {
  const protocolStats = {
    tvl: 0,
    vusdSupply: 0,
    borrowAPY: 0,
    supplyAPY: 0,
    totalLiquidations24h: 0,
    activePositions: 0,
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card padding="md">
          <div className="text-sm text-text-secondary">Total Value Locked</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {formatLargeNumber(protocolStats.tvl)}
          </div>
          <div className="text-xs text-success mt-1">↑ 0% this month</div>
        </Card>

        <Card padding="md">
          <div className="text-sm text-text-secondary">VUSD Supply</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {formatLargeNumber(protocolStats.vusdSupply)}
          </div>
          <div className="text-xs text-success mt-1">↑ 0% this month</div>
        </Card>

        <Card padding="md">
          <div className="text-sm text-text-secondary">Active Positions</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {protocolStats.activePositions.toLocaleString()}
          </div>
          <div className="text-xs text-text-tertiary mt-1">Across all assets</div>
        </Card>

        <Card padding="md">
          <div className="text-sm text-text-secondary">24h Liquidations</div>
          <div className="text-2xl font-bold text-text-primary mt-1">
            {formatLargeNumber(protocolStats.totalLiquidations24h)}
          </div>
          <div className="text-xs text-text-tertiary mt-1">Total volume</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Protocol TVL</CardTitle>
            <p className="text-sm text-text-tertiary">Last 7 days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tvlData}>
                <defs>
                  <linearGradient id="colorTVL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B5FFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6B5FFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" />
                <XAxis dataKey="date" stroke="#FFFFFF66" style={{ fontSize: '12px' }} />
                <YAxis
                  stroke="#FFFFFF66"
                  style={{ fontSize: '12px' }}
                  tickFormatter={value => `$${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A24',
                    border: '1px solid #2A2A38',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                  }}
                  formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, 'TVL']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6B5FFF"
                  strokeWidth={2}
                  fill="url(#colorTVL)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>VUSD Supply</CardTitle>
            <p className="text-sm text-text-tertiary">Last 7 days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={supplyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" />
                <XAxis dataKey="date" stroke="#FFFFFF66" style={{ fontSize: '12px' }} />
                <YAxis
                  stroke="#FFFFFF66"
                  style={{ fontSize: '12px' }}
                  tickFormatter={value => `$${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A24',
                    border: '1px solid #2A2A38',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                  }}
                  formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, 'Supply']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liquidation Volume</CardTitle>
            <p className="text-sm text-text-tertiary">Last 24 hours</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={liquidationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" />
                <XAxis dataKey="hour" stroke="#FFFFFF66" style={{ fontSize: '12px' }} />
                <YAxis
                  stroke="#FFFFFF66"
                  style={{ fontSize: '12px' }}
                  tickFormatter={value => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A24',
                    border: '1px solid #2A2A38',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                  }}
                  formatter={(value: number) => [`$${(value / 1000).toFixed(1)}K`, 'Volume']}
                />
                <Bar dataKey="volume" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interest Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary">Borrow APY</span>
                  <span className="text-2xl font-bold text-text-primary">
                    {formatPercentage(protocolStats.borrowAPY)}
                  </span>
                </div>
                <p className="text-sm text-text-tertiary">
                  V1ta Protocol offers 0% interest borrowing
                </p>
              </div>

              <div className="h-px bg-border" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary">Stability Pool APY</span>
                  <span className="text-2xl font-bold text-success">
                    {formatPercentage(protocolStats.supplyAPY)}
                  </span>
                </div>
                <p className="text-sm text-text-tertiary">
                  Earn rewards by depositing to the Stability Pool
                </p>
              </div>

              <div className="h-px bg-border" />

              <div className="p-4 bg-primary-muted rounded-button">
                <div className="text-sm text-text-secondary mb-2">Protocol Health</div>
                <div className="text-lg font-bold text-primary">Excellent</div>
                <p className="text-xs text-text-tertiary mt-1">
                  All metrics are within healthy ranges
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
