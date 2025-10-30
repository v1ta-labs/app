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
    options?: {
      skipSimulation?: boolean;
      cuPriceRange?: 'low' | 'medium' | 'high';
      jitoTipRange?: 'low' | 'medium' | 'high' | 'max';
      deliveryMethod?: 'rpc' | 'jito' | 'sanctum-sender';
    }
  ): Promise<{ transaction: Transaction | VersionedTransaction; signature: string }> {
    try {
      // Serialize transaction to base64
      const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const base64Tx = Buffer.from(serialized).toString('base64');

      const requestBody: GatewayTransactionRequest = {
        tx: base64Tx,
        skipSimulation: options?.skipSimulation ?? false,
        cuPriceRange: options?.cuPriceRange ?? 'medium',
        jitoTipRange: options?.jitoTipRange ?? 'medium',
        deliveryMethod: options?.deliveryMethod ?? 'jito',
      };

      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gateway request failed: ${response.statusText}`);
      }

      const data: GatewayTransactionResponse = await response.json();

      // Deserialize the optimized transaction
      const optimizedTxBuffer = Buffer.from(data.tx, 'base64');

      // Determine if it's a versioned transaction
      const isVersioned = transaction instanceof VersionedTransaction;
      const optimizedTx = isVersioned
        ? VersionedTransaction.deserialize(optimizedTxBuffer)
        : Transaction.from(optimizedTxBuffer);

      console.log('Gateway optimization complete:', {
        signature: data.signature,
        cuPrice: data.cuPrice,
        jitoTip: data.jitoTip,
      });

      return {
        transaction: optimizedTx,
        signature: data.signature,
      };
    } catch (error) {
      console.error('Gateway transaction optimization failed:', error);
      // Fallback to original transaction if Gateway fails
      return {
        transaction,
        signature: '',
      };
    }
  }

  /**
   * Send a transaction through Sanctum Gateway with optimizations
   * @param transaction - The transaction to send
   * @param options - Gateway options
   * @returns Transaction signature
   */
  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    options?: {
      skipSimulation?: boolean;
      cuPriceRange?: 'low' | 'medium' | 'high';
      jitoTipRange?: 'low' | 'medium' | 'high' | 'max';
    }
  ): Promise<string> {
    const { signature } = await this.buildGatewayTransaction(transaction, {
      ...options,
      deliveryMethod: 'jito', // Use Jito for best success rates
    });

    return signature;
  }
}

// Export singleton instance
export const sanctumGateway = new SanctumGateway();
