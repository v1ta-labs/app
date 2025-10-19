'use client';

import { useMemo, useEffect, useState } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { Connection, PublicKey } from '@solana/web3.js';
import { V1TAClient } from '@/lib/vita';

export function useVitaClient() {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('solana');
  const [client, setClient] = useState<V1TAClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connection = useMemo(
    () => new Connection('https://api.devnet.solana.com', 'confirmed'),
    []
  );

  const publicKey = useMemo(() => {
    if (!address) return null;
    try {
      return new PublicKey(address);
    } catch {
      return null;
    }
  }, [address]);

  useEffect(() => {
    async function createClient() {
      if (!isConnected || !walletProvider || !publicKey) {
        setClient(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const vitaClient = await V1TAClient.create(connection, walletProvider, publicKey);
        setClient(vitaClient);
      } catch (err) {
        console.error('Failed to create V1TA client:', err);
        setError(err instanceof Error ? err : new Error('Failed to create client'));
        setClient(null);
      } finally {
        setIsLoading(false);
      }
    }

    createClient();
  }, [isConnected, walletProvider, publicKey, connection]);

  return { client, isLoading, error, isConnected, publicKey };
}
