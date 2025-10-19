'use client';

import { useState, useEffect } from 'react';

export function useSolPrice() {
  const [price, setPrice] = useState<number>(200); // Default fallback price
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      try {
        // Use CoinGecko API to fetch SOL price
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        const data = await response.json();

        if (data?.solana?.usd) {
          setPrice(data.solana.usd);
        }
      } catch (err) {
        console.warn('Failed to fetch SOL price, using fallback:', err);
        // Keep fallback price
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrice();

    // Update price every 60 seconds
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return { price, isLoading };
}
