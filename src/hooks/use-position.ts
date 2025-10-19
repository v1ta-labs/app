'use client';

import { useState, useEffect } from 'react';
import { useVitaClient } from './use-vita-client';
import type { Position, PositionHealth } from '@/lib/vita/types';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PROTOCOL_PARAMS } from '@/lib/vita/constants';

export interface PositionData {
  position: Position | null;
  health: PositionHealth | null;
  collateralSol: number;
  debtVusd: number;
}

export function usePosition(solPrice: number = 200) {
  const { client, isConnected } = useVitaClient();
  const [data, setData] = useState<PositionData>({
    position: null,
    health: null,
    collateralSol: 0,
    debtVusd: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPosition() {
      if (!client || !isConnected) {
        setData({ position: null, health: null, collateralSol: 0, debtVusd: 0 });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const position = await client.getPosition();

        if (!position) {
          setData({ position: null, health: null, collateralSol: 0, debtVusd: 0 });
          return;
        }

        const collateralSol = position.collateral.toNumber() / LAMPORTS_PER_SOL;
        const debtVusd = position.debt.toNumber() / 10 ** PROTOCOL_PARAMS.VUSD_DECIMALS;
        const health = await client.getPositionHealth(solPrice);

        setData({
          position,
          health,
          collateralSol,
          debtVusd,
        });
      } catch (err) {
        console.error('Failed to fetch position:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch position'));
        setData({ position: null, health: null, collateralSol: 0, debtVusd: 0 });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosition();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchPosition, 10000);
    return () => clearInterval(interval);
  }, [client, isConnected, solPrice]);

  return { ...data, isLoading, error, hasPosition: !!data.position };
}
