import { PublicKey } from '@solana/web3.js';

/**
 * V1TA Protocol Constants - Devnet v0.2 (LST Support)
 * Deployed: 2025-10-31
 * Upgrade Authority: 8K915LPudGjRrapmMCo6dp3ZCvdVRG8Qy7teCUX9k43B
 */
export const VITA_PROGRAM_ID = new PublicKey('6iNqEtF85a6ricFvzDvpH5XV6b2F4d5CK75SkyWiSBoW');

/**
 * Collateral Type Enum (must match Rust on-chain program)
 */
export enum CollateralType {
  NativeSOL = 0,
  JitoSOL = 1,
  MarinadeSOL = 2,
  USDStar = 3,
}

/**
 * PDA Seeds (must match Rust program exactly)
 */
export const SEEDS = {
  GLOBAL_STATE: 'global-state',
  VUSD_MINT: 'vusd-mint',
  POSITION: 'position',
  STABILITY_POOL: 'stability-pool',
  STABILITY_DEPOSIT: 'stability-deposit',
  PROTOCOL_SOL_VAULT: 'protocol-sol-vault',
} as const;

/**
 * Protocol Parameters
 */
export const PROTOCOL_PARAMS = {
  MIN_COLLATERAL_RATIO: 11000, // 110% in basis points
  MIN_DEBT: 1_000_000, // 1 VUSD (6 decimals)
  BORROWING_FEE_RATE: 50, // 0.5% (50 basis points)
  REDEMPTION_FEE_RATE: 50, // 0.5%
  LIQUIDATION_PENALTY: 500, // 5% (500 basis points)
  LIQUIDATOR_REWARD: 50, // 0.5% (50 basis points)
  PERCENTAGE_PRECISION: 10_000, // Basis points
  VUSD_DECIMALS: 6,
  SOL_DECIMALS: 9,
} as const;

/**
 * Pyth Oracle (Devnet)
 */
export const PYTH_SOL_USD_FEED = new PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');

/**
 * Derive PDAs
 */
export function getGlobalStatePda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from(SEEDS.GLOBAL_STATE)], VITA_PROGRAM_ID);
}

export function getVusdMintPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from(SEEDS.VUSD_MINT)], VITA_PROGRAM_ID);
}

export function getStabilityPoolPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from(SEEDS.STABILITY_POOL)], VITA_PROGRAM_ID);
}

export function getProtocolVaultPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from(SEEDS.PROTOCOL_SOL_VAULT)], VITA_PROGRAM_ID);
}

export function getPositionPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.POSITION), owner.toBuffer()],
    VITA_PROGRAM_ID
  );
}

export function getStabilityDepositPda(depositor: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.STABILITY_DEPOSIT), depositor.toBuffer()],
    VITA_PROGRAM_ID
  );
}

/**
 * Calculate Collateral Ratio
 * @param collateralSol - Collateral in SOL
 * @param solPrice - SOL price in USD
 * @param debtVusd - Debt in VUSD
 * @returns Collateral ratio as percentage (e.g., 150 for 150%)
 */
export function calculateCollateralRatio(
  collateralSol: number,
  solPrice: number,
  debtVusd: number
): number {
  if (debtVusd === 0) return Infinity;
  return ((collateralSol * solPrice) / debtVusd) * 100;
}

/**
 * Calculate collateral ratio from bigint values (for internal calculations)
 * @param collateralValue - Collateral value in USD (as bigint with 9 decimals)
 * @param debt - Debt in VUSD (as bigint)
 * @returns Collateral ratio as percentage
 */
export function calculateCollateralRatioFromBigInt(collateralValue: bigint, debt: bigint): number {
  if (debt === BigInt(0)) return Infinity;
  return Number((collateralValue * BigInt(100)) / debt);
}

/**
 * Check if position is liquidatable
 */
export function isLiquidatable(cr: number): boolean {
  return cr < 110;
}

/**
 * Calculate liquidation penalty (5%)
 */
export function calculateLiquidationPenalty(collateral: bigint): bigint {
  return (
    (collateral * BigInt(PROTOCOL_PARAMS.LIQUIDATION_PENALTY)) /
    BigInt(PROTOCOL_PARAMS.PERCENTAGE_PRECISION)
  );
}
