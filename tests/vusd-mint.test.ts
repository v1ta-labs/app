/**
 * V1TA vUSD Minting Integration Test
 *
 * Run with: bun tests/vusd-mint.test.ts
 *
 * Requirements:
 * - Set SOLANA_PRIVATE_KEY in .env.test (JSON array of numbers)
 * - Or have devnet SOL in the generated keypair
 */

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { V1TAClient, PROTOCOL_PARAMS } from '../src/lib/vita';
import { getAssociatedTokenAddress } from '@solana/spl-token';

async function main() {
  console.log('🧪 V1TA vUSD Minting Integration Test\n');

  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Load or generate keypair
  let payer: Keypair;
  const privateKey = process.env.SOLANA_PRIVATE_KEY;

  if (privateKey) {
    const secretKey = Uint8Array.from(JSON.parse(privateKey));
    payer = Keypair.fromSecretKey(secretKey);
    console.log('✅ Loaded keypair from environment');
  } else {
    payer = Keypair.generate();
    console.log('✅ Generated new keypair for testing');
    console.log('   Public Key:', payer.publicKey.toBase58());
    console.log('   ⚠️  Please airdrop SOL to this address on devnet');

    // Try to request airdrop
    try {
      console.log('   Requesting airdrop...');
      const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: airdropSignature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });
      console.log('   ✅ Airdrop successful');
    } catch (error) {
      console.error('   ❌ Airdrop failed:', error);
      console.log('   Please manually airdrop SOL and run again');
      process.exit(1);
    }
  }

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`\n💰 Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL\n`);

  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    console.error('❌ Insufficient SOL balance. Need at least 0.1 SOL for testing.');
    process.exit(1);
  }

  // Create V1TA client
  console.log('🔧 Creating V1TA client...');
  const client = await V1TAClient.create(connection, payer, payer.publicKey);
  console.log('✅ V1TA client created\n');

  // Test parameters
  const collateralSol = 0.1; // 0.1 SOL collateral
  const borrowVusd = 15; // Borrow 15 vUSD

  console.log('📝 Test Parameters:');
  console.log(`   Collateral: ${collateralSol} SOL`);
  console.log(`   Borrow: ${borrowVusd} vUSD\n`);

  // Get vUSD token account
  const vusdMint = client.pdas.vusdMint;
  const userVusdAccount = await getAssociatedTokenAddress(vusdMint, payer.publicKey);

  // Check initial vUSD balance
  let initialBalance = 0;
  try {
    const accountInfo = await connection.getTokenAccountBalance(userVusdAccount);
    initialBalance = Number(accountInfo.value.amount) / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS;
    console.log(`📊 Initial vUSD balance: ${initialBalance} vUSD`);
  } catch {
    console.log('📊 No existing vUSD account (will be created)');
  }

  // Open position (this mints vUSD)
  console.log('\n🚀 Opening position...');
  console.log('   (This will send a transaction to Solana devnet)');

  try {
    const signature = await client.openPosition(collateralSol, borrowVusd);

    console.log('\n✅ Position opened successfully!');
    console.log(`   Transaction: ${signature}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet\n`);

    // Wait a bit for full confirmation
    console.log('⏳ Waiting for final confirmation...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check vUSD balance after
    console.log('📊 Checking vUSD balance...');
    const accountInfo = await connection.getTokenAccountBalance(userVusdAccount);
    const finalBalance = Number(accountInfo.value.amount) / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS;

    console.log(`   Final vUSD balance: ${finalBalance} vUSD`);
    console.log(`   vUSD minted: ${finalBalance - initialBalance} vUSD`);

    // Verify position was created
    console.log('\n📊 Checking position details...');
    const position = await client.getPosition();

    if (position) {
      const collateral = position.collateral.toNumber() / LAMPORTS_PER_SOL;
      const debt = position.debt.toNumber() / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS;

      console.log(`   Collateral: ${collateral} SOL`);
      console.log(`   Debt: ${debt} vUSD`);

      // Verify amounts match
      if (Math.abs(finalBalance - initialBalance - borrowVusd) < 0.01) {
        console.log('\n✅ TEST PASSED: vUSD minted correctly!');
      } else {
        console.log('\n⚠️  WARNING: vUSD amount mismatch');
        console.log(`   Expected: ${borrowVusd} vUSD`);
        console.log(`   Got: ${finalBalance - initialBalance} vUSD`);
      }

      // Check position health
      const estimatedSolPrice = 200; // Estimate for testing
      const health = await client.getPositionHealth(estimatedSolPrice);

      if (health) {
        console.log('\n📊 Position Health:');
        console.log(`   Collateral Ratio: ${health.collateralRatio}%`);
        console.log(`   Collateral Value: $${health.collateralValue}`);
        console.log(`   Debt Value: ${health.debtValue} vUSD`);
        console.log(`   Status: ${health.status}`);
        console.log(`   Healthy: ${health.isHealthy ? '✅' : '❌'}`);

        if (health.collateralRatio >= 110 && health.isHealthy) {
          console.log('\n✅ TEST PASSED: Position is healthy!');
        } else {
          console.log('\n❌ TEST FAILED: Position is not healthy!');
        }
      }
    } else {
      console.log('\n❌ TEST FAILED: Position not found!');
    }
  } catch (error) {
    console.error('\n❌ TEST FAILED: Error opening position');
    console.error('   Error:', error);
    process.exit(1);
  }

  console.log('\n✅ All tests completed!\n');
}

// Run tests
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
