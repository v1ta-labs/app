import { Commitment } from '@solana/web3.js';

export type SolanaNetwork = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';

export const SOLANA_NETWORKS: Record<SolanaNetwork, string> = {
  'mainnet-beta': process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET || 'https://api.mainnet-beta.solana.com',
  'devnet': process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET || 'https://api.devnet.solana.com',
  'testnet': 'https://api.testnet.solana.com',
  'localnet': process.env.NEXT_PUBLIC_SOLANA_RPC_LOCALNET || 'http://localhost:8899',
};

export const CURRENT_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as SolanaNetwork;
export const RPC_ENDPOINT = SOLANA_NETWORKS[CURRENT_NETWORK];

export const COMMITMENT: Commitment = (process.env.NEXT_PUBLIC_COMMITMENT || 'confirmed') as Commitment;

export const VITA_PROGRAM_ID = process.env.NEXT_PUBLIC_VITA_PROGRAM_ID || '';

export const PRIORITY_FEE = parseInt(process.env.NEXT_PUBLIC_PRIORITY_FEE || '5000', 10);
export const ENABLE_TX_SIMULATION = process.env.NEXT_PUBLIC_ENABLE_TX_SIMULATION === 'true';

export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer.solana.com';

export const getExplorerUrl = (
  type: 'address' | 'tx' | 'block',
  value: string,
  cluster?: SolanaNetwork
): string => {
  const clusterParam = cluster && cluster !== 'mainnet-beta' ? `?cluster=${cluster}` : '';
  return `${EXPLORER_URL}/${type}/${value}${clusterParam}`;
};
