'use client';

import { FC, ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { projectId, metadata, solanaWeb3JsAdapter, networks, features } from '@/config/reown';

// Suppress Reown config warnings and connection errors
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
console.warn = (...args: unknown[]) => {
  const message = String(args[0]);
  if (
    message.includes('[Reown Config]') ||
    message.includes('Failed to fetch remote project configuration') ||
    message.includes('Failed to connect')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
console.error = (...args: unknown[]) => {
  const message = String(args[0]);
  if (message.includes('Failed to connect to the wallet')) {
    return;
  }
  originalConsoleError(...args);
};

// Create the AppKit instance with custom theming
try {
  createAppKit({
    adapters: [solanaWeb3JsAdapter],
    // @ts-expect-error - Reown network type mismatch
    networks,
    metadata,
    projectId,
    // @ts-expect-error - Reown features type mismatch
    features,
    enableAnalytics: false,
    allWallets: 'SHOW',
    defaultChain: networks[0],
    themeMode: 'dark',
    themeVariables: {
      '--w3m-font-family': 'var(--font-inter), sans-serif',
      '--w3m-accent': '#2a4930',
      '--w3m-color-mix': '#050f05',
      '--w3m-color-mix-strength': 0,
      '--w3m-border-radius-master': '12px',
      '--w3m-z-index': 9999,
    },
  });
} catch (error) {
  // Silently handle initialization errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Reown AppKit initialization error:', error);
  }
}

interface ReownProviderProps {
  children: ReactNode;
}

export const ReownProvider: FC<ReownProviderProps> = ({ children }) => {
  return <>{children}</>;
};
