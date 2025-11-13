import { Connection, ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import { PROTOCOL_PARAMS } from './constants';

export type V1taTransactionType =
  | 'open_position'
  | 'adjust_position'
  | 'close_position'
  | 'deposit_stability'
  | 'withdraw_stability'
  | 'redeem'
  | 'liquidate';

export interface ParsedV1taTransaction {
  signature: string;
  type: V1taTransactionType;
  timestamp: number;
  blockTime: number;
  success: boolean;

  // Position-related fields
  collateralAmount?: number;
  borrowAmount?: number;
  collateralChange?: number;
  debtChange?: number;

  // Stability pool fields
  vusdAmount?: number;

  // Redeem fields
  solReceived?: number;

  // Liquidation fields
  liquidator?: string;
  positionOwner?: string;
}

export class TransactionParser {
  constructor(
    private connection: Connection,
    private programId: PublicKey
  ) {}

  /**
   * Fetch all transactions for a user wallet related to V1ta protocol
   */
  async fetchUserTransactions(
    userPublicKey: PublicKey,
    limit: number = 50
  ): Promise<ParsedV1taTransaction[]> {
    try {
      // Fetch transaction signatures for the user
      const signatures = await this.connection.getSignaturesForAddress(userPublicKey, {
        limit,
      });

      if (signatures.length === 0) {
        return [];
      }

      // Batch process transactions to avoid rate limits
      const BATCH_SIZE = 10;
      const parsed: ParsedV1taTransaction[] = [];

      for (let i = 0; i < signatures.length; i += BATCH_SIZE) {
        const batch = signatures.slice(i, i + BATCH_SIZE);

        // Add delay between batches to respect rate limits
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        try {
          // Fetch transactions in smaller batches
          const transactions = await this.connection.getParsedTransactions(
            batch.map(s => s.signature),
            {
              maxSupportedTransactionVersion: 0,
            }
          );

          // Parse transactions in this batch
          for (let j = 0; j < transactions.length; j++) {
            const tx = transactions[j];
            const sig = batch[j];

            if (!tx || !tx.meta || tx.meta.err) {
              // Skip failed or null transactions
              if (tx?.meta?.err) {
                // Still add failed transactions
                parsed.push({
                  signature: sig.signature,
                  type: this.detectTransactionType(tx) || 'open_position',
                  timestamp: sig.blockTime || 0,
                  blockTime: sig.blockTime || 0,
                  success: false,
                });
              }
              continue;
            }

            const parsedTx = this.parseTransaction(tx, sig.signature, sig.blockTime || 0);
            if (parsedTx) {
              parsed.push(parsedTx);
            }
          }
        } catch (batchError) {
          console.error(`Failed to fetch batch ${i / BATCH_SIZE + 1}:`, batchError);
          // Continue with next batch even if this one fails
        }
      }

      return parsed;
    } catch (error) {
      console.error('Failed to fetch user transactions:', error);
      return [];
    }
  }

  /**
   * Parse a single transaction
   */
  private parseTransaction(
    tx: ParsedTransactionWithMeta,
    signature: string,
    blockTime: number
  ): ParsedV1taTransaction | null {
    try {
      // Check if this transaction involves our program
      const isV1taTransaction = tx.transaction.message.accountKeys.some(key =>
        key.pubkey.equals(this.programId)
      );

      if (!isV1taTransaction) {
        return null;
      }

      const type = this.detectTransactionType(tx);
      if (!type) {
        return null;
      }

      const success = !tx.meta?.err;

      // Parse transaction logs to extract data
      const logs = tx.meta?.logMessages || [];
      const data = this.parseLogsForData(logs, type);

      return {
        signature,
        type,
        timestamp: blockTime,
        blockTime,
        success,
        ...data,
      };
    } catch (error) {
      console.error('Failed to parse transaction:', error);
      return null;
    }
  }

  /**
   * Detect transaction type from instruction data or logs
   */
  private detectTransactionType(tx: ParsedTransactionWithMeta): V1taTransactionType | null {
    const logs = tx.meta?.logMessages || [];

    // Check program logs for instruction names
    if (logs.some(log => log.includes('Instruction: OpenPosition'))) {
      return 'open_position';
    }
    if (logs.some(log => log.includes('Instruction: AdjustPosition'))) {
      return 'adjust_position';
    }
    if (logs.some(log => log.includes('Instruction: ClosePosition'))) {
      return 'close_position';
    }
    if (logs.some(log => log.includes('Instruction: DepositStability'))) {
      return 'deposit_stability';
    }
    if (logs.some(log => log.includes('Instruction: WithdrawStability'))) {
      return 'withdraw_stability';
    }
    if (logs.some(log => log.includes('Instruction: Redeem'))) {
      return 'redeem';
    }
    if (logs.some(log => log.includes('Instruction: Liquidate'))) {
      return 'liquidate';
    }

    // Also check for our custom log messages
    if (logs.some(log => log.includes('Position opened:'))) {
      return 'open_position';
    }
    if (logs.some(log => log.includes('Position adjusted:'))) {
      return 'adjust_position';
    }
    if (logs.some(log => log.includes('Position closed:'))) {
      return 'close_position';
    }
    if (logs.some(log => log.includes('Deposited to stability pool:'))) {
      return 'deposit_stability';
    }
    if (logs.some(log => log.includes('Withdrawn from stability pool:'))) {
      return 'withdraw_stability';
    }
    if (logs.some(log => log.includes('VUSD redeemed:'))) {
      return 'redeem';
    }
    if (logs.some(log => log.includes('Position liquidated:'))) {
      return 'liquidate';
    }

    return null;
  }

  /**
   * Parse transaction logs to extract data
   */
  private parseLogsForData(
    logs: string[],
    type: V1taTransactionType
  ): Partial<ParsedV1taTransaction> {
    const data: Partial<ParsedV1taTransaction> = {};

    try {
      switch (type) {
        case 'open_position':
          for (const log of logs) {
            if (log.includes('Collateral:')) {
              const match = log.match(/Collateral:\s*([\d.]+)\s*SOL/);
              if (match) data.collateralAmount = parseFloat(match[1]);
            }
            if (log.includes('Borrowed:')) {
              const match = log.match(/Borrowed:\s*([\d.]+)\s*VUSD/);
              if (match) data.borrowAmount = parseFloat(match[1]);
            }
          }
          break;

        case 'adjust_position':
          for (const log of logs) {
            if (log.includes('Collateral change:')) {
              const match = log.match(/Collateral change:\s*([-\d.]+)\s*SOL/);
              if (match) data.collateralChange = parseFloat(match[1]);
            }
            if (log.includes('Debt change:')) {
              const match = log.match(/Debt change:\s*([-\d.]+)\s*VUSD/);
              if (match) data.debtChange = parseFloat(match[1]);
            }
          }
          break;

        case 'close_position':
          for (const log of logs) {
            if (log.includes('Collateral returned:')) {
              const match = log.match(/Collateral returned:\s*([\d.]+)\s*SOL/);
              if (match) data.collateralAmount = parseFloat(match[1]);
            }
            if (log.includes('Debt repaid:')) {
              const match = log.match(/Debt repaid:\s*([\d.]+)\s*VUSD/);
              if (match) data.borrowAmount = parseFloat(match[1]);
            }
          }
          break;

        case 'deposit_stability':
        case 'withdraw_stability':
          for (const log of logs) {
            if (log.includes('Amount:')) {
              const match = log.match(/Amount:\s*([\d.]+)\s*VUSD/);
              if (match) data.vusdAmount = parseFloat(match[1]);
            }
          }
          break;

        case 'redeem':
          for (const log of logs) {
            if (log.includes('VUSD burned:')) {
              const match = log.match(/VUSD burned:\s*([\d.]+)\s*VUSD/);
              if (match) data.vusdAmount = parseFloat(match[1]);
            }
            if (log.includes('SOL received:')) {
              const match = log.match(/SOL received:\s*([\d.]+)\s*SOL/);
              if (match) data.solReceived = parseFloat(match[1]);
            }
          }
          break;

        case 'liquidate':
          for (const log of logs) {
            if (log.includes('Liquidator:')) {
              const match = log.match(/Liquidator:\s*([A-Za-z0-9]+)/);
              if (match) data.liquidator = match[1];
            }
            if (log.includes('Position owner:')) {
              const match = log.match(/Position owner:\s*([A-Za-z0-9]+)/);
              if (match) data.positionOwner = match[1];
            }
            if (log.includes('Collateral liquidated:')) {
              const match = log.match(/Collateral liquidated:\s*([\d.]+)\s*SOL/);
              if (match) data.collateralAmount = parseFloat(match[1]);
            }
          }
          break;
      }
    } catch (error) {
      console.error('Failed to parse log data:', error);
    }

    return data;
  }
}
