/**
 * Debug script to check if a position exists on-chain
 *
 * Run with: bun scripts/check-position.ts <wallet-address>
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { getPositionPda, PROTOCOL_PARAMS } from '../src/lib/vita/constants';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

async function main() {
  const walletAddress = process.argv[2];

  if (!walletAddress) {
    console.error('❌ Please provide a wallet address');
    console.log('Usage: bun scripts/check-position.ts <wallet-address>');
    process.exit(1);
  }

  console.log('🔍 Checking position for wallet:', walletAddress);
  console.log('');

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  try {
    const publicKey = new PublicKey(walletAddress);
    const [positionPDA] = getPositionPda(publicKey);

    console.log('📍 Position PDA:', positionPDA.toBase58());
    console.log('');

    // Fetch account info
    const accountInfo = await connection.getAccountInfo(positionPDA);

    if (!accountInfo) {
      console.log('❌ No position found for this wallet');
      console.log('   The position account does not exist on-chain');
      console.log('');
      console.log('💡 This could mean:');
      console.log('   1. No position was created yet');
      console.log('   2. The transaction failed');
      console.log('   3. Wrong wallet address');
      process.exit(0);
    }

    console.log('✅ Position account exists!');
    console.log('   Owner:', accountInfo.owner.toBase58());
    console.log('   Data length:', accountInfo.data.length, 'bytes');
    console.log('   Lamports:', accountInfo.lamports);
    console.log('');

    // Try to decode position data (basic check)
    // Position struct has: owner (32), collateral (8), debt (8), status (1+), etc.
    if (accountInfo.data.length >= 48) {
      // Read collateral (u64 at offset 32)
      const collateralBuffer = accountInfo.data.slice(32, 40);
      const collateral = Buffer.from(collateralBuffer).readBigUInt64LE();
      const collateralSol = Number(collateral) / LAMPORTS_PER_SOL;

      // Read debt (u64 at offset 40)
      const debtBuffer = accountInfo.data.slice(40, 48);
      const debt = Buffer.from(debtBuffer).readBigUInt64LE();
      const debtVusd = Number(debt) / (10 ** PROTOCOL_PARAMS.VUSD_DECIMALS);

      console.log('📊 Position Data (decoded):');
      console.log('   Collateral:', collateralSol.toFixed(4), 'SOL');
      console.log('   Debt:', debtVusd.toFixed(2), 'VUSD');
      console.log('');

      if (collateral === BigInt(0) && debt === BigInt(0)) {
        console.log('⚠️  Position has zero collateral and debt - might be closed or empty');
      } else {
        console.log('✅ Position looks valid with collateral and debt!');
      }
    }

  } catch (error) {
    console.error('❌ Error checking position:', error);
    process.exit(1);
  }
}

main().catch(console.error);
