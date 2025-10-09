'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppKitAccount } from '@reown/appkit/react';

interface User {
  id: string;
  walletAddress: string;
  username: string;
  email?: string | null;
  emailVerified: boolean;
  avatar?: string | null;
  bio?: string | null;
  twitter?: string | null;
  createdAt: Date;
  lastLoginAt: Date;
}

export function useUser() {
  const { connected: solanaConnected, publicKey } = useWallet();
  const { isConnected: reownConnected, address: reownAddress } = useAppKitAccount();

  const connected = solanaConnected || reownConnected;
  const walletAddress = solanaConnected ? publicKey?.toString() : reownAddress;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsUsername, setNeedsUsername] = useState(false);

  const fetchUser = async () => {
    if (!walletAddress) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/user?wallet=${walletAddress}`);
      const data = await res.json();

      if (data.exists) {
        setUser(data.user);
        setNeedsUsername(false);
      } else {
        setUser(null);
        setNeedsUsername(true);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (username: string) => {
    if (!walletAddress) return;

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, username }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setNeedsUsername(false);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const updateUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    if (connected && walletAddress) {
      fetchUser();
    } else {
      setUser(null);
      setNeedsUsername(false);
    }
  }, [connected, walletAddress]);

  return {
    user,
    loading,
    needsUsername,
    createUser,
    updateUser,
    walletAddress: walletAddress || '',
  };
}
