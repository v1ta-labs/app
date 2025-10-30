'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { LAMPORTS_PER_SOL, Connection, PublicKey } from '@solana/web3.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AmountInput } from '@/components/ui/amount-input';
import { StatDisplay } from '@/components/ui/stat-display';
import { HealthGauge } from '@/components/ui/health-gauge';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import { ArrowDown, Info, AlertTriangle, Zap, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { V1TAClient, CollateralType as V1TACollateralType } from '@/lib/vita';
import { toast } from 'sonner';
import { LSTSelector, type CollateralType } from './lst-selector';

interface TokenInfo {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  balance: number;
}

const DEFAULT_TOKEN: TokenInfo = {
  symbol: 'SOL',
  name: 'Solana',
  icon: '◎',
  price: 0,
  balance: 0,
};

// V1TA Protocol Constants - IMMUTABLE
const BORROWING_FEE = 0.5; // 0.5% one-time fee

const calculateBorrowingFee = (borrowAmount: number): { feeAmount: number; totalDebt: number } => {
  const feeAmount = (borrowAmount * BORROWING_FEE) / 100;
  const totalDebt = borrowAmount + feeAmount;
  return { feeAmount, totalDebt };
};

const getLiquidationRisk = (
  cr: number
): { level: 'safe' | 'moderate' | 'risky' | 'danger'; label: string; color: string } => {
  if (cr >= 200) return { level: 'safe', label: 'Very Safe', color: 'text-success' };
  if (cr >= 150) return { level: 'moderate', label: 'Safe', color: 'text-success' };
  if (cr >= 120) return { level: 'risky', label: 'At Risk', color: 'text-warning' };
  return { level: 'danger', label: 'Danger Zone', color: 'text-error' };
};

export function BorrowInterface() {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('solana');

  const [selectedToken, setSelectedToken] = useState<TokenInfo>(DEFAULT_TOKEN);
  const [collateralType, setCollateralType] = useState<CollateralType>('NativeSOL');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [showFeeTooltip, setShowFeeTooltip] = useState(false);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [isTransacting, setIsTransacting] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [userCollateral, setUserCollateral] = useState<number>(0);
  const [userDebt, setUserDebt] = useState<number>(0);
  const [hasPosition, setHasPosition] = useState(false);

  // Create connection instance for devnet
  const connection = useMemo(() => new Connection('https://api.devnet.solana.com', 'confirmed'), []);
  const publicKey = useMemo(() => (address ? new PublicKey(address) : null), [address]);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;

    try {
      const balance = await connection.getBalance(publicKey);
      const solBal = balance / LAMPORTS_PER_SOL;
      setSelectedToken(prev => ({ ...prev, balance: solBal }));
    } catch (error) {
      console.error('Failed to fetch SOL balance:', error);
    }
  }, [publicKey, connection]);

  // Fetch user position
  const fetchPosition = useCallback(async () => {
    if (!publicKey || !walletProvider) return;

    try {
      const client = await V1TAClient.create(connection, walletProvider, publicKey);
      const position = await client.getPosition();

      if (position) {
        setHasPosition(true);
        setUserCollateral(position.collateral.toNumber() / LAMPORTS_PER_SOL);
        setUserDebt(position.debt.toNumber() / 1_000_000); // VUSD has 6 decimals
      } else {
        setHasPosition(false);
        setUserCollateral(0);
        setUserDebt(0);
      }
    } catch (error) {
      console.error('Failed to fetch position:', error);
    }
  }, [publicKey, connection, walletProvider]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [fetchBalance]);

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [fetchPosition]);

  // Fetch SOL price from Pyth Hermes API
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        setIsPriceLoading(true);
        // Fetch from Pyth Hermes API (SOL/USD price feed ID)
        const response = await fetch(
          'https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d'
        );
        const data = await response.json();

        if (data.parsed && data.parsed[0]) {
          const priceData = data.parsed[0].price;
          // Pyth price format: price * 10^expo
          const priceInUsd = Number(priceData.price) * Math.pow(10, priceData.expo);
          setSolPrice(priceInUsd);
          setSelectedToken(prev => ({ ...prev, price: priceInUsd }));
        }
      } catch (error) {
        console.error('Failed to fetch SOL price from Pyth:', error);
      } finally {
        setIsPriceLoading(false);
      }
    };

    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, []);

  const collateralValue = parseFloat(collateralAmount || '0') * selectedToken.price;
  const borrowValue = parseFloat(borrowAmount || '0');

  // Calculate borrowing fee (0.5% one-time)
  const feeInfo = calculateBorrowingFee(borrowValue);

  // Health calculations use TOTAL DEBT (borrow amount + fee)
  const maxBorrow = collateralValue / 1.1; // Max at 110% CR
  const totalDebt = feeInfo.totalDebt;
  const currentLTV = collateralValue > 0 ? (totalDebt / collateralValue) * 100 : 0;
  const healthFactor = totalDebt > 0 ? (collateralValue / totalDebt) * 100 : 0; // Collateral Ratio
  const liquidationRisk = getLiquidationRisk(healthFactor);

  const liquidationPrice =
    totalDebt > 0 ? (totalDebt * 1.1) / parseFloat(collateralAmount || '1') : 0;

  const handleMaxCollateral = () => {
    // Leave a small amount for transaction fees (0.01 SOL)
    const maxAmount = Math.max(0, selectedToken.balance - 0.01);
    setCollateralAmount(maxAmount.toFixed(4));
  };

  const handleMaxBorrow = () => {
    setBorrowAmount(maxBorrow.toFixed(2));
  };

  // Validation checks
  const hasInsufficientBalance = parseFloat(collateralAmount || '0') > selectedToken.balance;
  const isBelowMinimum = parseFloat(collateralAmount || '0') > 0 && parseFloat(collateralAmount) < 0.01;
  const isValidTransaction =
    isConnected &&
    collateralAmount &&
    borrowAmount &&
    !hasInsufficientBalance &&
    !isBelowMinimum &&
    healthFactor >= 110 &&
    !isPriceLoading &&
    !isTransacting;

  const handleBorrow = async () => {
    if (!isConnected || !publicKey || !walletProvider) return;

    // Check if user already has a position
    if (hasPosition) {
      toast.error(
        <div>
          <div className="font-semibold">You already have a position</div>
          <div className="text-xs mt-1">Please use the Adjust Position feature to modify your existing position.</div>
        </div>,
        { duration: 5000 }
      );
      return;
    }

    console.log('=== Transaction Debug Info ===');
    console.log('Connected:', isConnected);
    console.log('Public Key:', publicKey.toBase58());
    console.log('Wallet Provider:', walletProvider);
    console.log('Provider type:', typeof walletProvider);
    console.log('Provider keys:', Object.keys(walletProvider || {}));
    console.log('=============================');

    const toastId = toast.loading('Preparing transaction...');

    try {
      setIsTransacting(true);
      setTxError(null);

      const client = await V1TAClient.create(connection, walletProvider, publicKey);

      const collateralSol = parseFloat(collateralAmount);
      const borrowVusd = parseFloat(borrowAmount);

      // Convert UI CollateralType to V1TA CollateralType enum
      const v1taCollateralType = collateralType === 'NativeSOL'
        ? V1TACollateralType.NativeSOL
        : collateralType === 'JitoSOL'
        ? V1TACollateralType.JitoSOL
        : collateralType === 'MarinadeSOL'
        ? V1TACollateralType.MarinadeSOL
        : V1TACollateralType.USDStar;

      toast.loading('Waiting for wallet approval...', { id: toastId });

      // openPosition already confirms the transaction internally with polling
      const signature = await client.openPosition(collateralSol, borrowVusd, v1taCollateralType);

      // Success! (already confirmed)
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <div>
            <div className="font-semibold">Position opened successfully!</div>
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>,
        { id: toastId, duration: 5000 }
      );

      // Clear form on success
      setCollateralAmount('');
      setBorrowAmount('');

      // Refresh data
      setTimeout(() => {
        fetchBalance();
        fetchPosition();
      }, 1000);
    } catch (error) {
      console.error('Failed to open position:', error);

      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setTxError(errorMessage);

      // Check if this is a duplicate transaction error (transaction may have actually succeeded)
      const isDuplicateError =
        errorMessage.includes('already been processed') ||
        errorMessage.includes('already processed') ||
        errorMessage.includes('This transaction has already been processed');

      if (isDuplicateError) {
        toast.success(
          <div>
            <div className="font-semibold">Transaction likely succeeded!</div>
            <div className="text-xs mt-1">
              The transaction was already processed. Check your position below.
            </div>
          </div>,
          { id: toastId, duration: 5000 }
        );

        // Clear form and refresh data
        setCollateralAmount('');
        setBorrowAmount('');
        setTimeout(() => {
          fetchBalance();
          fetchPosition();
        }, 1000);
      } else {
        toast.error(
          <div>
            <div className="font-semibold">Transaction failed</div>
            <div className="text-xs mt-1">{errorMessage}</div>
          </div>,
          { id: toastId, duration: 5000 }
        );
      }
    } finally {
      setIsTransacting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <StatDisplay
            label="Your Collateral"
            value={hasPosition ? `${formatNumber(userCollateral, 2)} SOL` : '0 SOL'}
            subtitle={hasPosition ? formatUSD(userCollateral * solPrice) : 'No position'}
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <StatDisplay
            label="Total Borrowed"
            value={hasPosition ? formatNumber(userDebt, 2) : '0'}
            subtitle="VUSD"
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <StatDisplay
            label="SOL Price"
            value={isPriceLoading ? 'Loading...' : formatUSD(solPrice)}
            subtitle="Live from Pyth"
          />
        </motion.div>
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card className="p-0 overflow-hidden backdrop-blur-xl bg-surface/70 border-border/50">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                COLLATERAL
              </span>
              <span className="text-xs text-text-tertiary">
                Balance:{' '}
                <span className="font-semibold text-text-secondary">
                  {formatNumber(selectedToken.balance, 4)}
                </span>
              </span>
            </div>

            <AmountInput
              value={collateralAmount}
              onChange={setCollateralAmount}
              onMax={handleMaxCollateral}
              placeholder="0.00"
              leftElement={
                <LSTSelector
                  selectedType={collateralType}
                  onSelect={setCollateralType}
                />
              }
            />

            {collateralAmount && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-text-tertiary">
                  SOL Price: {isPriceLoading ? 'Loading...' : formatUSD(solPrice)}
                </span>
                <span className="text-sm text-text-tertiary font-semibold">
                  ≈ {formatUSD(collateralValue)}
                </span>
              </div>
            )}
          </div>

          <div className="relative h-8 flex items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border" />
            <div className="relative bg-surface border border-border rounded-full p-1.5">
              <ArrowDown className="w-4 h-4 text-text-secondary" />
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                MINT VUSD
              </span>
              <button
                onClick={handleMaxBorrow}
                disabled={!collateralAmount || isPriceLoading}
                className="text-xs text-primary hover:text-primary-hover font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Max at 110%: <span className="font-semibold">{formatUSD(maxBorrow)}</span>
              </button>
            </div>

            <AmountInput
              value={borrowAmount}
              onChange={setBorrowAmount}
              placeholder="0.00"
              disabled={!collateralAmount}
              leftElement={
                <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border">
                  <img
                    src="/assets/logos/vusd.png"
                    alt="VUSD"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-semibold text-text-primary">VUSD</span>
                </div>
              }
            />

            {borrowAmount && (
              <div className="mt-2 text-right">
                <span className="text-sm text-text-tertiary">
                  ≈{' '}
                  <span className="font-semibold text-text-secondary">
                    {formatUSD(borrowValue)}
                  </span>
                </span>
              </div>
            )}
          </div>

          {collateralAmount && borrowAmount && (
            <>
              {/* V1TA 0% Interest Highlight */}
              <div className="p-5 pt-0">
                <div className="p-4 bg-gradient-to-br from-success/10 to-primary/10 rounded-2xl border border-success/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-success" />
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                        Interest Rate
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">0%</div>
                      <div className="text-[10px] text-text-tertiary uppercase">Forever</div>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary">
                    No recurring interest. Ever. Only a{' '}
                    <span className="font-bold text-primary">0.5% one-time fee</span> when you mint
                    VUSD.{' '}
                    <span className="font-semibold">Decentralized. Efficient. Unstoppable.</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="p-4 bg-base rounded-2xl border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">Collateral Ratio</span>
                      <button className="text-text-tertiary hover:text-text-secondary transition-colors">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xl font-bold text-text-primary">
                      {healthFactor > 0 ? `${healthFactor.toFixed(0)}%` : '—'}
                    </span>
                  </div>
                  <HealthGauge value={healthFactor} />
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                    <div>
                      <span className="text-text-tertiary uppercase tracking-wide font-semibold block mb-1">
                        LTV RATIO
                      </span>
                      <span className="font-bold text-text-primary text-sm">
                        {currentLTV > 0 ? `${currentLTV.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-text-tertiary uppercase tracking-wide font-semibold block mb-1">
                        RISK
                      </span>
                      <span className={`font-bold text-sm ${liquidationRisk.color}`}>
                        {healthFactor > 0 ? liquidationRisk.label : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Liquidation Warning */}
                  {healthFactor > 0 && healthFactor < 115 && (
                    <div className="mt-3 p-2 bg-warning/10 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                      <span className="text-xs text-warning font-semibold">
                        Close to liquidation threshold (110%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      </motion.div>

      {txError && (
        <div className="p-3 bg-error/10 border border-error/30 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-error mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-error">Transaction Failed</div>
            <div className="text-xs text-error/80 mt-1">{txError}</div>
          </div>
        </div>
      )}

      {hasPosition ? (
        <div className="space-y-3">
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-primary mb-1">
                You already have an active position
              </div>
              <div className="text-xs text-text-secondary">
                You currently have {formatNumber(userCollateral, 2)} SOL as collateral with {formatNumber(userDebt, 2)} VUSD borrowed.
                To modify your position, use the Adjust Position feature.
              </div>
            </div>
          </div>
          <Button
            fullWidth
            size="lg"
            variant="outline"
            onClick={() => window.location.href = '/positions'}
            className="shadow-lg h-11 text-sm font-bold"
          >
            Go to Positions Page
          </Button>
        </div>
      ) : (
        <Button
          fullWidth
          size="lg"
          disabled={!isValidTransaction}
          onClick={handleBorrow}
          className="shadow-lg shadow-primary/20 h-11 text-sm font-bold"
        >
          {isTransacting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Opening Position...
            </span>
          ) : !isConnected ? (
            'Connect Wallet to Continue'
          ) : isPriceLoading ? (
            'Loading Price...'
          ) : !collateralAmount ? (
            'Enter Collateral Amount'
          ) : isBelowMinimum ? (
            'Minimum 0.01 SOL Required'
          ) : hasInsufficientBalance ? (
            'Insufficient SOL Balance'
          ) : !borrowAmount ? (
            'Enter Borrow Amount'
          ) : healthFactor < 110 ? (
            'Collateral Ratio Too Low (Min 110%)'
          ) : (
            'Open Position & Mint VUSD'
          )}
        </Button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-success/10 rounded-xl">
                <Zap className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wide font-bold mb-1">
                  INTEREST RATE
                </div>
                <div className="text-lg font-bold text-success">0%</div>
                <div className="text-xs text-text-tertiary mt-0.5">Forever</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-warning/10 rounded-xl">
                <Info className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wide font-bold mb-1">
                  LIQUIDATION PRICE
                </div>
                <div className="text-lg font-bold text-text-primary">
                  {liquidationPrice > 0 ? `$${liquidationPrice.toFixed(2)}` : '$0.00'}
                </div>
                <div className="text-xs text-text-tertiary mt-0.5">
                  {selectedToken.symbol} price
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {borrowAmount && (
        <div className="p-4 bg-surface/50 rounded-xl border border-border/50">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-text-tertiary">One-Time Borrowing Fee:</span>
                <div className="relative">
                  <button
                    onClick={() => setShowFeeTooltip(!showFeeTooltip)}
                    className="text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {showFeeTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72"
                      >
                        <div className="bg-base border border-border rounded-xl p-3 shadow-xl">
                          <div className="text-xs font-bold text-text-primary mb-2">
                            V1TA Borrowing Fee
                          </div>
                          <div className="text-[11px] text-text-secondary space-y-2">
                            <p>
                              <span className="font-semibold text-success">
                                0.5% one-time fee. 0% interest forever.
                              </span>
                            </p>
                            <div className="space-y-1">
                              <div>• No recurring interest charges</div>
                              <div>• No variable rates</div>
                              <div>• Immutable protocol design</div>
                            </div>
                            <p className="pt-2 border-t border-border/30 text-text-tertiary text-[10px]">
                              V1TA is designed for pure decentralization. Your debt never grows from
                              interest - only the initial 0.5% fee when you borrow.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-text-primary">
                  {formatUSD(feeInfo.feeAmount)}
                </div>
                <div className="text-[10px] text-success font-bold">0.5%</div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/30">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Borrow Amount:</span>
                <span className="font-semibold text-text-primary">
                  {formatNumber(borrowValue, 2)} VUSD
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-text-tertiary font-semibold">Total Debt:</span>
              <span className="font-bold text-text-primary">
                {formatNumber(feeInfo.totalDebt, 2)} VUSD
              </span>
            </div>

            <div className="pt-2 border-t border-border/30 flex justify-between">
              <span className="text-text-tertiary">Min Collateral Ratio:</span>
              <span className="font-semibold text-text-primary">110%</span>
            </div>

            <div className="pt-2 border-t border-border/30 p-3 bg-base/50 rounded-xl">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wide font-bold mb-1.5">
                V1TA Protocol
              </div>
              <div className="text-xs text-text-secondary">
                <span className="text-success font-bold">0% interest forever</span> · Pure
                decentralized stablecoin · Your debt never compounds
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
