'use client';

import { useEffect, useState } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';

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

interface SocialProfile {
  email?: string;
  avatar?: string;
  name?: string;
}

export function useUser() {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('solana');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [socialProfile, setSocialProfile] = useState<SocialProfile | null>(null);

  const fetchSocialProfile = async () => {
    if (!isConnected || !walletProvider) return;

    try {
      // Try to get social profile data from Reown
      // @ts-expect-error - Reown provider types are not fully exported
      const profile = await walletProvider.request?.({ method: 'wallet_getProfile' });
      if (profile) {
        setSocialProfile(profile as SocialProfile);
      }
    } catch (error) {
      // Social profile not available, that's fine
      console.debug('No social profile available');
    }
  };

  const fetchUser = async () => {
    if (!address) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/user?wallet=${address}`);
      const data = await res.json();

      if (data.exists) {
        setUser(data.user);
        setNeedsUsername(false);
      } else {
        setUser(null);
        setNeedsUsername(true);
        // Fetch social profile for new users
        if (isConnected) {
          await fetchSocialProfile();
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (username: string, profile?: { email?: string; avatar?: string }) => {
    if (!address) return;

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          username,
          email: profile?.email || null,
          avatar: profile?.avatar || null,
          emailVerified: !!profile?.email, // Auto-verify if from social login
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setNeedsUsername(false);
        setSocialProfile(null);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  const updateUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchUser();
    } else {
      setUser(null);
      setNeedsUsername(false);
      setSocialProfile(null);
    }
  }, [isConnected, address]);

  return {
    user,
    loading,
    needsUsername,
    socialProfile,
    createUser,
    updateUser,
    walletAddress: address || '',
  };
}
