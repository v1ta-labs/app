// Global error handler for Reown wallet connection errors
if (typeof window !== 'undefined') {
  const originalError = window.console.error;

  window.console.error = (...args: unknown[]) => {
    const message = String(args[0]);

    // Suppress Reown connection errors
    if (
      message.includes('Failed to connect to the wallet') ||
      message.includes('Failed to connect') ||
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

    if (
      message.includes('Failed to connect to the wallet') ||
      message.includes('Failed to connect')
    ) {
      // Prevent default error reporting for connection errors
      event.preventDefault();
      return;
    }
  });
}

export {};
