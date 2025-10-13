import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { VITA_PROGRAM_ID, getStabilityPoolPda, getStabilityDepositPda } from './constants';

/**
 * Stability Pool State (matches on-chain account)
 */
export interface StabilityPoolState {
  totalVusd: bigint;
  totalCollateralGains: Record<string, bigint>;
  epoch: bigint;
  bump: number;
}

/**
 * Stability Deposit State (matches on-chain account)
 */
export interface StabilityDepositState {
  depositor: PublicKey;
  amount: bigint;
  collateralGains: Record<string, bigint>;
  epoch: bigint;
  bump: number;
}

/**
 * Fetch stability pool state from blockchain
 */
export async function fetchStabilityPool(
  connection: Connection
): Promise<StabilityPoolState | null> {
  const [poolPda] = await getStabilityPoolPda();

  try {
    const accountInfo = await connection.getAccountInfo(poolPda);
    if (!accountInfo) return null;

    return parseStabilityPoolAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching stability pool:', error);
    return null;
  }
}

/**
 * Fetch user's stability deposit
 */
export async function fetchStabilityDeposit(
  connection: Connection,
  depositor: PublicKey
): Promise<StabilityDepositState | null> {
  const [depositPda] = await getStabilityDepositPda(depositor);

  try {
    const accountInfo = await connection.getAccountInfo(depositPda);
    if (!accountInfo) return null;

    return parseStabilityDepositAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching stability deposit:', error);
    return null;
  }
}

/**
 * Parse stability pool account data
 * TODO: Implement proper borsh deserialization when schema is available
 */
function parseStabilityPoolAccount(data: Buffer): StabilityPoolState | null {
  try {
    // Placeholder - will need actual borsh schema
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Parse stability deposit account data
 * TODO: Implement proper borsh deserialization when schema is available
 */
function parseStabilityDepositAccount(data: Buffer): StabilityDepositState | null {
  try {
    // Placeholder - will need actual borsh schema
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Create instruction to deposit to stability pool
 */
export async function createDepositStabilityInstruction(
  depositor: PublicKey,
  amount: bigint
): Promise<TransactionInstruction> {
  const [poolPda] = await getStabilityPoolPda();
  const [depositPda] = await getStabilityDepositPda(depositor);

  const instructionData = Buffer.alloc(1 + 8);
  instructionData.writeUInt8(5, 0); // DepositStability discriminator
  instructionData.writeBigUInt64LE(amount, 1);

  const keys = [
    { pubkey: depositor, isSigner: true, isWritable: true },
    { pubkey: poolPda, isSigner: false, isWritable: true },
    { pubkey: depositPda, isSigner: false, isWritable: true },
    // Add other required accounts (VUSD token account, etc.)
  ];

  return new TransactionInstruction({
    keys,
    programId: VITA_PROGRAM_ID,
    data: instructionData,
  });
}

/**
 * Create instruction to withdraw from stability pool
 */
export async function createWithdrawStabilityInstruction(
  depositor: PublicKey,
  amount: bigint
): Promise<TransactionInstruction> {
  const [poolPda] = await getStabilityPoolPda();
  const [depositPda] = await getStabilityDepositPda(depositor);

  const instructionData = Buffer.alloc(1 + 8);
  instructionData.writeUInt8(6, 0); // WithdrawStability discriminator
  instructionData.writeBigUInt64LE(amount, 1);

  const keys = [
    { pubkey: depositor, isSigner: true, isWritable: true },
    { pubkey: poolPda, isSigner: false, isWritable: true },
    { pubkey: depositPda, isSigner: false, isWritable: true },
  ];

  return new TransactionInstruction({
    keys,
    programId: VITA_PROGRAM_ID,
    data: instructionData,
  });
}

/**
 * Calculate user's share of stability pool
 */
export function calculatePoolShare(userDeposit: bigint, totalPoolVusd: bigint): number {
  if (totalPoolVusd === 0n) return 0;
  return Number((userDeposit * 10000n) / totalPoolVusd) / 100; // Returns percentage
}

/**
 * Calculate expected collateral gains for a deposit
 */
export function calculateExpectedGains(
  userDeposit: bigint,
  totalPoolVusd: bigint,
  totalCollateralGains: bigint
): bigint {
  if (totalPoolVusd === 0n) return 0n;
  return (userDeposit * totalCollateralGains) / totalPoolVusd;
}

/**
 * Get stability pool metrics
 */
export interface StabilityPoolMetrics {
  totalVusd: bigint;
  userDeposit: bigint;
  userShare: number;
  pendingGains: Record<string, bigint>;
  apr: number; // Estimated APR based on recent liquidations
}

export async function getStabilityPoolMetrics(
  connection: Connection,
  depositor: PublicKey
): Promise<StabilityPoolMetrics | null> {
  const pool = await fetchStabilityPool(connection);
  const deposit = await fetchStabilityDeposit(connection, depositor);

  if (!pool) return null;

  const userDeposit = deposit?.amount || 0n;
  const userShare = calculatePoolShare(userDeposit, pool.totalVusd);

  // Calculate pending gains based on pool's total collateral gains
  const pendingGains: Record<string, bigint> = {};
  for (const [collateralType, totalGain] of Object.entries(pool.totalCollateralGains)) {
    const userGain = calculateExpectedGains(userDeposit, pool.totalVusd, totalGain);
    const alreadyClaimed = deposit?.collateralGains[collateralType] || 0n;
    pendingGains[collateralType] = userGain > alreadyClaimed ? userGain - alreadyClaimed : 0n;
  }

  // TODO: Calculate APR based on historical liquidation data
  const apr = 0;

  return {
    totalVusd: pool.totalVusd,
    userDeposit,
    userShare,
    pendingGains,
    apr,
  };
}
