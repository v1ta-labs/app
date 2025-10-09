import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

export const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'f34fa03d-7878-4cb9-b63c-6f340085cd16';

export const metadata = {
  name: 'V1ta Protocol',
  description: 'The Capital-Efficient CDP Protocol',
  url: 'https://v1ta.fi',
  icons: ['https://v1ta.fi/logo.png'],
};

// Configure default chain with explicit RPC
const defaultChain = {
  ...solanaDevnet,
  rpcUrl: 'https://api.devnet.solana.com',
};

export const networks = [
  defaultChain,
  {
    ...solana,
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  },
  {
    ...solanaTestnet,
    rpcUrl: 'https://api.testnet.solana.com',
  },
];

export const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// Features
export const features = {
  analytics: false,
  email: true,
  socials: ['google', 'x', 'github', 'discord', 'apple'] as const,
};
