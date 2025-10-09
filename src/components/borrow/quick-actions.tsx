'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, TrendingUp, FileText } from 'lucide-react';

const ACTIONS = [
  { label: 'My Positions', icon: History, href: '/positions' },
  { label: 'Markets', icon: TrendingUp, href: '/markets' },
  { label: 'Docs', icon: FileText, href: '/docs', external: true },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        Quick Actions
      </h2>
      <Card className="p-2">
        <div className="space-y-1">
          {ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="ghost"
                fullWidth
                className="justify-start h-10 text-sm font-medium"
              >
                <Icon className="w-4 h-4 mr-3 text-text-tertiary" />
                <span className="text-text-primary">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
