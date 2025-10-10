import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  VITA_PROGRAM_ID,
  PROTOCOL_PARAMS,
  getPositionPda,
  calculateCollateralRatio,
  isLiquidatable,
  calculateLiquidationPenalty,
} from './constants';
import { PositionState, fetchPosition, fetchAllPositions } from './position';

/**
 * Liquidation result
 */
export interface LiquidationResult {
  collateralLiquidated: bigint;
  debtRepaid: bigint;
  penalty: bigint;
  liquidatorReward: bigint;
}

/**
 * Create instruction to liquidate an undercollateralized position
 */
export async function createLiquidateInstruction(
  liquidator: PublicKey,
  positionOwner: PublicKey,
  positionId: bigint,
  maxDebtToRepay: bigint
): Promise<TransactionInstruction> {
  const [positionPda] = await getPositionPda(positionOwner, positionId);

  const instructionData = Buffer.alloc(1 + 8);
  instructionData.writeUInt8(4, 0); // Liquidate discriminator
  instructionData.writeBigUInt64LE(maxDebtToRepay, 1);

  const keys = [
    { pubkey: liquidator, isSigner: true, isWritable: true },
    { pubkey: positionPda, isSigner: false, isWritable: true },
    { pubkey: positionOwner, isSigner: false, isWritable: true },
    // Add other required accounts (stability_pool, global_state, etc.)
  ];

  return new TransactionInstruction({
    keys,
    programId: VITA_PROGRAM_ID,
    data: instructionData,
  });
}

/**
 * Calculate liquidation amounts
 */
export function calculateLiquidation(
  position: PositionState,
  collateralPrice: number,
  maxDebtToRepay?: bigint
): LiquidationResult {
  const collateralValuePerUnit = BigInt(Math.floor(collateralPrice * 1e9));

  // Determine debt to repay (either max or full position debt)
  const debtRepaid = maxDebtToRepay && maxDebtToRepay < position.debt ? maxDebtToRepay : position.debt;

  // Calculate collateral to liquidate (debt * price ratio)
  const collateralNeeded = (debtRepaid * 1_000_000_000n) / collateralValuePerUnit;

  // Add liquidation penalty (5%)
  const penalty = calculateLiquidationPenalty(collateralNeeded);
  const collateralLiquidated = collateralNeeded + penalty;

  // Liquidator gets the penalty as reward
  const liquidatorReward = penalty;

  return {
    collateralLiquidated,
    debtRepaid,
    penalty,
    liquidatorReward,
  };
}

/**
 * Find all liquidatable positions
 */
export async function findLiquidatablePositions(
  connection: Connection,
  collateralPrices: Record<string, number>
): Promise<Array<{ position: PositionState; collateralRatio: number }>> {
  try {
    // Get all active positions from the program
    const accounts = await connection.getProgramAccounts(VITA_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8 + 32 + 8 + 8 + 8 + 1, // Offset to status field
            bytes: Buffer.from([0]).toString('base64'), // Active status
          },
        },
      ],
    });

    const liquidatablePositions: Array<{ position: PositionState; collateralRatio: number }> = [];

    for (const { account } of accounts) {
      // Parse position (placeholder - needs actual borsh deserialization)
      const position = parsePositionAccountData(account.data);
      if (!position) continue;

      // Get collateral price based on type
      const collateralType = getCollateralTypeName(position.collateralType);
      const price = collateralPrices[collateralType];
      if (!price) continue;

      // Calculate collateral value
      const collateralValue = BigInt(Math.floor(Number(position.collateralAmount) * price * 1e9));

      // Check if liquidatable
      if (isLiquidatable(collateralValue, position.debt)) {
        const cr = calculateCollateralRatio(collateralValue, position.debt);
        liquidatablePositions.push({ position, collateralRatio: cr });
      }
    }

    // Sort by collateral ratio (lowest first - most urgent)
    return liquidatablePositions.sort((a, b) => a.collateralRatio - b.collateralRatio);
  } catch (error) {
    console.error('Error finding liquidatable positions:', error);
    return [];
  }
}

/**
 * Check if a specific position is liquidatable
 */
export async function checkLiquidatable(
  connection: Connection,
  positionOwner: PublicKey,
  positionId: bigint,
  collateralPrice: number
): Promise<{ liquidatable: boolean; collateralRatio: number }> {
  const position = await fetchPosition(connection, positionOwner, positionId);

  if (!position) {
    return { liquidatable: false, collateralRatio: 0 };
  }

  const collateralValue = BigInt(Math.floor(Number(position.collateralAmount) * collateralPrice * 1e9));
  const collateralRatio = calculateCollateralRatio(collateralValue, position.debt);
  const liquidatable = isLiquidatable(collateralValue, position.debt);

  return { liquidatable, collateralRatio };
}

/**
 * Calculate profitability of liquidation
 */
export interface LiquidationProfitability {
  isProfitable: boolean;
  expectedProfit: bigint;
  collateralReceived: bigint;
  debtToPay: bigint;
  netValue: bigint;
}

export function calculateLiquidationProfitability(
  position: PositionState,
  collateralPrice: number,
  vusdPrice: number = 1.0
): LiquidationProfitability {
  const liquidation = calculateLiquidation(position, collateralPrice);

  // Value of collateral received (including penalty)
  const collateralValue = BigInt(Math.floor(Number(liquidation.collateralLiquidated) * collateralPrice * 1e9));

  // Cost of debt to repay
  const debtCost = BigInt(Math.floor(Number(liquidation.debtRepaid) * vusdPrice * 1e9));

  // Net profit
  const netValue = collateralValue - debtCost;
  const isProfitable = netValue > 0n;

  return {
    isProfitable,
    expectedProfit: netValue,
    collateralReceived: liquidation.collateralLiquidated,
    debtToPay: liquidation.debtRepaid,
    netValue,
  };
}

/**
 * Helper: Parse position account data
 * TODO: Implement proper borsh deserialization
 */
function parsePositionAccountData(data: Buffer): PositionState | null {
  try {
    // Placeholder
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Helper: Get collateral type name
 */
function getCollateralTypeName(collateralType: number): string {
  const types = ['SOL', 'mSOL', 'stSOL', 'JitoSOL'];
  return types[collateralType] || 'SOL';
}

/**
 * Estimate gas cost for liquidation
 */
export function estimateLiquidationCost(): bigint {
  // Estimate: ~0.005 SOL for compute units + priority fees
  return BigInt(5_000_000); // 0.005 SOL in lamports
}

/**
 * Check if liquidation is profitable after gas costs
 */
export function isLiquidationProfitable(
  profitability: LiquidationProfitability,
  solPrice: number
): boolean {
  const gasCost = estimateLiquidationCost();
  const gasCostInUsd = BigInt(Math.floor(Number(gasCost) * solPrice / 1e9 * 1e9));

  return profitability.netValue > gasCostInUsd;
}
