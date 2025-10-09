'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatUSD, formatNumber, formatPercentage } from '@/lib/utils/formatters';
import { useWallet } from '@solana/wallet-adapter-react';

export default function StabilityPoolPage() {
  const { connected } = useWallet();
  const [depositAmount, setDepositAmount] = useState('');

  const poolData = {
    totalPool: 0,
    userShare: 0,
    apy: 0,
    userDeposit: 0,
  };

  const rewards: { asset: string; amount: number; value: number }[] = [];

  const numericAmount = parseFloat(depositAmount) || 0;
  const newShare =
    ((poolData.userDeposit + numericAmount) / (poolData.totalPool + numericAmount)) * 100;

  return (
    <AppLayout>
      <Card className="mb-6" padding="md">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-sm text-text-secondary">Total Pool</span>
              <div className="text-2xl font-bold text-text-primary mt-1">
                {formatNumber(poolData.totalPool)} VUSD
              </div>
              <span className="text-sm text-text-tertiary">{formatUSD(poolData.totalPool)}</span>
            </div>
            <div>
              <span className="text-sm text-text-secondary">Your Share</span>
              <div className="text-2xl font-bold text-text-primary mt-1">
                {formatPercentage(poolData.userShare)}
              </div>
              <span className="text-sm text-text-tertiary">
                {formatNumber(poolData.userDeposit)} VUSD deposited
              </span>
            </div>
            <div>
              <span className="text-sm text-text-secondary">Current APY</span>
              <div className="text-2xl font-bold text-success mt-1">
                {formatPercentage(poolData.apy)}
              </div>
              <span className="text-sm text-text-tertiary">+ Liquidation bonuses</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deposit to Stability Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="VUSD Amount"
                type="text"
                value={depositAmount}
                onChange={setDepositAmount}
                placeholder="0.00"
                formatNumber
                rightElement={
                  <button
                    onClick={() => setDepositAmount('0')}
                    className="px-2 py-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    MAX
                  </button>
                }
              />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Your Balance:</span>
                  <span className="text-text-primary">0 VUSD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Expected APY:</span>
                  <span className="text-success font-medium">{formatPercentage(poolData.apy)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Liquidation Bonus:</span>
                  <span className="text-success font-medium">~10%</span>
                </div>
                {numericAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">New Pool Share:</span>
                    <span className="text-text-primary font-medium">
                      {formatPercentage(newShare)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Deposit Amount</label>
                <Progress value={0} />
                <div className="flex justify-between text-xs text-text-tertiary">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <Button fullWidth disabled={!connected || numericAmount <= 0}>
                {!connected ? 'Connect Wallet' : 'Deposit to Pool'}
              </Button>

              {connected && poolData.userDeposit > 0 && (
                <Button fullWidth variant="secondary">
                  Withdraw from Pool
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/20 rounded-button">
                <div className="text-sm text-text-secondary mb-2">Total Claimable</div>
                <div className="text-3xl font-bold text-success">
                  {formatUSD(rewards.reduce((sum, r) => sum + r.value, 0))}
                </div>
              </div>

              <div className="space-y-3">
                {rewards.map(reward => (
                  <div
                    key={reward.asset}
                    className="flex items-center justify-between p-4 bg-surface rounded-button border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{reward.asset[0]}</span>
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">
                          {formatNumber(reward.amount, 2)} {reward.asset}
                        </div>
                        <div className="text-sm text-text-tertiary">{formatUSD(reward.value)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button fullWidth disabled={!connected || rewards.length === 0}>
                Claim All Rewards
              </Button>

              <div className="p-4 bg-info/10 border border-info/20 rounded-button">
                <div className="flex gap-2">
                  <span className="text-info">ℹ️</span>
                  <div className="text-sm text-text-secondary">
                    <p className="font-medium text-text-primary mb-1">How it works</p>
                    <p>
                      By depositing VUSD to the Stability Pool, you help maintain protocol
                      stability. In return, you earn liquidation bonuses when underwater positions
                      are liquidated.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
