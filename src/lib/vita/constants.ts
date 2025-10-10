import { PublicKey } from '@solana/web3.js';

/**
 * V1TA Protocol Constants
 * Devnet v0.1
 */

export const VITA_PROGRAM_ID = new PublicKey('D4PzAjCQtGL5n6b79fBJh5Z84GKJk1ruPCYn8914dsST');

/**
 * PDA Seeds
 */
export const SEEDS = {
  GLOBAL_STATE: 'global_state',
  POSITION: 'position',
  STABILITY_POOL: 'stability_pool',
  STABILITY_DEPOSIT: 'stability_deposit',
} as const;

/**
 * Protocol Parameters
 */
export const PROTOCOL_PARAMS = {
  MIN_COLLATERAL_RATIO: 110, // 110% minimum CR
  LIQUIDATION_PENALTY: 5, // 5% penalty
  BORROWING_FEE: 0.5, // 0.5% one-time fee
  PRECISION: 1e9, // 9 decimals for VUSD
} as const;

/**
 * Token Mints (Devnet)
 */
export const TOKEN_MINTS = {
  VUSD: new PublicKey('VUSD_MINT_PLACEHOLDER'), // Will be set when program deploys
  SOL: new PublicKey('So11111111111111111111111111111111111111112'),
} as const;

/**
 * Derive Global State PDA
 */
export async function getGlobalStatePda(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.GLOBAL_STATE)],
    VITA_PROGRAM_ID
  );
}

/**
 * Derive Position PDA
 * @param owner - Owner's public key
 * @param positionId - Position ID (u64 as Buffer)
 */
export async function getPositionPda(
  owner: PublicKey,
  positionId: bigint
): Promise<[PublicKey, number]> {
  const positionIdBuffer = Buffer.alloc(8);
  positionIdBuffer.writeBigUInt64LE(positionId);

  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.POSITION), owner.toBuffer(), positionIdBuffer],
    VITA_PROGRAM_ID
  );
}

/**
 * Derive Stability Pool PDA
 */
export async function getStabilityPoolPda(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.STABILITY_POOL)],
    VITA_PROGRAM_ID
  );
}

/**
 * Derive Stability Deposit PDA
 * @param depositor - Depositor's public key
 */
export async function getStabilityDepositPda(
  depositor: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.STABILITY_DEPOSIT), depositor.toBuffer()],
    VITA_PROGRAM_ID
  );
}

/**
 * Calculate Collateral Ratio
 * @param collateralValue - Collateral value in USD (with precision)
 * @param debt - Debt amount in VUSD (with precision)
 * @returns Collateral ratio as percentage (e.g., 150 for 150%)
 */
export function calculateCollateralRatio(
  collateralValue: bigint,
  debt: bigint
): number {
  if (debt === 0n) return Infinity;
  return Number((collateralValue * 100n) / debt);
}

/**
 * Calculate maximum debt for given collateral
 * @param collateralValue - Collateral value in USD (with precision)
 * @param minCR - Minimum collateral ratio (default 110%)
 * @returns Maximum debt in VUSD (with precision)
 */
export function calculateMaxDebt(
  collateralValue: bigint,
  minCR: number = PROTOCOL_PARAMS.MIN_COLLATERAL_RATIO
): bigint {
  return (collateralValue * 100n) / BigInt(minCR);
}

/**
 * Calculate borrowing fee
 * @param debtAmount - Debt amount in VUSD (with precision)
 * @returns Fee amount in VUSD (with precision)
 */
export function calculateBorrowingFee(debtAmount: bigint): bigint {
  return (debtAmount * BigInt(PROTOCOL_PARAMS.BORROWING_FEE * 100)) / 10000n;
}

/**
 * Calculate liquidation penalty
 * @param collateralAmount - Collateral amount (with precision)
 * @returns Penalty amount (with precision)
 */
export function calculateLiquidationPenalty(collateralAmount: bigint): bigint {
  return (collateralAmount * BigInt(PROTOCOL_PARAMS.LIQUIDATION_PENALTY)) / 100n;
}

/**
 * Check if position is liquidatable
 * @param collateralValue - Collateral value in USD (with precision)
 * @param debt - Debt amount in VUSD (with precision)
 * @returns True if CR < 110%
 */
export function isLiquidatable(collateralValue: bigint, debt: bigint): boolean {
  const cr = calculateCollateralRatio(collateralValue, debt);
  return cr < PROTOCOL_PARAMS.MIN_COLLATERAL_RATIO;
}
