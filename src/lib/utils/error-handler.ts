// Global error handler for wallet connection errors
if (typeof window !== 'undefined') {
  const originalError = window.console.error;

  window.console.error = (...args: unknown[]) => {
    const message = String(args[0]);
    const errorName = args[0] instanceof Error ? args[0].name : '';

    // Suppress wallet connection errors (user cancelled or rejected)
    if (
      message.includes('Failed to connect to the wallet') ||
      message.includes('Failed to connect') ||
      message.includes('Connection rejected') ||
      message.includes('WalletConnectionError') ||
      message.includes('WalletNotSelectedError') ||
      message.includes("origins don't match") ||
      errorName === 'WalletConnectionError' ||
      errorName === 'WalletNotSelectedError' ||
      (args[0] instanceof Error && args[0].message?.includes('Failed to connect'))
    ) {
      // Silently ignore connection errors (user cancelled)
      return;
    }

    originalError(...args);
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);
    const errorName = event.reason?.name || '';

    if (
      message.includes('Failed to connect to the wallet') ||
      message.includes('Failed to connect') ||
      message.includes('Connection rejected') ||
      message.includes('WalletConnectionError') ||
      message.includes('WalletNotSelectedError') ||
      errorName === 'WalletConnectionError' ||
      errorName === 'WalletNotSelectedError'
    ) {
      // Prevent default error reporting for connection errors
      event.preventDefault();
      return;
    }
  });
}

export {};
