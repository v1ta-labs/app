'use client';

import { useEffect } from 'react';

/**
 * Service Worker Provider
 * Registers the service worker for push notifications
 * Required for Dialect push notifications to work
 */
export function ServiceWorkerProvider() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
