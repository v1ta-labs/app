'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionSignature } from '@solana/web3.js';
import { useState } from 'react';
import { toast } from 'sonner';
import { getExplorerUrl, CURRENT_NETWORK } from '@/constants/solana';

export interface TransactionState {
  signature: TransactionSignature | null;
  loading: boolean;
  error: Error | null;
}

export function useTransaction() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [state, setState] = useState<TransactionState>({
    signature: null,
    loading: false,
    error: null,
  });

  const send = async (transaction: Transaction): Promise<TransactionSignature | null> => {
    if (!publicKey) {
      const error = new Error('Wallet not connected');
      setState({ signature: null, loading: false, error });
      toast.error('Please connect your wallet first');
      return null;
    }

    setState({ signature: null, loading: true, error: null });
    toast.loading('Preparing transaction...');

    try {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);

      toast.loading('Transaction sent. Confirming...', { id: 'tx-pending' });

      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }

      setState({ signature, loading: false, error: null });

      toast.success(
        `Transaction confirmed! View on Explorer: ${getExplorerUrl('tx', signature, CURRENT_NETWORK)}`,
        { id: 'tx-pending' }
      );

      return signature;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Transaction failed');
      setState({ signature: null, loading: false, error });
      toast.error(error.message, { id: 'tx-pending' });
      return null;
    }
  };

  return {
    ...state,
    send,
  };
}
