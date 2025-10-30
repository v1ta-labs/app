// Sanctum LST API Types
// Based on https://api.sanctum.so

export interface LSTMetadata {
  symbol: string;
  name: string;
  mint: string;
  logoUri: string;
  poolAddress: string;
  validatorFee: number;
  tvl: number;
  apy: number;
  solValue: number; // How much SOL 1 LST is worth
  poolTokenSupply: number;
  lastUpdated: number;
}

export interface LSTListResponse {
  lsts: LSTMetadata[];
}

export interface LSTQuote {
  inAmount: string;
  outAmount: string;
  fee: string;
  priceImpact: number;
}
