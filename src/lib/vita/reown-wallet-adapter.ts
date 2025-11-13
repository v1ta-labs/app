import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Adapter to make Reown wallet provider compatible with Anchor's wallet interface
 */
export class ReownWalletAdapter {
  constructor(
    private walletProvider: any,
    public publicKey: PublicKey
  ) {
    console.log('ReownWalletAdapter created with publicKey:', publicKey.toBase58());
    console.log('WalletProvider methods:', Object.keys(walletProvider || {}));
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (!this.walletProvider) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('=== ReownWalletAdapter.signTransaction ===');
      console.log('Transaction needs signing for:', this.publicKey.toBase58());
      console.log('Transaction type:', tx.constructor.name);
      console.log('Transaction has feePayer?', 'feePayer' in tx ? tx.feePayer : 'N/A');
      console.log(
        'Transaction has recentBlockhash?',
        'recentBlockhash' in tx ? tx.recentBlockhash : 'N/A'
      );

      // Method 1: Try to access browser wallet directly (Phantom/Solflare in window)
      if (typeof window !== 'undefined') {
        console.log('Checking for browser wallet...');

        // Try Phantom
        const phantomWallet = (window as any).phantom?.solana;
        if (phantomWallet && phantomWallet.publicKey?.toBase58() === this.publicKey.toBase58()) {
          console.log('✅ Found Phantom wallet, signing transaction...');

          const signedTx = await phantomWallet.signTransaction(tx);

          console.log('✅ Phantom signed transaction successfully');
          console.log('Signed transaction type:', signedTx.constructor.name);
          console.log('Number of signatures:', signedTx.signatures?.length);

          // Log each signature in detail
          signedTx.signatures.forEach((sig: any, index: number) => {
            console.log(`Signature ${index}:`, {
              publicKey: sig.publicKey?.toBase58(),
              hasSignature: !!sig.signature,
              signatureLength: sig.signature?.length || 0,
            });
          });

          return signedTx as T;
        }

        // Try Solflare
        const solflareWallet = (window as any).solflare;
        if (solflareWallet && solflareWallet.publicKey?.toBase58() === this.publicKey.toBase58()) {
          console.log('Using window.solflare');
          const signedTx = await solflareWallet.signTransaction(tx);
          console.log('Transaction signed successfully by Solflare');
          return signedTx as T;
        }

        // Try generic Solana wallet
        const solanaWallet = (window as any).solana;
        if (solanaWallet && solanaWallet.publicKey?.toBase58() === this.publicKey.toBase58()) {
          console.log('Using window.solana');
          const signedTx = await solanaWallet.signTransaction(tx);
          console.log('Transaction signed successfully by window.solana');
          return signedTx as T;
        }
      }

      // Method 2: Try Reown provider's request method with Solana RPC
      if (this.walletProvider && typeof this.walletProvider.request === 'function') {
        console.log('Using walletProvider.request with solana_signTransaction');

        // Serialize transaction to base58
        const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
        const base58Tx = bs58.encode(serialized);

        const result = await this.walletProvider.request({
          method: 'solana_signTransaction',
          params: {
            transaction: base58Tx,
            pubkey: this.publicKey.toBase58(),
          },
        });

        console.log('Transaction signed via Reown request');

        // Deserialize the response
        const signedBuffer = bs58.decode(result.transaction);
        const signedTx = Transaction.from(signedBuffer);
        return signedTx as T;
      }

      console.error('No signing method found!');
      console.error('walletProvider:', this.walletProvider);
      throw new Error('Wallet does not support signing transactions - no compatible method found');
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    if (!this.walletProvider) {
      throw new Error('Wallet not connected');
    }

    try {
      // Try browser wallets first (same as signTransaction)
      if (typeof window !== 'undefined') {
        const phantomWallet = (window as any).phantom?.solana;
        if (phantomWallet && phantomWallet.publicKey?.toBase58() === this.publicKey.toBase58()) {
          console.log('Using window.phantom.solana.signAllTransactions');
          return (await phantomWallet.signAllTransactions(txs)) as T[];
        }

        const solflareWallet = (window as any).solflare;
        if (solflareWallet && solflareWallet.publicKey?.toBase58() === this.publicKey.toBase58()) {
          console.log('Using window.solflare.signAllTransactions');
          return (await solflareWallet.signAllTransactions(txs)) as T[];
        }

        const solanaWallet = (window as any).solana;
        if (solanaWallet && solanaWallet.publicKey?.toBase58() === this.publicKey.toBase58()) {
          console.log('Using window.solana.signAllTransactions');
          return (await solanaWallet.signAllTransactions(txs)) as T[];
        }
      }

      // Fallback: sign one by one using signTransaction
      console.log('Signing transactions one by one');
      const signedTxs = await Promise.all(txs.map(tx => this.signTransaction(tx)));
      return signedTxs;
    } catch (error) {
      console.error('Error signing transactions:', error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.walletProvider) {
      throw new Error('Wallet not connected');
    }

    try {
      // Try browser wallets first
      if (typeof window !== 'undefined') {
        const phantomWallet = (window as any).phantom?.solana;
        if (phantomWallet && phantomWallet.publicKey?.toBase58() === this.publicKey.toBase58()) {
          console.log('Using window.phantom.solana.signMessage');
          const result = await phantomWallet.signMessage(message);
          return result.signature;
        }

        const solflareWallet = (window as any).solflare;
        if (solflareWallet && solflareWallet.publicKey?.toBase58() === this.publicKey.toBase58()) {
          console.log('Using window.solflare.signMessage');
          const result = await solflareWallet.signMessage(message);
          return result.signature;
        }

        const solanaWallet = (window as any).solana;
        if (solanaWallet && solanaWallet.publicKey?.toBase58() === this.publicKey.toBase58()) {
          console.log('Using window.solana.signMessage');
          const result = await solanaWallet.signMessage(message);
          return result.signature;
        }
      }

      throw new Error('Wallet does not support signing messages');
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }
}
