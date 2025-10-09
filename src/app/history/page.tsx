'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { formatUSD, formatNumber } from '@/lib/utils/formatters';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  DollarSign,
  Filter,
  Search,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';

type TransactionType = 'deposit' | 'withdraw' | 'borrow' | 'repay' | 'swap' | 'liquidation';

interface Transaction {
  id: string;
  type: TransactionType;
  asset: string;
  amount: number;
  usdValue: number;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  txHash: string;
  from?: string;
  to?: string;
}

const TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'borrow',
    asset: 'VUSD',
    amount: 5000,
    usdValue: 5000,
    timestamp: '2025-10-07T14:30:00',
    status: 'success',
    txHash: '5KJp...9Rz2',
  },
  {
    id: '2',
    type: 'deposit',
    asset: 'SOL',
    amount: 50,
    usdValue: 9787.5,
    timestamp: '2025-10-07T12:15:00',
    status: 'success',
    txHash: '3Hk8...7Mn4',
  },
  {
    id: '3',
    type: 'swap',
    asset: 'USDC',
    amount: 1000,
    usdValue: 1000,
    timestamp: '2025-10-06T18:45:00',
    status: 'success',
    txHash: '8Ym3...2Qr1',
    from: 'USDT',
    to: 'USDC',
  },
  {
    id: '4',
    type: 'repay',
    asset: 'VUSD',
    amount: 2500,
    usdValue: 2500,
    timestamp: '2025-10-06T09:20:00',
    status: 'success',
    txHash: '2Fp9...4Ls8',
  },
  {
    id: '5',
    type: 'deposit',
    asset: 'jitoSOL',
    amount: 25,
    usdValue: 5016.25,
    timestamp: '2025-10-05T16:30:00',
    status: 'success',
    txHash: '9Bv7...3Kt5',
  },
  {
    id: '6',
    type: 'withdraw',
    asset: 'USDC',
    amount: 3000,
    usdValue: 3000,
    timestamp: '2025-10-05T11:10:00',
    status: 'success',
    txHash: '4Dx2...8Wn9',
  },
  {
    id: '7',
    type: 'borrow',
    asset: 'VUSD',
    amount: 3500,
    usdValue: 3500,
    timestamp: '2025-10-04T15:50:00',
    status: 'success',
    txHash: '6Hn1...5Pr6',
  },
  {
    id: '8',
    type: 'deposit',
    asset: 'mSOL',
    amount: 15,
    usdValue: 2958,
    timestamp: '2025-10-04T08:25:00',
    status: 'success',
    txHash: '1Qw5...7Zx3',
  },
];

const TRANSACTION_CONFIG: Record<
  TransactionType,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  deposit: { icon: ArrowDownLeft, color: 'text-success', label: 'Deposit' },
  withdraw: { icon: ArrowUpRight, color: 'text-error', label: 'Withdraw' },
  borrow: { icon: DollarSign, color: 'text-warning', label: 'Borrow' },
  repay: { icon: DollarSign, color: 'text-success', label: 'Repay' },
  swap: { icon: Repeat, color: 'text-primary', label: 'Swap' },
  liquidation: { icon: ArrowUpRight, color: 'text-error', label: 'Liquidation' },
};

export default function HistoryPage() {
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = TRANSACTIONS.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch =
      search === '' ||
      tx.asset.toLowerCase().includes(search.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
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

  const totalVolume = TRANSACTIONS.reduce((sum, tx) => sum + tx.usdValue, 0);
  const depositsCount = TRANSACTIONS.filter(tx => tx.type === 'deposit').length;

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
              <div className="text-2xl font-bold text-text-primary">{formatUSD(totalVolume)}</div>
              <div className="text-xs text-text-tertiary mt-1">All time</div>
            </Card>
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Total Transactions
              </div>
              <div className="text-2xl font-bold text-text-primary">{TRANSACTIONS.length}</div>
              <div className="text-xs text-text-tertiary mt-1">Completed</div>
            </Card>
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                Most Active
              </div>
              <div className="text-2xl font-bold text-text-primary">Deposit</div>
              <div className="text-xs text-text-tertiary mt-1">{depositsCount} times</div>
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
                  placeholder="Search by asset or transaction hash..."
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
                  onChange={e => setFilter(e.target.value as TransactionType | 'all')}
                  className="px-3 py-2 bg-base border border-border rounded-[12px] text-sm text-text-primary focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdraw">Withdraws</option>
                  <option value="borrow">Borrows</option>
                  <option value="repay">Repays</option>
                  <option value="swap">Swaps</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Transaction List */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <Card className="p-12 backdrop-blur-xl bg-surface/70 border-border/50 text-center">
                <div className="text-text-tertiary mb-2">No transactions found</div>
                <div className="text-sm text-text-tertiary">Try adjusting your filters</div>
              </Card>
            ) : (
              filteredTransactions.map((tx, index) => {
                const config = TRANSACTION_CONFIG[tx.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
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
                            {tx.from && tx.to && (
                              <div className="text-xs text-text-tertiary">
                                {tx.from} → {tx.to}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-tertiary">
                            <span>
                              {formatNumber(tx.amount, 4)} {tx.asset}
                            </span>
                            <span>•</span>
                            <span>{formatDate(tx.timestamp)}</span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <div className="text-base font-bold text-text-primary mb-1">
                            {formatUSD(tx.usdValue)}
                          </div>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              tx.status === 'success'
                                ? 'bg-success/10 text-success'
                                : tx.status === 'pending'
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-error/10 text-error'
                            }`}
                          >
                            {tx.status === 'success' ? '✓' : tx.status === 'pending' ? '⋯' : '✕'}{' '}
                            {tx.status}
                          </div>
                        </div>

                        {/* Transaction Hash */}
                        <a
                          href={`https://solscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-base rounded-[12px] border border-border hover:bg-elevated transition-colors text-xs font-mono text-text-secondary"
                        >
                          <span>{tx.txHash}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
