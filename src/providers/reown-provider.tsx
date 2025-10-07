'use client';

import { FC, ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { projectId, metadata, solanaWeb3JsAdapter, networks, features } from '@/config/reown';

// Create the modal only once
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  // @ts-expect-error - Reown network type mismatch
  networks,
  metadata,
  projectId,
  // @ts-expect-error - Reown features type mismatch
  features,
});

interface ReownProviderProps {
  children: ReactNode;
}

export const ReownProvider: FC<ReownProviderProps> = ({ children }) => {
  return <>{children}</>;
};
