'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount, useDisconnect, useAppKit } from '@reown/appkit/react';
import { useUser } from '@/hooks/use-user';
import { formatNumber } from '@/lib/utils/formatters';
import { ChevronDown, User as UserIcon, Wallet, Settings, LogOut, Copy, Check } from 'lucide-react';
import { UsernameModal } from '@/components/auth/username-modal';
import { ProfileDropdown } from '@/components/common/profile-dropdown';
import { SettingsModal } from '@/components/modals/settings-modal';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function WalletButton() {
  const { isConnected, address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { open: openReownModal } = useAppKit();
  const { user, loading, needsUsername, socialProfile, createUser, updateUser } = useUser();

  const [mounted, setMounted] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [dismissedUsernameModal, setDismissedUsernameModal] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      setDismissedUsernameModal(false);
      setBalance(null);
    }
  }, [isConnected, address]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) {
        setBalance(null);
        return;
      }
      try {
        // Fetch balance using Solana web3.js with multiple RPC fallbacks
        const { Connection, PublicKey } = await import('@solana/web3.js');
        const endpoints = [
          'https://api.mainnet-beta.solana.com',
          'https://solana-api.projectserum.com',
          'https://rpc.ankr.com/solana',
        ];

        let lastError;
        for (const endpoint of endpoints) {
          try {
            const connection = new Connection(endpoint);
            const publicKey = new PublicKey(address);
            const bal = await connection.getBalance(publicKey);
            setBalance(bal / 1e9); // Convert lamports to SOL
            return; // Success, exit
          } catch (err) {
            lastError = err;
            continue; // Try next endpoint
          }
        }
        throw lastError; // All endpoints failed
      } catch (error) {
        // Silently fail - balance display is not critical
        setBalance(null);
      }
    };

    if (isConnected && address) {
      fetchBalance();
    }
  }, [isConnected, address]);

  const handleDisconnect = () => {
    disconnect();
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) {
    return (
      <button className="px-4 py-2 bg-surface rounded-[12px] border border-border text-sm font-medium text-text-primary">
        Loading...
      </button>
    );
  }

  if (!isConnected) {
    return (
      <button
        className="px-4 py-2 bg-primary hover:bg-primary-hover transition-colors rounded-[12px] text-sm font-bold text-text-primary flex items-center gap-2"
        onClick={() => openReownModal({ view: 'Connect' })}
      >
        <Wallet className="w-4 h-4" />
        Select Wallet
      </button>
    );
  }

  const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '';

  return (
    <>
      <div className="flex items-center gap-2">
        {balance !== null && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border">
            <span className="text-sm font-semibold text-text-primary">
              {formatNumber(balance, 2)} SOL
            </span>
          </div>
        )}

        {loading ? (
          <button className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border">
            <div className="w-2 h-2 rounded-full bg-text-tertiary animate-pulse" />
            <span className="text-sm font-medium text-text-primary">Loading...</span>
          </button>
        ) : user ? (
          <ProfileDropdown
            user={user}
            onSettingsClick={() => setIsSettingsModalOpen(true)}
            onDisconnect={handleDisconnect}
          >
            <button className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border hover:bg-elevated transition-all hover:border-border/80">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-primary" />
                )}
              </div>
              <span className="text-sm font-medium text-text-primary">@{user.username}</span>
              <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
            </button>
          </ProfileDropdown>
        ) : isConnected && address ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border hover:bg-elevated transition-all">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-text-primary">{shortAddress}</span>
                <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[240px] bg-surface border border-border rounded-xl shadow-2xl p-2 z-[100]"
                sideOffset={8}
                align="end"
              >
                {/* Wallet Address */}
                <div className="px-3 py-3 mb-2 border-b border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-tertiary">Connected Wallet</p>
                      <p className="text-sm font-medium text-text-primary truncate">
                        {shortAddress}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-2 px-2 py-1.5 w-full rounded-lg hover:bg-elevated transition-colors group"
                  >
                    <span className="text-xs font-mono text-text-secondary flex-1 text-left truncate">
                      {address}
                    </span>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-primary flex-shrink-0" />
                    )}
                  </button>
                </div>

                {/* Actions */}
                <DropdownMenu.Item
                  onSelect={() => setIsSettingsModalOpen(true)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-elevated transition-colors cursor-pointer outline-none"
                >
                  <Settings className="w-4 h-4 text-text-tertiary" />
                  <span>Settings</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-border my-1" />

                <DropdownMenu.Item
                  onSelect={handleDisconnect}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-error hover:bg-error/10 transition-colors cursor-pointer outline-none"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : null}
      </div>

      {/* Username Setup Modal */}
      {needsUsername && address && !dismissedUsernameModal && (
        <UsernameModal
          open={needsUsername && !dismissedUsernameModal}
          walletAddress={address}
          onComplete={username => {
            createUser(username, socialProfile || undefined);
            setDismissedUsernameModal(false);
          }}
          onClose={() => {
            // Allow user to skip username setup, they can set it later
            setDismissedUsernameModal(true);
          }}
          socialProfile={socialProfile}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        open={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        user={user || undefined}
        onDisconnect={handleDisconnect}
        onUpdate={updateUser}
      />
    </>
  );
}
