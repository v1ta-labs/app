'use client';

import { ReactNode } from 'react';
import { Header } from './header';
import { NavigationSidebar } from './navigation-sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-base">
      <Header />
      <NavigationSidebar />
      <main className="pl-20">{children}</main>
    </div>
  );
}
