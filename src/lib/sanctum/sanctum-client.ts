import type { LSTMetadata } from './types';

/**
 * Client for interacting with Sanctum LST API
 * Uses backend proxy to avoid CORS issues
 * Base URL: https://sanctum-api.ironforge.network
 * Docs: https://learn.sanctum.so/docs/for-developers/sanctum-api
 */
export class SanctumClient {
  private proxyUrl = '/api/sanctum';

  /**
   * Get list of all supported LSTs via backend proxy
   * GET /lsts - Returns all LST metadatas
   */
  async getLSTs(): Promise<LSTMetadata[]> {
    try {
      const response = await fetch(`${this.proxyUrl}?endpoint=/lsts`);
      if (!response.ok) {
        throw new Error(`Failed to fetch LSTs: ${response.statusText}`);
      }
      const data = await response.json();
      // Handle both array and object with lsts property
      return Array.isArray(data) ? data : data.lsts || [];
    } catch (error) {
      console.error('Error fetching LSTs:', error);
      throw error;
    }
  }

  /**
   * Get specific LST data by mint address or symbol via backend proxy
   * GET /lsts/{mintOrSymbol}
   */
  async getLST(mintOrSymbol: string): Promise<LSTMetadata> {
    try {
      const response = await fetch(`${this.proxyUrl}?endpoint=/lsts/${mintOrSymbol}`);
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
