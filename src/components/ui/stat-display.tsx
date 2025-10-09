'use client';

import { Card } from './card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StatDisplayProps {
  label: string;
  value: string;
  subtitle?: string;
  change?: string;
  changePositive?: boolean;
}

export function StatDisplay({ label, value, subtitle, change, changePositive }: StatDisplayProps) {
  return (
    <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
      <div className="space-y-1.5">
        <div className="text-[10px] text-text-tertiary uppercase tracking-wide font-bold">
          {label}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-text-primary">{value}</span>
          {subtitle && <span className="text-xs text-text-tertiary font-medium">{subtitle}</span>}
        </div>
        {change && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold',
              changePositive ? 'text-success' : 'text-error'
            )}
          >
            {changePositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
