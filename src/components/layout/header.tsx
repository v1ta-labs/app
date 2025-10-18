'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { SearchBar } from '@/components/ui/search-bar';
import { WalletButton } from '@/components/ui/wallet-button';
import { NotificationModal } from '@/components/common/notification-modal';
import { Logotype } from '@/components/ui/logotype';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Borrow', href: '/', scrollTo: 'borrow-section' },
  { label: 'Positions', href: '/positions' },
  { label: 'Redeem', href: '/redeem' },
  { label: 'Liquidations', href: '/liquidations' },
];

export function Header() {
  const pathname = usePathname();
  const { isConnected } = useAppKitAccount();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: (typeof NAV_ITEMS)[0]) => {
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
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-base/95 backdrop-blur-xl">
        <div className="px-4 sm:px-6">
          <div className="flex h-16 items-center gap-3 sm:gap-8 max-w-[1600px] mx-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Logotype size="sm" showSubheading={false} interactive={false} />
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-1 shrink-0">
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={e => handleNavClick(e, item)}
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

            {/* Search Bar - Centered - Hidden on small mobile */}
            <div className="hidden sm:flex flex-1 max-w-lg mx-auto">
              <SearchBar />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
              {isConnected && (
                <NotificationModal open={notificationOpen} onOpenChange={setNotificationOpen} />
              )}
              <WalletButton />
            </div>
          </div>

          {/* Search Bar - Mobile - Full width below header */}
          <div className="sm:hidden pb-3">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Menu */}
          <nav className="fixed top-16 left-0 right-0 bg-surface border-b border-border z-40 lg:hidden shadow-xl">
            <div className="px-4 py-4 space-y-2">
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={e => {
                      handleNavClick(e, item);
                      setMobileMenuOpen(false);
                    }}
                    className={`block px-4 py-3 rounded-[12px] text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-text-primary border-l-4 border-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
