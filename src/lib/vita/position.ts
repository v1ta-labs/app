import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  VITA_PROGRAM_ID,
  getPositionPda,
  calculateCollateralRatio,
  isLiquidatable,
} from './constants';

/**
 * Position State (matches on-chain account)
 */
export interface PositionState {
  owner: PublicKey;
  positionId: bigint;
  collateralAmount: bigint;
  debt: bigint;
  collateralType: CollateralType;
  status: PositionStatus;
  bump: number;
}

export enum CollateralType {
  SOL = 0,
  MSOL = 1,
  STSOL = 2,
  JSOL = 3,
}

export enum PositionStatus {
  Active = 0,
  Liquidated = 1,
  Closed = 2,
}

/**
 * Fetch position state from blockchain
 */
export async function fetchPosition(
  connection: Connection,
  owner: PublicKey,
  positionId: bigint
): Promise<PositionState | null> {
  const [positionPda] = await getPositionPda(owner, positionId);

  try {
    const accountInfo = await connection.getAccountInfo(positionPda);
    if (!accountInfo) return null;

    // Parse position account data
    // Note: Actual deserialization will depend on borsh schema
    return parsePositionAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching position:', error);
    return null;
  }
}

/**
 * Get all positions for an owner
 */
export async function fetchAllPositions(
  connection: Connection,
  owner: PublicKey
): Promise<PositionState[]> {
  try {
    const accounts = await connection.getProgramAccounts(VITA_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: owner.toBase58(),
          },
        },
      ],
    });

    return accounts
      .map(({ account }) => parsePositionAccount(account.data))
      .filter((pos): pos is PositionState => pos !== null);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
}

/**
 * Parse position account data
 * TODO: Implement proper borsh deserialization when schema is available
 */
function parsePositionAccount(data: Buffer): PositionState | null {
  try {
    // Placeholder - will need actual borsh schema
    // For now, returning null to indicate unimplemented
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Create instruction to open a new position
 */
export async function createOpenPositionInstruction(
  owner: PublicKey,
  positionId: bigint,
  collateralType: CollateralType,
  collateralAmount: bigint,
  debtAmount: bigint
): Promise<TransactionInstruction> {
  const [positionPda, bump] = await getPositionPda(owner, positionId);

  // Build instruction data
  const instructionData = Buffer.alloc(1 + 1 + 8 + 8); // discriminator + collateral_type + collateral + debt
  instructionData.writeUInt8(1, 0); // OpenPosition discriminator
  instructionData.writeUInt8(collateralType, 1);
  instructionData.writeBigUInt64LE(collateralAmount, 2);
  instructionData.writeBigUInt64LE(debtAmount, 10);

  // TODO: Add proper account metas based on program interface
  const keys = [
    { pubkey: owner, isSigner: true, isWritable: true },
    { pubkey: positionPda, isSigner: false, isWritable: true },
    // Add other required accounts (global_state, vault, etc.)
  ];

  return new TransactionInstruction({
    keys,
    programId: VITA_PROGRAM_ID,
    data: instructionData,
  });
}

/**
 * Create instruction to adjust position (add/remove collateral or debt)
 */
export async function createAdjustPositionInstruction(
  owner: PublicKey,
  positionId: bigint,
  collateralDelta: bigint,
  debtDelta: bigint,
  isIncrease: boolean
): Promise<TransactionInstruction> {
  const [positionPda] = await getPositionPda(owner, positionId);

  const instructionData = Buffer.alloc(1 + 8 + 8 + 1);
  instructionData.writeUInt8(2, 0); // AdjustPosition discriminator
  instructionData.writeBigUInt64LE(collateralDelta, 1);
  instructionData.writeBigUInt64LE(debtDelta, 9);
  instructionData.writeUInt8(isIncrease ? 1 : 0, 17);

  const keys = [
    { pubkey: owner, isSigner: true, isWritable: true },
    { pubkey: positionPda, isSigner: false, isWritable: true },
  ];

  return new TransactionInstruction({
    keys,
    programId: VITA_PROGRAM_ID,
    data: instructionData,
  });
}

/**
 * Create instruction to close position
 */
export async function createClosePositionInstruction(
  owner: PublicKey,
  positionId: bigint
): Promise<TransactionInstruction> {
  const [positionPda] = await getPositionPda(owner, positionId);

  const instructionData = Buffer.alloc(1);
  instructionData.writeUInt8(3, 0); // ClosePosition discriminator

  const keys = [
    { pubkey: owner, isSigner: true, isWritable: true },
    { pubkey: positionPda, isSigner: false, isWritable: true },
  ];

  return new TransactionInstruction({
    keys,
    programId: VITA_PROGRAM_ID,
    data: instructionData,
  });
}

/**
 * Get position health metrics
 */
export interface PositionHealth {
  collateralRatio: number;
  isHealthy: boolean;
  isLiquidatable: boolean;
  availableDebt: bigint;
  requiredCollateral: bigint;
}

export async function getPositionHealth(
  position: PositionState,
  collateralPrice: number
): Promise<PositionHealth> {
  const collateralValue = BigInt(
    Math.floor(Number(position.collateralAmount) * collateralPrice * 1e9)
  );

  const collateralRatio = calculateCollateralRatio(collateralValue, position.debt);
  const liquidatable = isLiquidatable(collateralValue, position.debt);

  // Calculate available debt (max debt - current debt)
  const maxDebt = (collateralValue * 100n) / 110n;
  const availableDebt = maxDebt > position.debt ? maxDebt - position.debt : 0n;

  // Calculate required collateral for current debt at 110% CR
  const requiredCollateral = (position.debt * 110n) / 100n;

  return {
    collateralRatio,
    isHealthy: collateralRatio >= 110,
    isLiquidatable: liquidatable,
    availableDebt,
    requiredCollateral,
  };
}
