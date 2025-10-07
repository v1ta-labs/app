'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatUSD, formatNumber, formatPercentage } from '@/lib/utils/formatters';

interface Position {
  id: string;
  collateral: string;
  amount: number;
  value: number;
  borrowed: number;
  health: number;
}

const MOCK_POSITIONS: Position[] = [
  {
    id: '1',
    collateral: 'SOL',
    amount: 45.2,
    value: 7142.50,
    borrowed: 4200,
    health: 170,
  },
  {
    id: '2',
    collateral: 'JitoSOL',
    amount: 38.5,
    value: 5704.83,
    borrowed: 3220,
    health: 177,
  },
];

export function PositionsTable() {
  if (MOCK_POSITIONS.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Active Positions
          </h3>
          <p className="text-sm text-text-tertiary mb-4">
            Deposit collateral to start borrowing VUSD
          </p>
        </div>
      </Card>
    );
  }

  const getHealthBadgeVariant = (health: number) => {
    if (health >= 130) return 'success';
    if (health >= 110) return 'warning';
    return 'error';
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Collateral
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Borrowed
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">
                Health
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_POSITIONS.map((position) => (
              <tr
                key={position.id}
                className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {position.collateral.slice(0, 1)}
                      </span>
                    </div>
                    <span className="font-medium text-text-primary">
                      {position.collateral}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-text-primary font-medium">
                    {formatNumber(position.amount, 1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-text-primary font-medium">
                    {formatUSD(position.value)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-text-primary font-medium">
                      {position.borrowed.toLocaleString()} VUSD
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {formatUSD(position.borrowed)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <Badge variant={getHealthBadgeVariant(position.health)}>
                      {formatPercentage(position.health)}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                    <Button size="sm" variant="outline">
                      Close
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
