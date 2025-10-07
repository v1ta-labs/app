'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { SearchBar } from '@/components/ui/search-bar';
import { WalletButton } from '@/components/ui/wallet-button';
import { Bell, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Borrow', href: '/', scrollTo: 'borrow-section' },
  { label: 'Positions', href: '/positions' },
  { label: 'Redeem', href: '/redeem' },
  { label: 'Liquidations', href: '/liquidations' },
];

export function Header() {
  const pathname = usePathname();
  const { connected } = useWallet();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof NAV_ITEMS[0]) => {
    if (item.scrollTo) {
      e.preventDefault();
      if (pathname === '/') {
        // Already on home page, just scroll
        const element = document.getElementById(item.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to home page with hash
        window.location.href = `/#${item.scrollTo}`;
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-base/95 backdrop-blur-xl">
      <div className="px-6">
        <div className="flex h-16 items-center gap-8 max-w-[1600px] mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-lg font-bold text-primary">V</span>
            </div>
            <span className="text-lg font-semibold">v1ta</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`px-4 py-2 rounded-[12px] text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-surface text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar - Centered */}
          <div className="flex-1 max-w-lg mx-auto">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {connected && (
              <>
                <button className="p-2 hover:bg-surface rounded-[12px] transition-colors">
                  <Bell className="w-5 h-5 text-text-secondary" />
                </button>
                <button className="p-2 hover:bg-surface rounded-[12px] transition-colors">
                  <Settings className="w-5 h-5 text-text-secondary" />
                </button>
              </>
            )}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
