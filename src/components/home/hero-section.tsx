'use client';

import { motion } from 'framer-motion';
import { useAppKitAccount, useAppKit } from '@reown/appkit/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Wallet } from 'lucide-react';
import { formatUSD } from '@/lib/utils/formatters';
import { Logotype } from '@/components/ui/logotype';

export function HeroSection() {
  const { isConnected } = useAppKitAccount();
  const { open: openReownModal } = useAppKit();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start pt-12 sm:pt-20 px-4 sm:px-8">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="text-center mb-12 sm:mb-20"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-text-primary leading-tight px-4">
          Borrow from the depths.
          <br />
          Survive the storm.
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Logotype size="md" showSubheading={true} interactive={true} />
        </motion.div>
      </motion.div>

      <div className="w-full max-w-4xl mb-12 sm:mb-20 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full mb-5"
        >
          <motion.div
            whileHover={isConnected ? { scale: 1.01 } : undefined}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="p-3 sm:p-4 backdrop-blur-sm bg-surface/70 border-border/50">
              <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-bold mb-2 sm:mb-3">
                Portfolio Overview
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <div className="text-[9px] sm:text-[10px] text-text-tertiary mb-1 sm:mb-1.5">
                    Total Value
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-text-primary mb-0.5 sm:mb-1">
                    {formatUSD(0)}
                  </div>
                  <div className="flex items-center gap-1 text-success text-[9px] sm:text-[10px] font-semibold">
                    <TrendingUp className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    <span className="hidden sm:inline">+0% (24h)</span>
                    <span className="sm:hidden">+0%</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary mb-1.5">Net Worth</div>
                  <div className="text-xl font-bold text-text-primary mb-1">{formatUSD(0)}</div>
                  <div className="text-[10px] text-text-tertiary">After debt</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary mb-1.5">Collateral Ratio</div>
                  <div className="text-xl font-bold text-success mb-1">0%</div>
                  <div className="text-[10px] text-text-tertiary">Healthy</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary mb-1.5">Available to Borrow</div>
                  <div className="text-xl font-bold text-text-primary mb-1">{formatUSD(0)}</div>
                  <div className="text-[10px] text-text-tertiary">Max VUSD</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Assets & Liabilities */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full"
        >
          {/* Assets */}
          <motion.div
            whileHover={isConnected ? { scale: 1.01 } : undefined}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="p-3 sm:p-4 backdrop-blur-xl bg-surface/70 border-border/50 h-full">
              <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-bold mb-3">
                Assets
              </div>
              <div className="space-y-2.5">
                <div className="pt-2.5 mt-1">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                      Total Assets
                    </div>
                    <div className="text-base font-bold text-text-primary">{formatUSD(0)}</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Liabilities */}
          <motion.div
            whileHover={isConnected ? { scale: 1.01 } : undefined}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="p-3 sm:p-4 backdrop-blur-xl bg-surface/70 border-border/50 h-full">
              <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-bold mb-3">
                Liabilities
              </div>
              <div className="space-y-2.5">
                <div className="pt-2.5 mt-1">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                      Total Debt
                    </div>
                    <div className="text-base font-bold text-text-primary">{formatUSD(0)}</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {!isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="absolute inset-0 backdrop-blur-sm bg-background/40 rounded-2xl" />
            <Button
              className="shadow-lg relative z-20"
              onClick={() => openReownModal({ view: 'Connect' })}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect wallet to view
            </Button>
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-text-tertiary text-sm"
        >
          Scroll to continue
          <div className="w-px h-16 bg-gradient-to-b from-border to-transparent mx-auto mt-4" />
        </motion.div>
      </motion.div>
    </div>
  );
}
