'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaBalance } from '@/hooks';
import { formatNumber } from '@/lib/utils/formatters';
import { ChevronDown, Check, Copy, LogOut, Wallet } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { WalletModal } from '@/components/common/wallet-modal';

export function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const { balance } = useSolanaBalance();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted) {
    return (
      <button className="px-4 py-2 bg-surface rounded-[12px] border border-border text-sm font-medium text-text-primary">
        Loading...
      </button>
    );
  }

  if (!connected) {
    return (
      <>
        <button
          className="px-4 py-2 bg-primary hover:bg-primary-hover transition-colors rounded-[12px] text-sm font-bold text-text-primary flex items-center gap-2"
          onClick={() => setIsWalletModalOpen(true)}
        >
          <Wallet className="w-4 h-4" />
          Select Wallet
        </button>
        <WalletModal open={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      </>
    );
  }

  const address = publicKey?.toString() || '';
  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      {balance !== null && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border">
          <span className="text-sm font-semibold text-text-primary">
            {formatNumber(balance, 2)} SOL
          </span>
        </div>
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border hover:bg-elevated transition-all hover:border-border/80">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-text-primary">{shortAddress}</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[240px] bg-surface/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-2xl z-50 mt-2 animate-in fade-in slide-in-from-top-2 duration-200"
            align="end"
            sideOffset={8}
          >
            {/* Wallet Address Section */}
            <div className="px-2.5 py-2.5 mb-2.5 rounded-lg bg-elevated/50 border border-border/30">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold mb-1.5">Wallet Address</div>
              <div className="text-[11px] font-mono text-text-primary break-all leading-relaxed">
                {address}
              </div>
            </div>

            {/* Copy Address */}
            <DropdownMenu.Item
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-elevated cursor-pointer outline-none transition-all mb-1"
              onSelect={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-sm text-success font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-primary font-medium">Copy Address</span>
                </>
              )}
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-border/50 my-2" />

            {/* Disconnect */}
            <DropdownMenu.Item
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-error/10 cursor-pointer outline-none transition-all text-error group"
              onSelect={disconnect}
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Disconnect</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
