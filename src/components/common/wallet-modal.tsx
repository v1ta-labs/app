'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { useAppKit } from '@reown/appkit/react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalSection } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronDown, Zap, Wallet, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletModal({ open, onClose }: WalletModalProps) {
  const { wallets, select, connected } = useWallet();
  const { open: openReownModal } = useAppKit();
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const installedWallets = wallets.filter(
    w => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable
  );

  const otherWallets = wallets.filter(
    w => w.readyState !== WalletReadyState.Installed && w.readyState !== WalletReadyState.Loadable
  );

  const handleWalletClick = async (walletName: WalletName) => {
    try {
      setConnecting(true);
      // Select and connect in one go
      select(walletName);
      // The wallet adapter will automatically connect after selection
      // Just close the modal - the connection happens via the adapter
      setTimeout(() => {
        onClose();
        setConnecting(false);
      }, 500);
    } catch (error) {
      console.debug('Wallet connection error:', error);
      setConnecting(false);
    }
  };

  const handleReownClick = () => {
    try {
      openReownModal();
      onClose();
    } catch (error) {
      console.debug('Reown connection error:', error);
    }
  };

  if (connected) {
    return null;
  }

  return (
    <Modal open={open} onOpenChange={onClose} size="md">
      <ModalHeader>
        <ModalTitle>Connect Wallet</ModalTitle>
        <ModalDescription>Choose your wallet to get started with v1ta</ModalDescription>
      </ModalHeader>

      <ModalBody className="space-y-3 max-h-[60vh] overflow-y-auto">
        {/* Installed Wallets */}
        {installedWallets.length > 0 && (
          <div className="space-y-2">
            {installedWallets.map(wallet => (
              <button
                key={wallet.adapter.name}
                onClick={() => handleWalletClick(wallet.adapter.name as WalletName)}
                disabled={connecting}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all group',
                  'hover:border-primary hover:bg-primary/5 hover:scale-[1.02]',
                  'border-border/50 bg-elevated/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
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
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-success/10 text-success rounded uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      Installed
                    </span>
                  </div>
                </div>
                {connecting ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Social Login & WalletConnect */}
        <button
          onClick={handleReownClick}
          className={cn(
            'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all group',
            'hover:border-primary hover:bg-primary/5 hover:scale-[1.02]',
            'border-border/50 bg-elevated/50'
          )}
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-border/30 group-hover:border-primary/50 transition-all">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <span className="font-semibold text-text-primary text-sm block">
              Social & WalletConnect
            </span>
            <div className="text-[11px] text-text-tertiary mt-0.5">
              Google, Email, X + 600 wallets
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors" />
        </button>

        {/* More Options */}
        {installedWallets.length > 0 && otherWallets.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-elevated/50 text-xs font-medium text-text-secondary hover:text-text-primary transition-all"
            >
              <span>More wallet options</span>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200',
                  showMoreOptions ? 'rotate-180' : ''
                )}
              />
            </button>

            {showMoreOptions && (
              <div className="space-y-1.5 mt-2">
                {otherWallets.map(wallet => (
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
                    <span className="flex-1 text-left font-medium text-text-primary text-xs">
                      {wallet.adapter.name}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-text-tertiary group-hover:text-primary transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Wallets Detected */}
        {installedWallets.length === 0 && (
          <ModalSection bordered className="py-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-elevated border border-border/50 flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-7 h-7 text-text-tertiary" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1.5">
              No wallets detected
            </h3>
            <p className="text-xs text-text-tertiary mb-4">
              Install a Solana wallet to connect
            </p>
            <div className="space-y-2 max-w-xs mx-auto">
              <Button
                href="https://phantom.app/"
                target="_blank"
                variant="outline"
                size="sm"
                fullWidth
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Install Phantom
              </Button>
              <Button
                href="https://solflare.com/"
                target="_blank"
                variant="outline"
                size="sm"
                fullWidth
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Install Solflare
              </Button>
            </div>
          </ModalSection>
        )}
      </ModalBody>

      <ModalSection bordered className="text-center py-4">
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          By connecting, you agree to v1ta&apos;s{' '}
          <a href="/terms" className="text-primary hover:underline font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:underline font-medium">
            Privacy Policy
          </a>
        </p>
      </ModalSection>
    </Modal>
  );
}
