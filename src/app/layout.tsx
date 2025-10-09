import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/lib/utils/error-handler';
import { SolanaProvider } from '@/providers';
import { ReownProvider } from '@/providers/reown-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/query-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'V1ta Protocol - Solana Lending & Borrowing',
  description:
    'Decentralized lending protocol on Solana. Borrow VUSD against your SOL collateral with zero interest.',
  keywords: ['Solana', 'DeFi', 'Lending', 'Borrowing', 'VUSD', 'Stablecoin'],
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <QueryProvider>
          <ReownProvider>
            <SolanaProvider>
              <TooltipProvider>
                {children}
                <Toaster
                  position="top-right"
                  theme="dark"
                  toastOptions={{
                    style: {
                      background: 'var(--elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    },
                  }}
                />
              </TooltipProvider>
            </SolanaProvider>
          </ReownProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
