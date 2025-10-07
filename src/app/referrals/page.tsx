'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSD } from '@/lib/utils/formatters';
import { Copy, Check, Users, Gift, TrendingUp, Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const REFERRALS = [
  { address: '7Bk...3Hn', joined: '2025-10-01', volume: 12450, earnings: 62.25, status: 'active' },
  { address: '9Pm...5Qw', joined: '2025-09-28', volume: 8320, earnings: 41.60, status: 'active' },
  { address: '4Dx...8Wn', joined: '2025-09-25', volume: 15670, earnings: 78.35, status: 'active' },
  { address: '2Fp...4Ls', joined: '2025-09-20', volume: 5240, earnings: 26.20, status: 'active' },
  { address: '6Hn...5Pr', joined: '2025-09-18', volume: 18920, earnings: 94.60, status: 'active' },
];

const TIERS = [
  { name: 'Bronze', min: 0, commission: '0.5%', icon: '🥉', color: 'from-amber-700 to-amber-600' },
  { name: 'Silver', min: 50000, commission: '0.75%', icon: '🥈', color: 'from-gray-400 to-gray-500' },
  { name: 'Gold', min: 150000, commission: '1.0%', icon: '🥇', color: 'from-yellow-400 to-yellow-500' },
  { name: 'Platinum', min: 500000, commission: '1.5%', icon: '💎', color: 'from-cyan-400 to-blue-500' },
];

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'V1TA-XK9P-M2L7';
  const referralLink = `https://v1ta.fi?ref=${referralCode}`;

  const totalReferrals = REFERRALS.length;
  const totalVolume = REFERRALS.reduce((sum, ref) => sum + ref.volume, 0);
  const totalEarnings = REFERRALS.reduce((sum, ref) => sum + ref.earnings, 0);
  const activeReferrals = REFERRALS.filter(r => r.status === 'active').length;

  const currentTier = TIERS.filter(t => totalVolume >= t.min).pop() || TIERS[0];
  const nextTier = TIERS.find(t => t.min > totalVolume);
  const progressToNext = nextTier ? ((totalVolume - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-3">Referral Program</h1>
            <p className="text-text-tertiary">Earn rewards by inviting friends to V1ta Protocol</p>
          </div>

          {/* Your Referral Link */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-primary/10 to-success/10 border-primary/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-text-primary">Your Referral Link</div>
                  <div className="text-xs text-text-tertiary">Share this link to earn rewards</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 bg-surface/50 rounded-[12px] border border-border">
                  <div className="text-sm font-mono text-text-primary truncate">{referralLink}</div>
                </div>
                <Button
                  onClick={handleCopy}
                  className="shrink-0 gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-text-tertiary">
                <Zap className="w-3.5 h-3.5 text-warning" />
                <span>Earn {currentTier.commission} commission on every transaction your referrals make!</span>
              </div>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Total Referrals</div>
              </div>
              <div className="text-3xl font-bold text-text-primary">{totalReferrals}</div>
              <div className="text-xs text-success mt-1">{activeReferrals} active</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-success/10 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Total Volume</div>
              </div>
              <div className="text-3xl font-bold text-text-primary">{formatUSD(totalVolume)}</div>
              <div className="text-xs text-text-tertiary mt-1">From referrals</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-warning/10 rounded-xl">
                  <Gift className="w-4 h-4 text-warning" />
                </div>
                <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Total Earned</div>
              </div>
              <div className="text-3xl font-bold text-text-primary">{formatUSD(totalEarnings)}</div>
              <div className="text-xs text-success mt-1">+{formatUSD(24.50)} this week</div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Crown className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Current Tier</div>
              </div>
              <div className="text-3xl font-bold text-text-primary">{currentTier.icon} {currentTier.name}</div>
              <div className="text-xs text-text-tertiary mt-1">{currentTier.commission} commission</div>
            </Card>
          </div>

          {/* Tier Progress */}
          <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-bold text-text-primary mb-1">Tier Progress</div>
                <div className="text-xs text-text-tertiary">
                  {nextTier ? `${formatUSD(nextTier.min - totalVolume)} more to unlock ${nextTier.name}` : 'Max tier reached!'}
                </div>
              </div>
              {nextTier && (
                <div className="text-2xl">{nextTier.icon}</div>
              )}
            </div>
            <div className="h-3 bg-base rounded-full overflow-hidden mb-4">
              <div
                className={`h-full bg-gradient-to-r ${currentTier.color} transition-all duration-500`}
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {TIERS.map((tier, index) => (
                <div
                  key={tier.name}
                  className={`text-center p-3 rounded-xl border transition-all ${
                    totalVolume >= tier.min
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-base'
                  }`}
                >
                  <div className="text-xl mb-1">{tier.icon}</div>
                  <div className={`text-xs font-bold mb-0.5 ${totalVolume >= tier.min ? 'text-primary' : 'text-text-tertiary'}`}>
                    {tier.name}
                  </div>
                  <div className="text-[10px] text-text-tertiary">{tier.commission}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Referrals List & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Referrals */}
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-4">Your Referrals</h2>
              <div className="space-y-3">
                {REFERRALS.map((referral, index) => (
                  <motion.div
                    key={referral.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50 hover:bg-elevated/50 transition-all">
                      <div className="flex items-center gap-3">
                        {/* Index */}
                        <div className="w-8 h-8 rounded-lg bg-base border border-border flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-text-tertiary">#{index + 1}</span>
                        </div>

                        {/* Address */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-mono font-bold text-text-primary mb-1 truncate">{referral.address}</div>
                          <div className="text-xs text-text-tertiary">Joined {referral.joined}</div>
                        </div>

                        {/* Volume & Earnings */}
                        <div className="text-right">
                          <div className="text-sm font-bold text-text-primary mb-1">{formatUSD(referral.volume)}</div>
                          <div className="text-xs font-semibold text-success">+{formatUSD(referral.earnings)}</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-4">Global Leaderboard</h2>
              <Card className="p-4 backdrop-blur-xl bg-surface/70 border-border/50">
                <div className="space-y-3">
                  {[
                    { rank: 1, address: '3Hk...7Mn', referrals: 847, volume: 2847320, icon: '🥇', color: 'text-yellow-400' },
                    { rank: 2, address: '8Ym...2Qr', referrals: 623, volume: 1956400, icon: '🥈', color: 'text-gray-400' },
                    { rank: 3, address: '5KJ...9Rz', referrals: 489, volume: 1423850, icon: '🥉', color: 'text-amber-600' },
                    { rank: 4, address: '9Bv...3Kt', referrals: 312, volume: 982340, icon: '4', color: 'text-text-tertiary' },
                    { rank: 5, address: '2Fp...4Ls', referrals: 287, volume: 845620, icon: '5', color: 'text-text-tertiary' },
                    { rank: 6, address: '6Hn...5Pr', referrals: 254, volume: 723450, icon: '6', color: 'text-text-tertiary' },
                    { rank: 7, address: '1Qw...7Zx', referrals: 198, volume: 612380, icon: '7', color: 'text-text-tertiary' },
                    { rank: 8, address: '4Dx...8Wn', referrals: 176, volume: 534290, icon: '8', color: 'text-text-tertiary' },
                  ].map((leader, index) => (
                    <motion.div
                      key={leader.rank}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        leader.rank <= 3 ? 'bg-gradient-to-r from-base via-elevated to-base border border-border' : 'bg-base'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                        <span className={`text-xl font-bold ${leader.color}`}>
                          {leader.icon}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-mono font-bold text-text-primary mb-0.5 truncate">
                          {leader.address}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {leader.referrals} referrals • {formatUSD(leader.volume)}
                        </div>
                      </div>

                      {/* Trophy for top 3 */}
                      {leader.rank <= 3 && (
                        <Crown className={`w-5 h-5 ${leader.color}`} />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Your Rank */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#127</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary mb-0.5">You</div>
                        <div className="text-xs text-text-tertiary">{totalReferrals} referrals • {formatUSD(totalVolume)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-primary font-semibold">↑ 12 ranks</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <Card className="p-6 backdrop-blur-xl bg-surface/70 border-border/50">
            <h3 className="text-lg font-bold text-text-primary mb-4">How It Works</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">1️⃣</span>
                </div>
                <div className="text-sm font-bold text-text-primary mb-2">Share Your Link</div>
                <div className="text-xs text-text-tertiary">Copy your unique referral link and share it with friends</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">2️⃣</span>
                </div>
                <div className="text-sm font-bold text-text-primary mb-2">They Sign Up</div>
                <div className="text-xs text-text-tertiary">Your friends join V1ta using your link and start trading</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">3️⃣</span>
                </div>
                <div className="text-sm font-bold text-text-primary mb-2">Earn Rewards</div>
                <div className="text-xs text-text-tertiary">Get commission on every transaction they make</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
