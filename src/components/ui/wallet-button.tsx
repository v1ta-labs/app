'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount, useDisconnect, useAppKitProvider, useAppKit } from '@reown/appkit/react';
import { useUser } from '@/hooks/use-user';
import { formatNumber } from '@/lib/utils/formatters';
import { ChevronDown, User as UserIcon, Wallet } from 'lucide-react';
import { UsernameModal } from '@/components/auth/username-modal';
import { ProfileDropdown } from '@/components/common/profile-dropdown';
import { SettingsModal } from '@/components/modals/settings-modal';

export function WalletButton() {
  const { isConnected, address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { walletProvider } = useAppKitProvider('solana');
  const { open: openReownModal } = useAppKit();
  const { user, loading, needsUsername, socialProfile, createUser, updateUser } = useUser();

  const [mounted, setMounted] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [dismissedUsernameModal, setDismissedUsernameModal] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

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
      if (!walletProvider || !address) {
        setBalance(null);
        return;
      }
      try {
        // @ts-expect-error - Reown provider types
        const bal = await walletProvider.getBalance(address);
        setBalance(bal ? Number(bal) / 1e9 : 0); // Convert lamports to SOL
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setBalance(null);
      }
    };

    if (isConnected && address) {
      fetchBalance();
    }
  }, [isConnected, address, walletProvider]);

  const handleDisconnect = () => {
    disconnect();
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
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border hover:bg-elevated transition-all"
          >
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-text-primary">{shortAddress}</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
          </button>
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
