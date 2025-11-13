import { PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('6BMtX4X6i7bxr9P7uGfqr2XMG1RUeM5isxVVwtJdJsMR');
const VUSD_MINT_SEED = 'vusd-mint';

const [vusdMint] = PublicKey.findProgramAddressSync([Buffer.from(VUSD_MINT_SEED)], PROGRAM_ID);

console.log('vUSD Mint Address:', vusdMint.toBase58());
