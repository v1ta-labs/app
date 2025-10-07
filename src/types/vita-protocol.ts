import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export interface LendingPool {
  authority: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  totalDeposits: BN;
  totalBorrows: BN;
  interestRate: BN;
  lastUpdateSlot: BN;
  collateralRatio: number;
  liquidationThreshold: number;
  bump: number;
}

export interface UserPosition {
  owner: PublicKey;
  pool: PublicKey;
  collateralAmount: BN;
  borrowedAmount: BN;
  lastInterestAccrual: BN;
  healthFactor: number;
  bump: number;
}

export interface StabilityPool {
  authority: PublicKey;
  totalDeposits: BN;
  rewardPerToken: BN;
  lastUpdateSlot: BN;
  bump: number;
}

export interface Vault {
  pool: PublicKey;
  mint: PublicKey;
  balance: BN;
  bump: number;
}

export interface InitializePoolParams {
  mint: PublicKey;
  interestRate: number;
  collateralRatio: number;
  liquidationThreshold: number;
}

export interface DepositParams {
  amount: BN;
}

export interface BorrowParams {
  amount: BN;
}

export interface RepayParams {
  amount: BN;
}

export interface WithdrawParams {
  amount: BN;
}

export interface LiquidateParams {
  position: PublicKey;
  liquidator: PublicKey;
}

export interface PoolInitializedEvent {
  pool: PublicKey;
  mint: PublicKey;
  timestamp: BN;
}

export interface DepositEvent {
  user: PublicKey;
  pool: PublicKey;
  amount: BN;
  timestamp: BN;
}

export interface BorrowEvent {
  user: PublicKey;
  pool: PublicKey;
  amount: BN;
  timestamp: BN;
}

export interface RepayEvent {
  user: PublicKey;
  pool: PublicKey;
  amount: BN;
  timestamp: BN;
}

export interface WithdrawEvent {
  user: PublicKey;
  pool: PublicKey;
  amount: BN;
  timestamp: BN;
}

export interface LiquidationEvent {
  liquidator: PublicKey;
  position: PublicKey;
  amount: BN;
  timestamp: BN;
}

export type VitaProtocolIDL = unknown;
