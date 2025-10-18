'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  History,
  Users,
  Settings,
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SettingsModal } from '@/components/modals/settings-modal';
import { SwapModal } from '@/components/modals/swap-modal';
import { useDisconnect } from '@reown/appkit/react';
import { useUser } from '@/hooks/use-user';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Portfolio', href: '/portfolio', icon: LayoutDashboard },
  { label: 'History', href: '/history', icon: History },
  { label: 'Referrals', href: '/referrals', icon: Users },
];

const BOTTOM_ITEMS = [
  { label: 'Docs', href: 'https://docs.v1ta.fi', icon: BookOpen, external: true },
  { label: 'Support', href: 'https://t.me/v1ta_help', icon: MessageCircle, external: true },
];

export function NavigationSidebar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);

  const { disconnect } = useDisconnect();
  const { user, updateUser } = useUser();

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-20 fixed left-0 top-16 bottom-0 border-r border-border bg-surface/50 backdrop-blur-xl flex-col items-center py-8 z-50">
      {/* Main Navigation */}
      <div className="flex-1 flex flex-col items-center gap-4">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex flex-col items-center gap-1.5 relative transition-all',
                isActive ? 'text-primary' : 'text-text-tertiary hover:text-text-primary'
              )}
            >
              <div
                className={cn(
                  'p-3 rounded-[16px] transition-all',
                  isActive ? 'bg-primary/10' : 'bg-transparent group-hover:bg-elevated'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
              {isActive && (
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Items */}
      <div className="flex flex-col items-center gap-3 pb-4">
        {/* Swap Button */}
        <button
          onClick={() => setSwapOpen(true)}
          className="group flex flex-col items-center gap-1.5 relative transition-all text-text-tertiary hover:text-text-primary"
          title="Swap"
        >
          <div className="p-2.5 rounded-[12px] transition-all bg-transparent group-hover:bg-elevated">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">Swap</span>
        </button>

        <div className="w-8 h-px bg-border my-1" />

        {BOTTOM_ITEMS.map(item => {
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-[12px] transition-all text-text-tertiary hover:text-text-primary hover:bg-elevated"
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </a>
          );
        })}

        {/* Settings Button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2.5 rounded-[12px] transition-all text-text-tertiary hover:text-text-primary hover:bg-elevated"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Modals */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user || undefined}
        onDisconnect={handleDisconnect}
        onUpdate={updateUser}
      />
      <SwapModal open={swapOpen} onOpenChange={setSwapOpen} />
    </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95 backdrop-blur-xl z-50">
        <div className="flex items-center justify-around px-2 py-3 pb-safe">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[60px]',
                  isActive ? 'text-primary bg-primary/10' : 'text-text-tertiary active:bg-elevated'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-semibold uppercase tracking-wide leading-tight">{item.label}</span>
              </Link>
            );
          })}

          {/* Swap Button */}
          <button
            onClick={() => setSwapOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all text-text-tertiary active:bg-elevated min-w-[60px]"
          >
            <ArrowLeftRight className="w-5 h-5" />
            <span className="text-[9px] font-semibold uppercase tracking-wide leading-tight">Swap</span>
          </button>
        </div>
      </div>
    </>
  );
}
