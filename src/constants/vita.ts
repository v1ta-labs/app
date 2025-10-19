import { PublicKey } from '@solana/web3.js';

// V1TA Protocol Constants
export const V1TA_PROGRAM_ID = new PublicKey('6BMtX4X6i7bxr9P7uGfqr2XMG1RUeM5isxVVwtJdJsMR');

// Pyth Oracle (Devnet)
export const PYTH_SOL_USD_FEED = new PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');

// Protocol Parameters
export const MIN_COLLATERAL_RATIO = 11000; // 110% in basis points
export const MIN_DEBT = 1_000_000; // 1 VUSD (6 decimals)
export const BORROWING_FEE_RATE = 50; // 0.5% (50 basis points)
export const REDEMPTION_FEE_RATE = 50; // 0.5%
export const LIQUIDATION_PENALTY = 500; // 5% (500 basis points)
export const LIQUIDATOR_REWARD = 50; // 0.5% (50 basis points)

// Decimals
export const VUSD_DECIMALS = 6;
export const SOL_DECIMALS = 9;
export const PERCENTAGE_PRECISION = 10_000; // Basis points precision

// PDA Seeds
export const GLOBAL_STATE_SEED = 'global-state';
export const VUSD_MINT_SEED = 'vusd-mint';
export const POSITION_SEED = 'position';
export const STABILITY_POOL_SEED = 'stability-pool';
export const STABILITY_DEPOSIT_SEED = 'stability-deposit';
export const PROTOCOL_SOL_VAULT_SEED = 'protocol-sol-vault';

// Helper: Derive PDAs
export const getGlobalStatePDA = () =>
  PublicKey.findProgramAddressSync([Buffer.from(GLOBAL_STATE_SEED)], V1TA_PROGRAM_ID);

export const getVusdMintPDA = () =>
  PublicKey.findProgramAddressSync([Buffer.from(VUSD_MINT_SEED)], V1TA_PROGRAM_ID);

export const getStabilityPoolPDA = () =>
  PublicKey.findProgramAddressSync([Buffer.from(STABILITY_POOL_SEED)], V1TA_PROGRAM_ID);

export const getProtocolVaultPDA = () =>
  PublicKey.findProgramAddressSync([Buffer.from(PROTOCOL_SOL_VAULT_SEED)], V1TA_PROGRAM_ID);

export const getPositionPDA = (user: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from(POSITION_SEED), user.toBuffer()], V1TA_PROGRAM_ID);

export const getStabilityDepositPDA = (user: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from(STABILITY_DEPOSIT_SEED), user.toBuffer()],
    V1TA_PROGRAM_ID
  );
