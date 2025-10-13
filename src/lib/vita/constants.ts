import { PublicKey } from '@solana/web3.js';

/**
 * V1TA Protocol Constants - Devnet v0.1
 */
export const VITA_PROGRAM_ID = new PublicKey('D4PzAjCQtGL5n6b79fBJh5Z84GKJk1ruPCYn8914dsST');

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
