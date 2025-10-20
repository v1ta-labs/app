'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Filter,
  Search,
  ExternalLink,
  Loader2,
  TrendingUp,
  TrendingDown,
  Coins,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTransactions, useSolPrice } from '@/hooks';
import { useAppKitAccount } from '@reown/appkit/react';
import { V1taTransactionType } from '@/lib/vita/transaction-parser';

const TRANSACTION_CONFIG: Record<
  V1taTransactionType,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  open_position: { icon: TrendingUp, color: 'text-success', label: 'Open Position' },
  adjust_position: { icon: Repeat, color: 'text-warning', label: 'Adjust Position' },
  close_position: { icon: TrendingDown, color: 'text-error', label: 'Close Position' },
  deposit_stability: { icon: ArrowDownLeft, color: 'text-primary', label: 'Deposit to Pool' },
  withdraw_stability: { icon: ArrowUpRight, color: 'text-warning', label: 'Withdraw from Pool' },
  redeem: { icon: Coins, color: 'text-success', label: 'Redeem vUSD' },
  liquidate: { icon: Zap, color: 'text-error', label: 'Liquidation' },
};

export default function HistoryPage() {
  const [filter, setFilter] = useState<V1taTransactionType | 'all'>('all');
  const [search, setSearch] = useState('');

  const { isConnected } = useAppKitAccount();
  const { transactions, loading } = useTransactions(20);
  const { price: solPrice } = useSolPrice();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesFilter = filter === 'all' || tx.type === filter;
      const matchesSearch =
        search === '' || tx.signature.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, search]);

  const stats = useMemo(() => {
    const totalVolume = transactions.reduce((sum, tx) => {
      let value = 0;
      if (tx.collateralAmount) value += tx.collateralAmount * solPrice;
      if (tx.borrowAmount) value += tx.borrowAmount;
      if (tx.vusdAmount) value += tx.vusdAmount;
      if (tx.solReceived) value += tx.solReceived * solPrice;
      return sum + value;
    }, 0);

    const typeCounts = transactions.reduce(
      (acc, tx) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostActiveType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalVolume,
      totalCount: transactions.length,
      mostActiveType: mostActiveType
        ? { type: mostActiveType[0], count: mostActiveType[1] }
        : null,
    };
  }, [transactions, solPrice]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTransactionDescription = (tx: typeof transactions[0]) => {
    switch (tx.type) {
      case 'open_position':
        return `${formatNumber(tx.collateralAmount || 0, 4)} SOL collateral, ${formatNumber(tx.borrowAmount || 0, 2)} vUSD borrowed`;
      case 'adjust_position':
        const collChange = tx.collateralChange || 0;
        const debtChange = tx.debtChange || 0;
        return `${collChange > 0 ? '+' : ''}${formatNumber(Math.abs(collChange), 4)} SOL, ${debtChange > 0 ? '+' : ''}${formatNumber(Math.abs(debtChange), 2)} vUSD`;
      case 'close_position':
        return `Returned ${formatNumber(tx.collateralAmount || 0, 4)} SOL, repaid ${formatNumber(tx.borrowAmount || 0, 2)} vUSD`;
      case 'deposit_stability':
        return `Deposited ${formatNumber(tx.vusdAmount || 0, 2)} vUSD`;
      case 'withdraw_stability':
        return `Withdrew ${formatNumber(tx.vusdAmount || 0, 2)} vUSD`;
      case 'redeem':
        return `Redeemed ${formatNumber(tx.vusdAmount || 0, 2)} vUSD for ${formatNumber(tx.solReceived || 0, 4)} SOL`;
      case 'liquidate':
        return `Liquidated ${formatNumber(tx.collateralAmount || 0, 4)} SOL`;
      default:
        return 'Transaction';
    }
  };

  const getTransactionValue = (tx: typeof transactions[0]) => {
    let value = 0;
    if (tx.collateralAmount) value += tx.collateralAmount * solPrice;
    if (tx.borrowAmount) value += tx.borrowAmount;
    if (tx.vusdAmount) value += tx.vusdAmount;
    if (tx.solReceived) value += tx.solReceived * solPrice;
    return value;
  };

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-8">
          <Card className="p-12 max-w-lg mx-auto text-center backdrop-blur-xl bg-surface/70 border-border/50">
            <Coins className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-text-primary mb-3">Connect Your Wallet</h2>
            <p className="text-text-secondary mb-8">
              Connect your Solana wallet to view your transaction history.
            </p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Transaction History</h1>
            <p className="text-sm text-text-tertiary">View all your V1ta Protocol transactions</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Total Volume
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatUSD(stats.totalVolume)}
              </div>
              <div className="text-xs text-text-tertiary mt-1">All time</div>
            </Card>
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Total Transactions
              </div>
              <div className="text-2xl font-bold text-text-primary">{stats.totalCount}</div>
              <div className="text-xs text-text-tertiary mt-1">On V1ta Protocol</div>
            </Card>
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Most Active
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {stats.mostActiveType
                  ? TRANSACTION_CONFIG[stats.mostActiveType.type as V1taTransactionType]?.label ||
                    'N/A'
                  : 'N/A'}
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {stats.mostActiveType ? `${stats.mostActiveType.count} times` : 'No activity yet'}
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search by transaction signature..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-base border border-border rounded-[12px] text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-text-tertiary" />
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value as V1taTransactionType | 'all')}
                  className="px-3 py-2 bg-base border border-border rounded-[12px] text-sm text-text-primary focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="open_position">Open Position</option>
                  <option value="adjust_position">Adjust Position</option>
                  <option value="close_position">Close Position</option>
                  <option value="deposit_stability">Deposit to Pool</option>
                  <option value="withdraw_stability">Withdraw from Pool</option>
                  <option value="redeem">Redeem</option>
                  <option value="liquidate">Liquidation</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card className="p-12 backdrop-blur-xl bg-surface/70 border-border/50 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <div className="text-text-secondary mb-2">Loading transactions...</div>
              <div className="text-sm text-text-tertiary">Fetching from blockchain</div>
            </Card>
          )}

          {/* Transaction List */}
          {!loading && (
            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <Card className="p-12 backdrop-blur-xl bg-surface/70 border-border/50 text-center">
                  <Coins className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-50" />
                  <div className="text-text-primary font-bold mb-2">No transactions found</div>
                  <div className="text-sm text-text-tertiary">
                    {transactions.length === 0
                      ? 'Make your first transaction to see it here'
                      : 'Try adjusting your filters'}
                  </div>
                </Card>
              ) : (
                filteredTransactions.map((tx, index) => {
                  const config = TRANSACTION_CONFIG[tx.type];
                  const Icon = config.icon;
                  const value = getTransactionValue(tx);

                  return (
                    <motion.div
                      key={tx.signature}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
                    >
                      <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50 hover:bg-elevated/50 transition-all">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div
                            className={`w-10 h-10 rounded-xl bg-base border border-border flex items-center justify-center shrink-0 ${config.color}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Transaction Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-sm font-bold text-text-primary">
                                {config.label}
                              </div>
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {getTransactionDescription(tx)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-tertiary mt-1">
                              <span>{formatDate(tx.blockTime)}</span>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            <div className="text-base font-bold text-text-primary mb-1">
                              {formatUSD(value)}
                            </div>
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                tx.success
                                  ? 'bg-success/10 text-success'
                                  : 'bg-error/10 text-error'
                              }`}
                            >
                              {tx.success ? '✓' : '✕'} {tx.success ? 'success' : 'failed'}
                            </div>
                          </div>

                          {/* Transaction Hash */}
                          <a
                            href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-base rounded-[12px] border border-border hover:bg-elevated transition-colors text-xs font-mono text-text-secondary"
                          >
                            <span>
                              {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
