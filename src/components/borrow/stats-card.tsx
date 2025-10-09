import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  indicator?: 'safe' | 'warning' | 'danger';
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  indicator,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <span className="text-xs text-text-secondary uppercase tracking-wide">{title}</span>
          {change && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-semibold',
                change.isPositive ? 'text-success' : 'text-error'
              )}
            >
              {change.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {change.value}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-text-primary">{value}</span>
          {subtitle && <span className="text-xs text-text-tertiary">{subtitle}</span>}
        </div>

        {indicator && (
          <div className="flex items-center gap-2 pt-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1 h-1 rounded-full',
                    i < (indicator === 'safe' ? 5 : indicator === 'warning' ? 3 : 1)
                      ? indicator === 'safe'
                        ? 'bg-success'
                        : indicator === 'warning'
                          ? 'bg-warning'
                          : 'bg-error'
                      : 'bg-border'
                  )}
                />
              ))}
            </div>
            <span
              className={cn(
                'text-xs font-semibold',
                indicator === 'safe'
                  ? 'text-success'
                  : indicator === 'warning'
                    ? 'text-warning'
                    : 'text-error'
              )}
            >
              {indicator === 'safe' ? 'Safe' : indicator === 'warning' ? 'Caution' : 'Danger'}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
