'use client';

import { FC, ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { projectId, metadata, solanaWeb3JsAdapter, networks, features } from '@/config/reown';

// Suppress Reown config warnings
const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = String(args[0]);
  if (message.includes('[Reown Config]') || message.includes('Failed to fetch remote project configuration')) {
    return;
  }
  originalConsoleWarn(...args);
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
    enableAnalytics: false, // Disable analytics to avoid 403 errors
  });
} catch (error) {
  // Silently handle initialization errors
  if (process.env.NODE_ENV === 'development') {
    console.log('Reown AppKit initialization skipped (invalid project ID)');
  }
}

interface ReownProviderProps {
  children: ReactNode;
}

export const ReownProvider: FC<ReownProviderProps> = ({ children }) => {
  return <>{children}</>;
};
