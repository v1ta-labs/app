import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Get project ID from environment
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'f34fa03d-7878-4cb9-b63c-6f340085cd16';

// Metadata for your app
export const metadata = {
  name: 'V1ta Protocol',
  description: 'The Capital-Efficient CDP Protocol',
  url: 'https://v1ta.xyz',
  icons: ['https://v1ta.xyz/icon.png'],
};

// Create Solana adapter with wallet adapters
export const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// Configure networks - using built-in network configs which have proper RPC endpoints
export const networks = [solanaDevnet, solana, solanaTestnet];

// Features
export const features = {
  analytics: true,
  email: true,
  socials: ['google', 'x', 'github', 'discord', 'apple'] as const,
};
