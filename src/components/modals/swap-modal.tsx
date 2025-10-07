'use client';

import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface SwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JupiterTerminal {
  init: (config: Record<string, unknown>) => void;
  close: () => void;
  resume: () => void;
  syncProps?: (props: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    Jupiter?: JupiterTerminal;
  }
}

export function SwapModal({ open, onOpenChange }: SwapModalProps) {
  const wallet = useWallet();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || scriptLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://terminal.jup.ag/main-v4.js';
    script.async = true;
    script.onload = () => {
      console.log('Jupiter Terminal script loaded');
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Jupiter Terminal script');
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [scriptLoaded]);

  useEffect(() => {
    if (!open || !scriptLoaded || !window.Jupiter || !wallet.publicKey) {
      return;
    }

    if (initializedRef.current) {
      try {
        window.Jupiter.close();
        initializedRef.current = false;
      } catch (e) {
        console.log('Error closing previous instance:', e);
      }
    }

    try {
      console.log('Initializing Jupiter Terminal');

      window.Jupiter.init({
        displayMode: 'integrated',
        integratedTargetId: 'jupiter-terminal-container',
        endpoint: 'https://api.mainnet-beta.solana.com',
        enableWalletPassthrough: true,
        containerStyles: {
          maxHeight: '70vh',
          borderRadius: '16px',
        },
        containerClassName: 'jupiter-terminal-wrapper',
        formProps: {
          swapMode: 'ExactIn',
        },
        defaultExplorer: 'Solscan',
        strictTokenList: false,
      });

      if (window.Jupiter.syncProps) {
        window.Jupiter.syncProps({
          passthroughWalletContextState: wallet
        });
      }

      initializedRef.current = true;
    } catch (error) {
      console.error('Error initializing Jupiter Terminal:', error);
    }

    return () => {
      if (window.Jupiter && initializedRef.current) {
        try {
          window.Jupiter.close();
          initializedRef.current = false;
        } catch (error) {
          console.error('Error closing Jupiter Terminal:', error);
        }
      }
    };
  }, [open, scriptLoaded, wallet, wallet.connected, wallet.publicKey]);

  useEffect(() => {
    if (!open || !scriptLoaded || !window.Jupiter || !initializedRef.current) {
      return;
    }

    if (window.Jupiter.syncProps) {
      window.Jupiter.syncProps({
        passthroughWalletContextState: wallet
      });
    }
  }, [open, scriptLoaded, wallet.connected, wallet.publicKey, wallet]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="bg-base border border-border rounded-[24px] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
              <div>
                <Dialog.Title className="text-xl font-bold text-text-primary">Swap Tokens</Dialog.Title>
                <Dialog.Description className="text-xs text-text-tertiary mt-0.5">Powered by Jupiter</Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-elevated rounded-[12px] transition-colors text-text-secondary hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-6">
              {!wallet.connected ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-3xl">🔌</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">Connect Your Wallet</h3>
                  <p className="text-sm text-text-tertiary max-w-sm">
                    Please connect your Solana wallet to start swapping tokens on Jupiter
                  </p>
                </div>
              ) : !scriptLoaded ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4" />
                  <p className="text-sm text-text-secondary">Loading Jupiter Terminal...</p>
                </div>
              ) : (
                <div
                  id="jupiter-terminal-container"
                  ref={terminalRef}
                  className="jupiter-terminal-wrapper"
                />
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <style jsx global>{`
        .jupiter-terminal-wrapper {
          width: 100%;
        }

        #jupiter-terminal-container {
          --background: #0A1824;
          --surface: #0F2A38;
          --elevated: #1D3C43;
          --border: #2A4930;
          --primary: #2A4930;
          --primary-hover: #3A5940;
          --text-primary: #C8D3D5;
          --text-secondary: #8A9A9D;
          --text-tertiary: #5A6A6D;
          --success: #4ade80;
          --warning: #fbbf24;
          --error: #f87171;
        }

        #jupiter-terminal-container * {
          font-family: var(--font-geist-sans), system-ui, -apple-system, sans-serif;
        }

        #jupiter-terminal-container [class*='bg-'] {
          background-color: var(--surface) !important;
        }

        #jupiter-terminal-container button {
          border-radius: 12px !important;
          font-weight: 600 !important;
        }

        #jupiter-terminal-container input {
          background-color: var(--elevated) !important;
          border: 1px solid var(--border) !important;
          border-radius: 12px !important;
          color: var(--text-primary) !important;
        }

        #jupiter-terminal-container [class*='border'] {
          border-color: var(--border) !important;
        }
      `}</style>
    </Dialog.Root>
  );
}
