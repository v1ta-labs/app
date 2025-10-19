/**
 * Check transaction status and logs
 * Run with: bun scripts/check-transaction.ts <signature>
 */

import { Connection } from '@solana/web3.js';

async function main() {
  const signature = process.argv[2];

  if (!signature) {
    console.error('❌ Please provide a transaction signature');
    console.log('Usage: bun scripts/check-transaction.ts <signature>');
    process.exit(1);
  }

  console.log('🔍 Checking transaction:', signature);
  console.log('');

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  try {
    // Check signature status
    console.log('📊 Checking signature status...');
    const status = await connection.getSignatureStatus(signature);

    console.log('Status:', status);
    console.log('');

    if (!status || !status.value) {
      console.log('❌ Transaction not found on-chain');
      console.log('   This usually means:');
      console.log('   1. Transaction was never processed');
      console.log('   2. Transaction was dropped from mempool');
      console.log('   3. Insufficient priority fee');
      console.log('   4. RPC endpoint issue');
      process.exit(0);
    }

    console.log('✅ Transaction found!');
    console.log('   Confirmation status:', status.value.confirmationStatus);
    console.log('   Slot:', status.value.slot);
    console.log('   Error:', status.value.err || 'None');
    console.log('');

    // Get full transaction details
    console.log('📋 Fetching transaction details...');
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      console.log('❌ Could not fetch transaction details');
      process.exit(0);
    }

    console.log('✅ Transaction details retrieved');
    console.log('   Block time:', new Date((tx.blockTime || 0) * 1000).toISOString());
    console.log('   Slot:', tx.slot);
    console.log('   Fee:', tx.meta?.fee, 'lamports');
    console.log('   Compute units consumed:', tx.meta?.computeUnitsConsumed);
    console.log('');

    // Show logs
    if (tx.meta?.logMessages) {
      console.log('📝 Transaction Logs:');
      console.log('');
      tx.meta.logMessages.forEach((log, i) => {
        console.log(`   ${i + 1}. ${log}`);
      });
      console.log('');
    }

    // Check for errors
    if (tx.meta?.err) {
      console.log('❌ Transaction failed with error:');
      console.log('   ', JSON.stringify(tx.meta.err, null, 2));
      console.log('');
    } else {
      console.log('✅ Transaction succeeded!');
    }
  } catch (error) {
    console.error('❌ Error checking transaction:', error);
    process.exit(1);
  }
}

main().catch(console.error);
