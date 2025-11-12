import type { LSTMetadata } from './types';

/**
 * Static LST data for V1ta protocol
 * No external API dependencies - uses hardcoded metadata
 */

// Supported LST mint addresses
export const LST_MINTS = {
  jitoSOL: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
  mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
} as const;

// Static LST metadata
const LST_DATA: Record<string, LSTMetadata> = {
  jitoSOL: {
    symbol: 'jitoSOL',
    name: 'Jito Staked SOL',
    mint: LST_MINTS.jitoSOL,
    logoUri: 'https://storage.googleapis.com/token-metadata/JitoSOL-256.png',
    poolAddress: 'Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb',
    validatorFee: 0,
    tvl: 0,
    apy: 7.2, // Approximate APY - static fallback
    solValue: 1.0, // Will be updated from on-chain data
    poolTokenSupply: 0,
    lastUpdated: Date.now(),
  },
  mSOL: {
    symbol: 'mSOL',
    name: 'Marinade Staked SOL',
    mint: LST_MINTS.mSOL,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
    poolAddress: '8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC',
    validatorFee: 0,
    tvl: 0,
    apy: 6.8, // Approximate APY - static fallback
    solValue: 1.0, // Will be updated from on-chain data
    poolTokenSupply: 0,
    lastUpdated: Date.now(),
  },
};

/**
 * Client for LST data - uses static metadata
 */
export class SanctumClient {
  /**
   * Get list of all supported LSTs
   */
  async getLSTs(): Promise<LSTMetadata[]> {
    return Object.values(LST_DATA);
  }

  /**
   * Get specific LST data by mint address or symbol
   */
  async getLST(mintOrSymbol: string): Promise<LSTMetadata> {
    const lst = LST_DATA[mintOrSymbol] ||
                Object.values(LST_DATA).find(l => l.mint === mintOrSymbol);

    if (!lst) {
      throw new Error(`LST not found: ${mintOrSymbol}`);
    }

    return lst;
  }

  /**
   * Get SOL value for a given amount of LST tokens
   * @param lstMint - The mint address of the LST
   * @param amount - Amount of LST tokens
   * @returns Equivalent value in SOL
   */
  async getLSTValueInSOL(lstMint: string, amount: number): Promise<number> {
    const lstData = await this.getLST(lstMint);
    return amount * lstData.solValue;
  }

  /**
   * Get supported LSTs for V1ta (JitoSOL, mSOL)
   */
  async getSupportedLSTs(): Promise<LSTMetadata[]> {
    return Object.values(LST_DATA);
  }

  /**
   * Get APY for an LST
   */
  async getLSTAPY(mintOrSymbol: string): Promise<number> {
    const lstData = await this.getLST(mintOrSymbol);
    return lstData.apy;
  }
}

// Export a singleton instance
export const sanctumClient = new SanctumClient();
