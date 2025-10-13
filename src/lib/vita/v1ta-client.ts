import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  PYTH_SOL_USD_FEED,
  PROTOCOL_PARAMS,
  getGlobalStatePda,
  getVusdMintPda,
  getStabilityPoolPda,
  getProtocolVaultPda,
  getPositionPda,
  getStabilityDepositPda,
  calculateCollateralRatio,
} from './constants';
import type { GlobalState, Position, PositionHealth, StabilityPool } from './types';
import IDL from './idl/v1ta_devnet.json';

export class V1TAClient {
  constructor(
    public program: Program,
    public provider: AnchorProvider
  ) {}

  static async create(connection: Connection, wallet: any): Promise<V1TAClient> {
    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    const program = new Program(IDL as any, provider);
    return new V1TAClient(program, provider);
  }

  // PDAs
  get pdas() {
    const [globalState] = getGlobalStatePda();
    const [vusdMint] = getVusdMintPda();
    const [stabilityPool] = getStabilityPoolPda();
    const [protocolVault] = getProtocolVaultPda();
    const [position] = getPositionPda(this.provider.wallet.publicKey);
    const [stabilityDeposit] = getStabilityDepositPda(this.provider.wallet.publicKey);

    return { globalState, vusdMint, stabilityPool, protocolVault, position, stabilityDeposit };
  }

  // Open Position
  async openPosition(collateralSol: number, borrowVusd: number) {
    const collateral = new BN(collateralSol * LAMPORTS_PER_SOL);
    const borrow = new BN(borrowVusd * 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS);

    const userVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );

    return await this.program.methods
      .openPosition(collateral, borrow)
      .accounts({
        user: this.provider.wallet.publicKey,
        globalState: this.pdas.globalState,
        position: this.pdas.position,
        vusdMint: this.pdas.vusdMint,
        userVusdAccount,
        protocolSolVault: this.pdas.protocolVault,
        priceUpdate: PYTH_SOL_USD_FEED,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  // Adjust Position
  async adjustPosition(collateralChangeSol: number, debtChangeVusd: number) {
    const collateralChange = new BN(collateralChangeSol * LAMPORTS_PER_SOL);
    const debtChange = new BN(debtChangeVusd * 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS);

    const userVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );

    return await this.program.methods
      .adjustPosition(collateralChange, debtChange)
      .accounts({
        user: this.provider.wallet.publicKey,
        globalState: this.pdas.globalState,
        position: this.pdas.position,
        vusdMint: this.pdas.vusdMint,
        userVusdAccount,
        protocolSolVault: this.pdas.protocolVault,
        priceUpdate: PYTH_SOL_USD_FEED,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  // Close Position
  async closePosition() {
    const userVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );

    return await this.program.methods
      .closePosition()
      .accounts({
        user: this.provider.wallet.publicKey,
        globalState: this.pdas.globalState,
        position: this.pdas.position,
        vusdMint: this.pdas.vusdMint,
        userVusdAccount,
        protocolSolVault: this.pdas.protocolVault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  // Deposit to Stability Pool
  async depositStability(amountVusd: number) {
    const amount = new BN(amountVusd * 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS);

    const depositorVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );

    return await this.program.methods
      .depositStability(amount)
      .accounts({
        depositor: this.provider.wallet.publicKey,
        globalState: this.pdas.globalState,
        stabilityPool: this.pdas.stabilityPool,
        vusdMint: this.pdas.vusdMint,
        depositorVusdAccount,
        stabilityDeposit: this.pdas.stabilityDeposit,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  // Withdraw from Stability Pool
  async withdrawStability(amountVusd: number) {
    const amount = new BN(amountVusd * 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS);

    const depositorVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );

    return await this.program.methods
      .withdrawStability(amount)
      .accounts({
        depositor: this.provider.wallet.publicKey,
        stabilityPool: this.pdas.stabilityPool,
        stabilityDeposit: this.pdas.stabilityDeposit,
        vusdMint: this.pdas.vusdMint,
        depositorVusdAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  // Redeem VUSD for SOL
  async redeem(amountVusd: number) {
    const amount = new BN(amountVusd * 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS);

    const redeemerVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );

    return await this.program.methods
      .redeem(amount)
      .accounts({
        redeemer: this.provider.wallet.publicKey,
        globalState: this.pdas.globalState,
        vusdMint: this.pdas.vusdMint,
        redeemerVusdAccount,
        protocolSolVault: this.pdas.protocolVault,
        priceUpdate: PYTH_SOL_USD_FEED,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  // Liquidate Position
  async liquidate(positionOwner: PublicKey) {
    const [position] = getPositionPda(positionOwner);
    const liquidatorVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );
    const stabilityPoolVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.pdas.stabilityPool
    );

    return await this.program.methods
      .liquidate()
      .accounts({
        liquidator: this.provider.wallet.publicKey,
        globalState: this.pdas.globalState,
        position,
        positionOwner,
        stabilityPool: this.pdas.stabilityPool,
        vusdMint: this.pdas.vusdMint,
        stabilityPoolVusdAccount,
        liquidatorVusdAccount,
        protocolSolVault: this.pdas.protocolVault,
        priceUpdate: PYTH_SOL_USD_FEED,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  // Fetch Global State
  async getGlobalState(): Promise<GlobalState | null> {
    try {
      return await this.program.account.globalState.fetch(this.pdas.globalState);
    } catch {
      return null;
    }
  }

  // Fetch Position
  async getPosition(user?: PublicKey): Promise<Position | null> {
    try {
      const [positionPDA] = getPositionPda(user || this.provider.wallet.publicKey);
      return await this.program.account.position.fetch(positionPDA);
    } catch {
      return null;
    }
  }

  // Fetch Stability Pool
  async getStabilityPool(): Promise<StabilityPool | null> {
    try {
      return await this.program.account.stabilityPool.fetch(this.pdas.stabilityPool);
    } catch {
      return null;
    }
  }

  // Calculate Position Health
  async getPositionHealth(solPriceUsd: number, user?: PublicKey): Promise<PositionHealth | null> {
    const position = await this.getPosition(user);
    if (!position) return null;

    const collateralSol = position.collateral.toNumber() / LAMPORTS_PER_SOL;
    const debtVusd = position.debt.toNumber() / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS;

    const collateralRatio = calculateCollateralRatio(collateralSol, solPriceUsd, debtVusd);
    const collateralValue = collateralSol * solPriceUsd;
    const isHealthy = collateralRatio >= 110;
    const status =
      collateralRatio >= 150 ? 'Healthy' : collateralRatio >= 110 ? 'At Risk' : 'Liquidatable';

    return { collateralRatio, collateralValue, debtValue: debtVusd, isHealthy, status };
  }

  // Find All Liquidatable Positions
  async findLiquidatablePositions(solPriceUsd: number): Promise<PublicKey[]> {
    const positions = await this.program.account.position.all();

    return positions
      .filter(p => {
        if (!('active' in p.account.status)) return false;
        if (p.account.debt.toNumber() === 0) return false;

        const colSol = p.account.collateral.toNumber() / LAMPORTS_PER_SOL;
        const debtVusd = p.account.debt.toNumber() / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS;
        const cr = calculateCollateralRatio(colSol, solPriceUsd, debtVusd);

        return cr < 110;
      })
      .map(p => p.account.owner);
  }
}
