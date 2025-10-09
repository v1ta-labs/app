'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { useSolanaBalance } from '@/hooks';
import { useUser } from '@/hooks/use-user';
import { formatNumber } from '@/lib/utils/formatters';
import { ChevronDown, User as UserIcon, Wallet } from 'lucide-react';
import { WalletModal } from '@/components/common/wallet-modal';
import { UsernameModal } from '@/components/auth/username-modal';
import { ProfileModal } from '@/components/auth/profile-modal';

export function WalletButton() {
  const { connected: solanaConnected, disconnect: disconnectSolana } = useWallet();
  const { isConnected: reownConnected } = useAppKitAccount();
  const { disconnect: disconnectReown } = useDisconnect();
  const { balance } = useSolanaBalance();
  const { user, loading, needsUsername, socialProfile, createUser, updateUser, walletAddress } = useUser();

  const [mounted, setMounted] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const connected = solanaConnected || reownConnected;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDisconnect = () => {
    if (solanaConnected) {
      disconnectSolana();
    }
    if (reownConnected) {
      disconnectReown();
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

  const shortAddress = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '';

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

        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border hover:bg-elevated transition-all hover:border-border/80"
        >
          {loading ? (
            <>
              <div className="w-2 h-2 rounded-full bg-text-tertiary animate-pulse" />
              <span className="text-sm font-medium text-text-primary">Loading...</span>
            </>
          ) : user ? (
            <>
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-text-primary">@{user.username}</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-text-primary">{shortAddress}</span>
            </>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
        </button>
      </div>

      {/* Username Setup Modal */}
      {needsUsername && walletAddress && (
        <UsernameModal
          open={needsUsername}
          walletAddress={walletAddress}
          onComplete={(username) => createUser(username, socialProfile || undefined)}
          onClose={handleDisconnect}
          socialProfile={socialProfile}
        />
      )}

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          open={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onDisconnect={handleDisconnect}
          onUpdate={updateUser}
        />
      )}
    </>
  );
}
