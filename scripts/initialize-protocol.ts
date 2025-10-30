/**
 * Initialize V1TA Protocol on Devnet
 * Run from v1ta directory: npx tsx scripts/initialize-protocol.ts
 */

import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorProvider, Wallet, Program } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES modules __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import IDL
import IDL from '../src/lib/vita/idl/v1ta_devnet.json' assert { type: 'json' };
import { VITA_PROGRAM_ID, getGlobalStatePda, getVusdMintPda, getStabilityPoolPda, getProtocolVaultPda } from '../src/lib/vita/constants';

async function main() {
  console.log('🚀 Initializing V1TA Protocol on Devnet...\n');

  // Load deployer keypair from core repo
  const deployerKeypairPath = path.join(__dirname, '../../v1ta-core/keys/deployer.json');
  const deployerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(deployerKeypairPath, 'utf-8')))
  );
  console.log('Deployer:', deployerKeypair.publicKey.toString());

  // Setup connection and provider
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = new Wallet(deployerKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  // Load program - FIXED: provider is the third argument, programId is the second
  const program = new Program(IDL as any, provider);
  console.log('Program ID:', program.programId.toString());

  // Get PDAs
  const [globalState] = getGlobalStatePda();
  console.log('Global State PDA:', globalState.toString());

  const [vusdMint] = getVusdMintPda();
  console.log('VUSD Mint PDA:', vusdMint.toString());

  const [stabilityPool] = getStabilityPoolPda();
  console.log('Stability Pool PDA:', stabilityPool.toString());

  const [protocolSolVault] = getProtocolVaultPda();
  console.log('Protocol SOL Vault PDA:', protocolSolVault.toString());

  // Check if already initialized
  try {
    const existingState = await program.account.globalState.fetch(globalState);
    console.log('\n⚠️  Program already initialized!');
    console.log('Authority:', existingState.authority.toString());
    console.log('Total Collateral:', existingState.totalCollateral.toString());
    console.log('Total Debt:', existingState.totalDebt.toString());
    return;
  } catch (e) {
    console.log('\n✅ Program not yet initialized. Proceeding...\n');
  }

  // Initialize
  try {
    console.log('Sending initialize transaction...');
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: deployerKeypair.publicKey,
        globalState,
        vusdMint,
        stabilityPool,
        protocolSolVault,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log('✅ Initialization successful!');
    console.log('Transaction signature:', tx);
    console.log(`View on Solana Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet\n`);

    // Wait for confirmation
    await connection.confirmTransaction(tx, 'confirmed');

    // Fetch and display state
    const globalStateAccount = await program.account.globalState.fetch(globalState);
    console.log('Global State:');
    console.log('  Authority:', globalStateAccount.authority.toString());
    console.log('  Total Collateral:', globalStateAccount.totalCollateral.toString());
    console.log('  Total Debt:', globalStateAccount.totalDebt.toString());
    console.log('  VUSD Mint:', globalStateAccount.vusdMint.toString());

    const stabilityPoolAccount = await program.account.stabilityPool.fetch(stabilityPool);
    console.log('\nStability Pool:');
    console.log('  Total Deposits:', stabilityPoolAccount.totalDeposits.toString());
    console.log('  Total Collateral:', stabilityPoolAccount.totalCollateral.toString());

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    if ((error as any).logs) {
      console.error('\nProgram logs:');
      (error as any).logs.forEach((log: string) => console.error(log));
    }
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
