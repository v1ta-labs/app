import { PublicKey } from '@solana/web3.js';

export function shortenAddress(address: string | PublicKey, chars = 4): string {
  const addressString = typeof address === 'string' ? address : address.toBase58();
  return `${addressString.slice(0, chars)}...${addressString.slice(-chars)}`;
}

export function formatSol(lamports: number, decimals = 4): string {
  const sol = lamports / 1_000_000_000;
  return sol.toFixed(decimals);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt);
      }
    }
  }

  throw lastError!;
}
