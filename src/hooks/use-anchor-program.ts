'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';

export function useAnchorProgram<T extends Idl>(programId: string | PublicKey, idl: T) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey) return null;

    const dummyWallet = {
      publicKey: wallet.publicKey || PublicKey.default,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };

    const provider = new AnchorProvider(
      connection,
      dummyWallet as unknown as AnchorProvider['wallet'],
      { commitment: 'confirmed' }
    );

    return new Program(idl, provider);
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions, idl]);

  return program as Program<T> | null;
}
