'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { sanctumClient, type LSTMetadata } from '@/lib/sanctum';

export type CollateralType = 'NativeSOL' | 'JitoSOL' | 'MarinadeSOL' | 'USDStar';

interface LSTOption {
  type: CollateralType;
  symbol: string;
  name: string;
  icon: string;
  mint?: string;
  apy?: number;
}

const DEFAULT_LST_OPTIONS: LSTOption[] = [
  {
    type: 'NativeSOL',
    symbol: 'SOL',
    name: 'Native Solana',
    icon: '/assets/logos/solana.png',
  },
  {
    type: 'JitoSOL',
    symbol: 'jitoSOL',
    name: 'Jito Staked SOL',
    icon: '/assets/logos/jitosol.png',
    mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
  },
  {
    type: 'MarinadeSOL',
    symbol: 'mSOL',
    name: 'Marinade Staked SOL',
    icon: '/assets/logos/msol.png',
    mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  },
  {
    type: 'USDStar',
    symbol: 'USD*',
    name: 'Perena USD*',
    icon: '/assets/logos/usdstar.png',
    mint: 'HUBsveNpjo5pWqNkH57QzxjQASdTVXcSK7bVKTSZtcSX', // Perena USD* mint
  },
];

interface LSTSelectorProps {
  selectedType: CollateralType;
  onSelect: (type: CollateralType) => void;
}

export function LSTSelector({ selectedType, onSelect }: LSTSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lstOptions, setLstOptions] = useState<LSTOption[]>(DEFAULT_LST_OPTIONS);
  const [isLoadingAPY, setIsLoadingAPY] = useState(false);

  const selectedOption = lstOptions.find(opt => opt.type === selectedType) || lstOptions[0];

  // Fetch APY data from Sanctum via backend proxy
  useEffect(() => {
    const fetchAPYData = async () => {
      setIsLoadingAPY(true);
      try {
        const supportedLSTs = await sanctumClient.getSupportedLSTs();
        setLstOptions(prev =>
          prev.map(opt => {
            if (opt.type === 'NativeSOL') return opt;
            const lstData = supportedLSTs.find(
              lst => lst.symbol === opt.symbol || lst.mint === opt.mint
            );
            return lstData ? { ...opt, mint: lstData.mint, apy: lstData.apy } : opt;
          })
        );
      } catch (error) {
        console.error('Failed to fetch LST APY data:', error);
        // Silently fail - UI will work without APY data
      } finally {
        setIsLoadingAPY(false);
      }
    };

    fetchAPYData();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface/50 transition-all"
      >
        <img
          src={selectedOption.icon}
          alt={selectedOption.symbol}
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="font-semibold text-text-primary">{selectedOption.symbol}</span>
        <ChevronDown
          className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 min-w-[280px] mt-2 p-2 rounded-xl border border-border/50 bg-surface/95 backdrop-blur-xl shadow-xl"
          >
            {lstOptions.map(option => (
              <button
                key={option.type}
                onClick={() => {
                  onSelect(option.type);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={option.icon}
                    alt={option.symbol}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-text-primary text-sm">{option.symbol}</div>
                    <div className="text-xs text-text-tertiary">{option.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {option.apy && (
                    <div className="text-right">
                      <div className="text-xs text-success font-semibold">
                        {isLoadingAPY ? '...' : `${(option.apy * 100).toFixed(2)}% APY`}
                      </div>
                    </div>
                  )}
                  {option.type === selectedType && <Check className="w-5 h-5 text-success" />}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
