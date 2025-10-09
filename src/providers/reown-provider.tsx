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

// Create the modal only once
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
  });
} catch (error) {
  // Silently handle initialization errors
  if (process.env.NODE_ENV === 'development') {
    console.log('Reown AppKit initialization error:', error);
  }
}

interface ReownProviderProps {
  children: ReactNode;
}

export const ReownProvider: FC<ReownProviderProps> = ({ children }) => {
  return <>{children}</>;
};
