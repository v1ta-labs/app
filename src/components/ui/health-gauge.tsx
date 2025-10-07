'use client';

import { cn } from '@/lib/utils/cn';

interface HealthGaugeProps {
  value: number;
}

export function HealthGauge({ value }: HealthGaugeProps) {
  const displayValue = Math.min((value / 200) * 100, 100);

  const getColor = () => {
    if (value >= 150) return 'bg-success';
    if (value >= 120) return 'bg-warning';
    return 'bg-error';
  };

  const getLabel = () => {
    if (value >= 150) return 'Healthy';
    if (value >= 120) return 'Moderate';
    return 'At Risk';
  };

  return (
    <div className="space-y-2">
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            getColor()
          )}
          style={{ width: `${displayValue}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={cn(
          'font-semibold',
          value >= 150 ? 'text-success' : value >= 120 ? 'text-warning' : 'text-error'
        )}>
          {getLabel()}
        </span>
        <span className="text-text-tertiary">
          Liquidation at 110%
        </span>
      </div>
    </div>
  );
}
