import { AnchorProvider, Program, BN, Wallet } from '@coral-xyz/anchor';
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  ComputeBudgetProgram,
  TransactionInstruction,
} from '@solana/web3.js';
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
  CollateralType,
} from './constants';
import type {
  GlobalState,
  Position,
  PositionHealth,
  StabilityPool,
  StabilityDeposit,
} from './types';
import IDL from './idl/v1ta_devnet.json';
import { ReownWalletAdapter } from './reown-wallet-adapter';
import { sanctumGateway } from '@/lib/sanctum';

export interface V1TAClientOptions {
  useSanctumGateway?: boolean;
  cuPriceRange?: 'low' | 'medium' | 'high';
  jitoTipRange?: 'low' | 'medium' | 'high' | 'max';
}

export class V1TAClient {
  private options: V1TAClientOptions;

  constructor(
    public program: Program,
    public provider: AnchorProvider,
    options?: V1TAClientOptions
  ) {
    this.options = {
      useSanctumGateway: false, // Disabled by default
      cuPriceRange: 'medium',
      jitoTipRange: 'medium',
      ...options,
    };
  }

  static async create(
    connection: Connection,
    walletProviderOrAdapter: any,
    publicKey?: PublicKey,
    options?: V1TAClientOptions
  ): Promise<V1TAClient> {
    console.log('V1TAClient.create called');
    console.log('walletProviderOrAdapter type:', typeof walletProviderOrAdapter);
    console.log('walletProviderOrAdapter keys:', Object.keys(walletProviderOrAdapter || {}));
    console.log('publicKey provided:', publicKey?.toBase58());

    let wallet: Wallet;

    // Always use ReownWalletAdapter when publicKey is provided
    // This ensures we access window.phantom.solana directly
    if (publicKey) {
      console.log('Creating ReownWalletAdapter to access Phantom directly');
      wallet = new ReownWalletAdapter(walletProviderOrAdapter, publicKey) as any;
      console.log('Adapter created successfully');
    } else if (
      walletProviderOrAdapter?.publicKey instanceof PublicKey &&
      walletProviderOrAdapter?.signTransaction
    ) {
      console.log('Using existing wallet adapter (already a proper Wallet)');
      wallet = walletProviderOrAdapter as Wallet;
    } else {
      throw new Error(
        'Invalid wallet provider - must provide publicKey or a proper Wallet adapter'
      );
    }

    console.log('Creating AnchorProvider with wallet publicKey:', wallet.publicKey.toBase58());

    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });

    console.log('Provider created, wallet publicKey:', provider.wallet.publicKey.toBase58());

    const program = new Program(IDL as any, provider);
    console.log('Program created');

    return new V1TAClient(program, provider, options);
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
  async openPosition(
    collateralSol: number,
    borrowVusd: number,
    collateralType: CollateralType = CollateralType.NativeSOL
  ) {
    console.log('=== openPosition Debug ===');
    console.log('Wallet publicKey:', this.provider.wallet.publicKey.toBase58());
    console.log('Collateral Type:', CollateralType[collateralType]);

    const collateral = new BN(collateralSol * LAMPORTS_PER_SOL);
    const borrow = new BN(borrowVusd * 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS);

    console.log('Collateral:', collateral.toString(), 'lamports');
    console.log('Borrow:', borrow.toString(), 'VUSD (6 decimals)');

    const userVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );

    console.log('PDAs:');
    console.log('- globalState:', this.pdas.globalState.toBase58());
    console.log('- position:', this.pdas.position.toBase58());
    console.log('- vusdMint:', this.pdas.vusdMint.toBase58());
    console.log('- protocolSolVault:', this.pdas.protocolVault.toBase58());
    console.log('- userVusdAccount:', userVusdAccount.toBase58());

    console.log(
      'Sending transaction via Anchor RPC (no compute budget - let Phantom handle it)...'
    );
    console.log(
      'Sanctum Gateway:',
      this.options.useSanctumGateway ? 'ENABLED' : 'DISABLED (can enable for optimized delivery)'
    );

    try {
      // Convert CollateralType enum to Anchor format
      const collateralTypeVariant = (() => {
        switch (collateralType) {
          case CollateralType.NativeSOL:
            return { nativeSol: {} };
          case CollateralType.JitoSOL:
            return { jitoSol: {} };
          case CollateralType.MarinadeSOL:
            return { marinadeSol: {} };
          case CollateralType.USDStar:
            return { usdStar: {} };
          default:
            return { nativeSol: {} };
        }
      })();

      let signature: string;

      if (this.options.useSanctumGateway) {
        // Use Sanctum Gateway for optimized transaction delivery
        console.log('🚀 Using Sanctum Gateway for optimized transaction delivery...');

        const tx = await this.program.methods
          .openPosition(collateralTypeVariant, collateral, borrow)
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
          .transaction();

        // Get recent blockhash
        const { blockhash } = await this.provider.connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = this.provider.wallet.publicKey;

        // Sign transaction
        const signedTx = await this.provider.wallet.signTransaction(tx);

        // Send through Sanctum Gateway
        const gatewayResult = await sanctumGateway.sendTransaction(signedTx, 'devnet');

        // Extract signature from Gateway response
        signature = gatewayResult.result?.signature || gatewayResult.result?.txSignature || '';

        console.log('✅ Transaction sent via Sanctum Gateway!');
        console.log('Gateway result:', gatewayResult);
      } else {
        // Use standard Anchor RPC (let Phantom handle compute budget)
        signature = await this.program.methods
          .openPosition(collateralTypeVariant, collateral, borrow)
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

        console.log('✅ Transaction confirmed via standard RPC!');
      }

      console.log('Signature:', signature);
      console.log(
        `View on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
      );

      return signature;
    } catch (error) {
      throw error;
    }
  }

  // Adjust Position
  async adjustPosition(collateralChangeSol: number, debtChangeVusd: number) {
    console.log('=== adjustPosition Debug ===');
    console.log('Wallet publicKey:', this.provider.wallet.publicKey.toBase58());

    const collateralChange = new BN(collateralChangeSol * LAMPORTS_PER_SOL);
    const debtChange = new BN(debtChangeVusd * 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS);

    console.log('Collateral change:', collateralChange.toString(), 'lamports');
    console.log('Debt change:', debtChange.toString(), 'VUSD (6 decimals)');

    const userVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );

    console.log('PDAs:');
    console.log('- globalState:', this.pdas.globalState.toBase58());
    console.log('- position:', this.pdas.position.toBase58());
    console.log('- vusdMint:', this.pdas.vusdMint.toBase58());
    console.log('- protocolSolVault:', this.pdas.protocolVault.toBase58());
    console.log('- userVusdAccount:', userVusdAccount.toBase58());

    console.log('Sending adjust position transaction...');

    try {
      const signature = await this.program.methods
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

      console.log('✅ Position adjusted successfully!');
      console.log('Signature:', signature);
      console.log(
        `View on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
      );

      return signature;
    } catch (error) {
      throw error;
    }
  }

  // Close Position
  async closePosition() {
    console.log('=== closePosition Debug ===');
    console.log('Wallet publicKey:', this.provider.wallet.publicKey.toBase58());

    const userVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );

    console.log('PDAs:');
    console.log('- globalState:', this.pdas.globalState.toBase58());
    console.log('- position:', this.pdas.position.toBase58());
    console.log('- vusdMint:', this.pdas.vusdMint.toBase58());
    console.log('- protocolSolVault:', this.pdas.protocolVault.toBase58());
    console.log('- userVusdAccount:', userVusdAccount.toBase58());

    console.log('Sending close position transaction...');

    try {
      const signature = await this.program.methods
        .closePosition()
        .accounts({
          user: this.provider.wallet.publicKey,
          globalState: this.pdas.globalState,
          position: this.pdas.position,
          vusdMint: this.pdas.vusdMint,
          userVusdAccount,
          protocolSolVault: this.pdas.protocolVault,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log('✅ Position closed successfully!');
      console.log('Signature:', signature);
      console.log(
        `View on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
      );

      return signature;
    } catch (error) {
      // Let the UI handle error logging and display
      throw error;
    }
  }

  // Deposit to Stability Pool
  async depositStability(amountVusd: number) {
    const amount = new BN(amountVusd * 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS);

    const depositorVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.provider.wallet.publicKey
    );

    const stabilityPoolVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.pdas.stabilityPool,
      true // allowOwnerOffCurve - stability pool is a PDA
    );

    return await this.program.methods
      .depositStability(amount)
      .accounts({
        depositor: this.provider.wallet.publicKey,
        globalState: this.pdas.globalState,
        stabilityPool: this.pdas.stabilityPool,
        vusdMint: this.pdas.vusdMint,
        depositorVusdAccount,
        stabilityPoolVusdAccount,
        stabilityDeposit: this.pdas.stabilityDeposit,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
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

    const stabilityPoolVusdAccount = await getAssociatedTokenAddress(
      this.pdas.vusdMint,
      this.pdas.stabilityPool,
      true // allowOwnerOffCurve - stability pool is a PDA
    );

    return await this.program.methods
      .withdrawStability(amount)
      .accounts({
        depositor: this.provider.wallet.publicKey,
        stabilityPool: this.pdas.stabilityPool,
        stabilityDeposit: this.pdas.stabilityDeposit,
        vusdMint: this.pdas.vusdMint,
        stabilityPoolVusdAccount,
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
        systemProgram: SystemProgram.programId,
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
      this.pdas.stabilityPool,
      true // allowOwnerOffCurve - stability pool is a PDA
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
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  // Fetch Global State
  async getGlobalState(): Promise<GlobalState | null> {
    try {
      return await (this.program.account as any).globalState.fetch(this.pdas.globalState);
    } catch {
      return null;
    }
  }

  // Fetch Position
  async getPosition(user?: PublicKey): Promise<Position | null> {
    try {
      const [positionPDA] = getPositionPda(user || this.provider.wallet.publicKey);
      return await (this.program.account as any).position.fetch(positionPDA);
    } catch {
      return null;
    }
  }

  // Fetch Stability Pool
  async getStabilityPool(): Promise<StabilityPool | null> {
    try {
      return await (this.program.account as any).stabilityPool.fetch(this.pdas.stabilityPool);
    } catch {
      return null;
    }
  }

  // Fetch User's Stability Deposit
  async getStabilityDeposit(user?: PublicKey): Promise<StabilityDeposit | null> {
    try {
      const [depositPDA] = getStabilityDepositPda(user || this.provider.wallet.publicKey);
      return await (this.program.account as any).stabilityDeposit.fetch(depositPDA);
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
    const positions = await (this.program.account as any).position.all();

    return positions
      .filter((p: any) => {
        if (!('active' in p.account.status)) return false;
        if (p.account.debt.toNumber() === 0) return false;

        const colSol = p.account.collateral.toNumber() / LAMPORTS_PER_SOL;
        const debtVusd = p.account.debt.toNumber() / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS;
        const cr = calculateCollateralRatio(colSol, solPriceUsd, debtVusd);

        return cr < 110;
      })
      .map((p: any) => p.account.owner);
  }
}
