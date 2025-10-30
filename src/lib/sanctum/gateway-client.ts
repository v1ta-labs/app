import { Transaction, VersionedTransaction } from '@solana/web3.js';

/**
 * Sanctum Gateway Client for optimized transaction delivery
 * Uses backend proxy to avoid CORS issues
 * Docs: https://gateway.sanctum.so/docs
 */

interface GatewayTransactionRequest {
  tx: string; // Base64 encoded transaction
  skipSimulation?: boolean;
  cuPriceRange?: 'low' | 'medium' | 'high';
  jitoTipRange?: 'low' | 'medium' | 'high' | 'max';
  deliveryMethod?: 'rpc' | 'jito' | 'sanctum-sender';
}

interface GatewayTransactionResponse {
  tx: string; // Optimized transaction in base64
  signature: string;
  cuPrice?: number;
  jitoTip?: number;
}

export class SanctumGateway {
  private proxyUrl = '/api/sanctum-gateway';

  /**
   * Build and optimize a transaction using Sanctum Gateway
   * @param transaction - The transaction to optimize
   * @param options - Gateway optimization options
   * @returns Optimized transaction ready to send
   */
  async buildGatewayTransaction(
    transaction: Transaction | VersionedTransaction,
    cluster: 'mainnet' | 'devnet' = 'devnet'
  ): Promise<{ result: any }> {
    try {
      // Serialize transaction to base64
      const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const base64Tx = Buffer.from(serialized).toString('base64');

      console.log('Sending transaction to Gateway proxy...');

      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: base64Tx,
          cluster,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gateway request failed: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('Gateway optimization complete:', data);

      return data;
    } catch (error) {
      console.error('Gateway transaction optimization failed:', error);
      throw error;
    }
  }

  /**
   * Send a transaction through Sanctum Gateway with optimizations
   * @param transaction - The transaction to send
   * @param cluster - The Solana cluster
   * @returns Gateway result with transaction details
   */
  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    cluster: 'mainnet' | 'devnet' = 'devnet'
  ): Promise<{ result: any }> {
    return await this.buildGatewayTransaction(transaction, cluster);
  }
}

// Export singleton instance
export const sanctumGateway = new SanctumGateway();
