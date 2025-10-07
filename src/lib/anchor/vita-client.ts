import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

export class VitaClient {
  programId: PublicKey;

  constructor(
    connection: Connection,
    programId: string | PublicKey,
    wallet?: any
  ) {
    this.programId = typeof programId === 'string'
      ? new PublicKey(programId)
      : programId;
  }

  async initializePool(params: {}) {
    throw new Error('Not implemented - add your Anchor program logic');
  }

  async deposit(params: {
    amount: number;
  }) {
    throw new Error('Not implemented - add your Anchor program logic');
  }

  async borrow(params: {
    amount: number;
  }) {
    throw new Error('Not implemented - add your Anchor program logic');
  }

  async repay(params: {
    amount: number;
  }) {
    throw new Error('Not implemented - add your Anchor program logic');
  }

  async withdraw(params: {
    amount: number;
  }) {
    throw new Error('Not implemented - add your Anchor program logic');
  }

  async liquidate(params: {
    position: PublicKey;
  }) {
    throw new Error('Not implemented - add your Anchor program logic');
  }

  async getUserPosition(userPubkey: PublicKey) {
    throw new Error('Not implemented - add your Anchor program logic');
  }

  async getPoolData(poolPubkey: PublicKey) {
    throw new Error('Not implemented - add your Anchor program logic');
  }
}
