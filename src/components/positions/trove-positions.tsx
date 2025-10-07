'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatUSD, formatPercentage } from '@/lib/utils/formatters';

const MOCK_TROVES = [
  {
    id: '1',
    collateral: 25000,
    collateralToken: 'SOL',
    debt: 15000,
    healthFactor: 166.7,
    liquidationPrice: 89.99,
    status: 'healthy' as const,
  },
  {
    id: '2',
    collateral: 8500,
    collateralToken: 'mSOL',
    debt: 6000,
    healthFactor: 141.7,
    liquidationPrice: 105.88,
    status: 'healthy' as const,
  },
];

export function TrovePositions() {
  if (MOCK_TROVES.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-text-secondary">No active Trove positions</p>
          <Button href="/">Open Your First Trove</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {MOCK_TROVES.map((trove) => (
        <Card key={trove.id} className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-text-primary">
                  {trove.collateralToken} Trove
                </h3>
                <Badge
                  variant={
                    trove.healthFactor > 150
                      ? 'success'
                      : trove.healthFactor > 120
                      ? 'warning'
                      : 'error'
                  }
                >
                  {trove.status}
                </Badge>
              </div>
              <p className="text-sm text-text-tertiary mt-1">ID: {trove.id}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Adjust
              </Button>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-text-secondary mb-1">Collateral</p>
              <p className="text-lg font-semibold text-text-primary">
                {formatUSD(trove.collateral)}
              </p>
              <p className="text-xs text-text-tertiary">{trove.collateralToken}</p>
            </div>

            <div>
              <p className="text-sm text-text-secondary mb-1">Debt</p>
              <p className="text-lg font-semibold text-text-primary">
                {formatUSD(trove.debt)}
              </p>
              <p className="text-xs text-text-tertiary">VUSD</p>
            </div>

            <div>
              <p className="text-sm text-text-secondary mb-1">Health Factor</p>
              <p
                className={`text-lg font-semibold ${
                  trove.healthFactor > 150
                    ? 'text-success'
                    : trove.healthFactor > 120
                    ? 'text-warning'
                    : 'text-error'
                }`}
              >
                {formatPercentage(trove.healthFactor)}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-secondary mb-1">Liquidation Price</p>
              <p className="text-lg font-semibold text-text-primary">
                ${trove.liquidationPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
