import { useState, useEffect, useCallback, useRef } from 'react';
import { useVitaClient } from './use-vita-client';
import { useAppKitAccount } from '@reown/appkit/react';
import { PublicKey } from '@solana/web3.js';
import { TransactionParser, ParsedV1taTransaction } from '@/lib/vita/transaction-parser';

// Cache to avoid refetching on every render
const transactionCache = new Map<string, { data: ParsedV1taTransaction[]; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export function useTransactions(limit: number = 20) {
  const [transactions, setTransactions] = useState<ParsedV1taTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const { client: vitaClient } = useVitaClient();
  const { isConnected, address } = useAppKitAccount();

  const fetchTransactions = useCallback(async () => {
    if (!vitaClient || !address || !isConnected) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (fetchingRef.current) {
      return;
    }

    // Check cache first
    const cacheKey = `${address}-${limit}`;
    const cached = transactionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setTransactions(cached.data);
      setLoading(false);
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      const programId = vitaClient.program.programId;
      const connection = vitaClient.provider.connection;

      const parser = new TransactionParser(connection, programId);
      const txs = await parser.fetchUserTransactions(new PublicKey(address), limit);

      // Update cache
      transactionCache.set(cacheKey, { data: txs, timestamp: Date.now() });

      setTransactions(txs);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [vitaClient, address, isConnected, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
}
