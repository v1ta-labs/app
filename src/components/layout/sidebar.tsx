'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Wallet,
  Zap,
  TrendingUp,
  BookOpen,
  Settings,
  Pin,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Tooltip } from '@/components/ui/tooltip';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Borrow', href: '/', description: 'Borrow VUSD' },
  { icon: Wallet, label: 'Pool', href: '/pool', description: 'Stability Pool' },
  { icon: Zap, label: 'Redeem', href: '/redeem', description: 'Redeem VUSD' },
  { icon: TrendingUp, label: 'Liquidations', href: '/liquidations', description: 'Liquidations' },
];

const SIDEBAR_FOOTER = [
  { icon: BookOpen, label: 'Docs', href: 'https://docs.v1ta.fi', description: 'Documentation', external: true },
  { icon: Settings, label: 'Settings', href: '/settings', description: 'Preferences' },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const pathname = usePathname();

  const shouldExpand = isExpanded || isPinned;

  return (
    <>
      {/* Backdrop for mobile */}
      {shouldExpand && !isPinned && (
        <div
          className="fixed inset-0 bg-base/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 bottom-0 z-40 bg-surface border-r border-border transition-all duration-300',
          shouldExpand ? 'w-60' : 'w-16'
        )}
        onMouseEnter={() => !isPinned && setIsExpanded(true)}
        onMouseLeave={() => !isPinned && setIsExpanded(false)}
      >
        <div className="h-full flex flex-col py-4">
          {/* Pin Button (only shows when expanded) */}
          {shouldExpand && (
            <div className="px-4 mb-2">
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-button text-sm transition-all',
                  isPinned
                    ? 'bg-primary-muted text-primary'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-elevated'
                )}
              >
                <Pin className={cn('w-4 h-4', isPinned && 'rotate-45')} />
                <span>Pin Sidebar</span>
              </button>
            </div>
          )}

          {/* Main Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const button = (
                <Link
                  href={item.href}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary-muted text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {shouldExpand && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );

              return shouldExpand ? (
                <div key={item.href}>{button}</div>
              ) : (
                <Tooltip key={item.href} content={item.description} side="right">
                  {button}
                </Tooltip>
              );
            })}
          </nav>

          {/* Separator */}
          <div className="px-3 my-2">
            <div className="h-px bg-border" />
          </div>

          {/* Footer Navigation */}
          <nav className="px-3 space-y-1">
            {SIDEBAR_FOOTER.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const button = item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-all',
                    'text-text-secondary hover:text-text-primary hover:bg-elevated'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {shouldExpand && <span className="truncate">{item.label}</span>}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary-muted text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {shouldExpand && <span className="truncate">{item.label}</span>}
                </Link>
              );

              return shouldExpand ? (
                <div key={item.href}>{button}</div>
              ) : (
                <Tooltip key={item.href} content={item.description} side="right">
                  {button}
                </Tooltip>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
