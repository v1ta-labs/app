import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

const PROGRAM_ID = new PublicKey('6BMtX4X6i7bxr9P7uGfqr2XMG1RUeM5isxVVwtJdJsMR');
const VUSD_MINT_SEED = 'vusd-mint';

// Get user wallet from command line argument
const userWallet = process.argv[2];

if (!userWallet) {
  console.error('Usage: bun scripts/check-vusd-balance.ts <WALLET_ADDRESS>');
  process.exit(1);
}

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Derive vUSD mint PDA
  const [vusdMint] = PublicKey.findProgramAddressSync(
    [Buffer.from(VUSD_MINT_SEED)],
    PROGRAM_ID
  );

  console.log('vUSD Mint:', vusdMint.toBase58());
  console.log('User Wallet:', userWallet);

  // Get user's vUSD ATA
  const userVusdAccount = await getAssociatedTokenAddress(vusdMint, new PublicKey(userWallet));

  console.log('User vUSD ATA:', userVusdAccount.toBase58());

  // Check if account exists
  const accountInfo = await connection.getAccountInfo(userVusdAccount);

  if (!accountInfo) {
    console.log('\n❌ vUSD token account does not exist yet');
    console.log('This is normal if you just created a position.');
    console.log('The account will be created when you borrow vUSD.');
    return;
  }

  console.log('\n✅ vUSD token account exists!');

  // Get balance
  const balance = await connection.getTokenAccountBalance(userVusdAccount);

  console.log('\nvUSD Balance:', balance.value.uiAmount, 'vUSD');
  console.log('Raw amount:', balance.value.amount);
  console.log('Decimals:', balance.value.decimals);
}

main().catch(console.error);
