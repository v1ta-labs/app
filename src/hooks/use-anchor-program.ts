'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';

export function useAnchorProgram<T extends Idl>(
  programId: string | PublicKey,
  idl: T
) {
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
      dummyWallet as any,
      { commitment: 'confirmed' }
    );

    const programIdKey = typeof programId === 'string'
      ? new PublicKey(programId)
      : programId;

    return new Program(idl, programIdKey, provider);
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions, programId, idl]);

  return program as Program<T> | null;
}
