'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ExternalLink, ArrowRight, ChevronDown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppKit } from '@reown/appkit/react';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletModal({ open, onClose }: WalletModalProps) {
  const { wallets, select, connected } = useWallet();
  const { open: openReownModal } = useAppKit();

  const handleWalletClick = async (walletName: WalletName) => {
    select(walletName);
    onClose();
  };

  const handleReownClick = () => {
    openReownModal();
    onClose();
  };

  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const installedWallets = wallets.filter(
    (w) => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable
  );

  const otherWallets = wallets.filter(
    (w) => w.readyState !== WalletReadyState.Installed && w.readyState !== WalletReadyState.Loadable
  );

  if (connected) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-surface/95 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Dialog.Title className="text-xl font-bold text-text-primary mb-0.5">
                  Connect Wallet
                </Dialog.Title>
                <p className="text-xs text-text-tertiary">
                  Choose your wallet to get started
                </p>
              </div>
              <Dialog.Close asChild>
                <button
                  className="p-1.5 hover:bg-elevated rounded-lg transition-all text-text-tertiary hover:text-text-primary"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Wallet List */}
            <div className="space-y-2 mb-4">
              {/* Installed Wallets First */}
              {installedWallets.length > 0 && (
                <>
                  {installedWallets.map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      onClick={() => handleWalletClick(wallet.adapter.name as WalletName)}
                      className={cn(
                        'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all group',
                        'hover:border-primary hover:bg-primary/5 hover:scale-[1.01]',
                        'border-border/50 bg-elevated/50'
                      )}
                    >
                      <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-border/30 group-hover:border-primary/50 transition-all">
                        <img
                          src={wallet.adapter.icon}
                          alt={wallet.adapter.name}
                          className="w-7 h-7"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text-primary text-sm">
                            {wallet.adapter.name}
                          </span>
                          {wallet.readyState === WalletReadyState.Installed && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-success/10 text-success rounded uppercase tracking-wider">
                              Installed
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </>
              )}

              {/* Reown AppKit - Social Login & WalletConnect */}
              <button
                onClick={handleReownClick}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all group',
                  'hover:border-primary hover:bg-primary/5 hover:scale-[1.01]',
                  'border-border/50 bg-elevated/50'
                )}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-border/30 group-hover:border-primary/50 transition-all">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-semibold text-text-primary text-sm">
                    Social Login & WalletConnect
                  </span>
                  <div className="text-[11px] text-text-tertiary mt-0.5">
                    Google, Email, X, Discord + 600+ wallets
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors group-hover:translate-x-1 transition-transform" />
              </button>

              {installedWallets.length > 0 && otherWallets.length > 0 && (
                <>
                  {/* More Options Toggle */}
                  <div className="mt-3">
                    <button
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-elevated/50 text-xs font-medium text-text-secondary hover:text-text-primary transition-all"
                    >
                      <span>More options</span>
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        showMoreOptions ? "rotate-180" : ""
                      )} />
                    </button>

                    {/* Other Wallets */}
                    {showMoreOptions && (
                      <div className="space-y-1.5 mt-2 animate-in slide-in-from-top-2 duration-200">
                        {otherWallets.map((wallet) => (
                          <button
                            key={wallet.adapter.name}
                            onClick={() => handleWalletClick(wallet.adapter.name as WalletName)}
                            className={cn(
                              'w-full flex items-center gap-2.5 p-3 rounded-lg border transition-all group',
                              'hover:border-primary/50 hover:bg-primary/5',
                              'border-border/30 bg-elevated/30'
                            )}
                          >
                            <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center border border-border/30">
                              <img
                                src={wallet.adapter.icon}
                                alt={wallet.adapter.name}
                                className="w-5 h-5"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium text-text-primary text-xs">
                                {wallet.adapter.name}
                              </span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-primary transition-all group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {installedWallets.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-xl bg-elevated border border-border/50 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1.5">No wallets detected</h3>
                  <p className="text-xs text-text-tertiary mb-4">
                    Install a Solana wallet to connect to V1ta Protocol
                  </p>
                  <div className="space-y-2">
                    <a
                      href="https://phantom.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 bg-elevated hover:bg-surface rounded-lg transition-all border border-border/50 hover:border-primary/50 group"
                    >
                      <span className="text-xs font-medium text-text-primary">Install Phantom</span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-tertiary group-hover:text-primary transition-colors" />
                    </a>
                    <a
                      href="https://solflare.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 bg-elevated hover:bg-surface rounded-lg transition-all border border-border/50 hover:border-primary/50 group"
                    >
                      <span className="text-xs font-medium text-text-primary">Install Solflare</span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-tertiary group-hover:text-primary transition-colors" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border/30">
              <p className="text-[10px] text-text-tertiary text-center leading-relaxed">
                By connecting, you agree to V1ta Protocol&apos;s{' '}
                <a href="/terms" className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="/privacy" className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
