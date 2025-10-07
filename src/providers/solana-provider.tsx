'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  Coin98WalletAdapter,
  TrustWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { RPC_ENDPOINT, CURRENT_NETWORK } from '@/constants/solana';

import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const network = CURRENT_NETWORK as WalletAdapterNetwork;

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new WalletConnectWalletAdapter({
        network: network as WalletAdapterNetwork.Mainnet | WalletAdapterNetwork.Devnet,
        options: {
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '9b1a9c8e3f5e4c5f5f4c5f5f4c5f5f4c',
          metadata: {
            name: 'V1ta Protocol',
            description: 'The Capital-Efficient CDP Protocol',
            url: 'https://v1ta.xyz',
            icons: ['https://v1ta.xyz/icon.png'],
          },
        },
      }),
      new CoinbaseWalletAdapter(),
      new Coin98WalletAdapter(),
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
