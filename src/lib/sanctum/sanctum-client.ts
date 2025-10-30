import type { LSTMetadata, LSTListResponse } from './types';

/**
 * Client for interacting with Sanctum LST API
 * Docs: https://api.sanctum.so
 */
export class SanctumClient {
  private baseUrl = 'https://api.sanctum.so';

  /**
   * Get list of all supported LSTs
   */
  async getLSTs(): Promise<LSTMetadata[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/lsts`);
      if (!response.ok) {
        throw new Error(`Failed to fetch LSTs: ${response.statusText}`);
      }
      const data: LSTListResponse = await response.json();
      return data.lsts;
    } catch (error) {
      console.error('Error fetching LSTs:', error);
      throw error;
    }
  }

  /**
   * Get specific LST data by mint address or symbol
   */
  async getLST(mintOrSymbol: string): Promise<LSTMetadata> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/lsts/${mintOrSymbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch LST ${mintOrSymbol}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching LST ${mintOrSymbol}:`, error);
      throw error;
    }
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
    const allLSTs = await this.getLSTs();

    // Filter for V1ta supported LSTs
    const supportedSymbols = ['jitoSOL', 'mSOL'];
    return allLSTs.filter(lst => supportedSymbols.includes(lst.symbol));
  }

  /**
   * Get real-time APY for an LST
   */
  async getLSTAPY(mintOrSymbol: string): Promise<number> {
    const lstData = await this.getLST(mintOrSymbol);
    return lstData.apy;
  }
}

// Export a singleton instance
export const sanctumClient = new SanctumClient();
