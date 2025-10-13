import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export interface GlobalState {
  authority: PublicKey;
  vusdMint: PublicKey;
  stabilityPool: PublicKey;
  totalCollateral: BN;
  totalDebt: BN;
  baseRate: BN;
  lastFeeOperationTime: BN;
  totalPositions: BN;
  bump: number;
}

export interface Position {
  owner: PublicKey;
  collateral: BN;
  debt: BN;
  status:
    | { active: Record<string, never> }
    | { closed: Record<string, never> }
    | { liquidated: Record<string, never> };
  bump: number;
}

export interface StabilityPool {
  totalVusdDeposited: BN;
  totalSolRewards: BN;
  productSnapshot: BN;
  epoch: BN;
  bump: number;
}

export interface StabilityDeposit {
  depositor: PublicKey;
  amount: BN;
  solRewardEarned: BN;
  productSnapshot: BN;
  epochSnapshot: BN;
  bump: number;
}

export interface PositionHealth {
  collateralRatio: number;
  collateralValue: number;
  debtValue: number;
  isHealthy: boolean;
  status: 'Healthy' | 'At Risk' | 'Liquidatable';
}
