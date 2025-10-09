'use client';

import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import * as Tabs from '@radix-ui/react-tabs';
import {
  X,
  Bell,
  Shield,
  Palette,
  Zap,
  Globe,
  Moon,
  User as UserIcon,
  Volume2,
  Eye,
  Database,
  Trash2,
  Download,
  RefreshCw,
  Camera,
  Mail,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';

interface UserProfile {
  walletAddress: string;
  username: string;
  email?: string | null;
  emailVerified: boolean;
  avatar?: string | null;
  bio?: string | null;
  twitter?: string | null;
  createdAt: Date;
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserProfile | null;
  onDisconnect?: () => void;
  onUpdate?: () => void;
}

export function SettingsModal({ open, onOpenChange, user, onDisconnect, onUpdate }: SettingsModalProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [showBalances, setShowBalances] = useState(true);
  const [language, setLanguage] = useState('en');

  const [priceAlerts, setPriceAlerts] = useState(true);
  const [transactionNotifs, setTransactionNotifs] = useState(true);
  const [liquidationWarnings, setLiquidationWarnings] = useState(true);
  const [referralUpdates, setReferralUpdates] = useState(false);

  const [twoFactor, setTwoFactor] = useState(false);
  const [autoLock, setAutoLock] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  const [slippageTolerance, setSlippageTolerance] = useState('0.5');
  const [autoApprove, setAutoApprove] = useState(false);
  const [priorityFee, setPriorityFee] = useState('medium');

  // Profile editing states
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [twitter, setTwitter] = useState(user?.twitter || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState<'email' | 'twitter' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendVerification = async (type: 'email' | 'twitter') => {
    setSendingVerification(type);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setSendingVerification(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: user.walletAddress,
          email: email || null,
          bio: bio || null,
          twitter: twitter || null,
          avatar: avatar || null,
        }),
      });

      if (res.ok && onUpdate) {
        onUpdate();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/user?wallet=${user.walletAddress}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onOpenChange(false);
        if (onDisconnect) onDisconnect();
        // Redirect to home page after account deletion
        window.location.href = '/';
      }
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-base/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[85vh] bg-surface border border-border rounded-[24px] shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <Dialog.Title className="text-2xl font-bold text-text-primary">Settings</Dialog.Title>
              <Dialog.Description className="text-sm text-text-tertiary mt-1">
                Customize your V1ta Protocol experience
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="w-8 h-8 rounded-lg hover:bg-elevated transition-colors flex items-center justify-center text-text-tertiary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <Tabs.Root defaultValue={user ? "profile" : "general"} className="flex h-[calc(85vh-88px)]">
            <Tabs.List className="w-56 border-r border-border p-4 space-y-1 overflow-y-auto">
              {user && <TabButton value="profile" icon={<UserIcon className="w-4 h-4" />} label="Profile" />}
              <TabButton value="general" icon={<Zap className="w-4 h-4" />} label="General" />
              <TabButton
                value="notifications"
                icon={<Bell className="w-4 h-4" />}
                label="Notifications"
              />
              <TabButton value="security" icon={<Shield className="w-4 h-4" />} label="Security" />
              <TabButton value="trading" icon={<RefreshCw className="w-4 h-4" />} label="Trading" />
              <TabButton
                value="appearance"
                icon={<Palette className="w-4 h-4" />}
                label="Appearance"
              />
              <TabButton
                value="data"
                icon={<Database className="w-4 h-4" />}
                label="Data & Privacy"
              />
            </Tabs.List>

            <div className="flex-1 overflow-y-auto p-6">
              {user && (
                <Tabs.Content value="profile" className="space-y-6">
                  <Section title="Avatar">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
                          {avatar ? (
                            <img src={avatar} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-primary">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center"
                        >
                          <Camera className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary mb-1">@{user.username}</p>
                        <p className="text-xs text-text-tertiary">
                          Click on avatar to change your profile picture
                        </p>
                      </div>
                    </div>
                  </Section>

                  <Section title="Profile Information">
                    <div className="space-y-4">
                      <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="your@email.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        hint={
                          user.emailVerified
                            ? '✓ Verified'
                            : email && !user.emailVerified
                              ? 'Unverified - verification needed'
                              : undefined
                        }
                        variant={user.emailVerified ? 'success' : 'default'}
                      />
                      {email && !user.emailVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendVerification('email')}
                          loading={sendingVerification === 'email'}
                          loadingText="Sending..."
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                        >
                          Send Verification Email
                        </Button>
                      )}

                      <Textarea
                        label="Bio"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        maxLength={160}
                        showCount
                      />

                      <Input
                        label="Twitter"
                        value={twitter}
                        onChange={value => setTwitter(value.replace('@', ''))}
                        placeholder="username"
                        leftIcon={
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        }
                        leftElement={<span className="pl-3 text-text-tertiary">@</span>}
                        rightElement={
                          twitter ? (
                            <a
                              href={`https://twitter.com/${twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pr-3 text-text-tertiary hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : undefined
                        }
                      />
                      {twitter && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendVerification('twitter')}
                          loading={sendingVerification === 'twitter'}
                          loadingText="Verifying..."
                          leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        >
                          Verify Twitter Account
                        </Button>
                      )}
                    </div>

                    <Button onClick={handleSaveProfile} loading={saving} loadingText="Saving..." className="mt-4">
                      Save Profile
                    </Button>
                  </Section>

                  {showDeleteConfirm ? (
                    <Section title="Delete Account">
                      <div className="space-y-3">
                        <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                          <p className="text-sm text-text-primary font-medium mb-1">Delete your account?</p>
                          <p className="text-xs text-text-secondary mb-2">
                            This will permanently delete your profile and activity data. This action cannot be undone.
                          </p>
                          <p className="text-xs text-success font-medium">
                            ✓ Your funds will remain safe in your wallet
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            fullWidth
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deleting}
                          >
                            Cancel
                          </Button>
                          <Button
                            fullWidth
                            variant="danger"
                            onClick={handleDeleteAccount}
                            loading={deleting}
                            loadingText="Deleting..."
                          >
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </Section>
                  ) : (
                    <Section title="Danger Zone">
                      <Button
                        fullWidth
                        variant="ghost"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-error hover:text-error hover:bg-error/5"
                      >
                        Delete Account
                      </Button>
                    </Section>
                  )}
                </Tabs.Content>
              )}

              <Tabs.Content value="general" className="space-y-6">
                <Section title="Display">
                  <SettingRow
                    label="Show Balances"
                    description="Display your wallet balances"
                    icon={<Eye className="w-4 h-4" />}
                  >
                    <Toggle checked={showBalances} onCheckedChange={setShowBalances} />
                  </SettingRow>
                  <SettingRow
                    label="Sound Effects"
                    description="Play sounds for transactions"
                    icon={<Volume2 className="w-4 h-4" />}
                  >
                    <Toggle checked={soundEffects} onCheckedChange={setSoundEffects} />
                  </SettingRow>
                </Section>

                <Section title="Localization">
                  <SettingRow
                    label="Language"
                    description="Choose your preferred language"
                    icon={<Globe className="w-4 h-4" />}
                  >
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                      <option value="zh">中文</option>
                    </select>
                  </SettingRow>
                </Section>
              </Tabs.Content>

              <Tabs.Content value="notifications" className="space-y-6">
                <Section title="Alerts">
                  <SettingRow
                    label="Price Alerts"
                    description="Get notified when asset prices change"
                  >
                    <Toggle checked={priceAlerts} onCheckedChange={setPriceAlerts} />
                  </SettingRow>
                  <SettingRow
                    label="Transaction Notifications"
                    description="Notify when transactions complete"
                  >
                    <Toggle checked={transactionNotifs} onCheckedChange={setTransactionNotifs} />
                  </SettingRow>
                  <SettingRow
                    label="Liquidation Warnings"
                    description="Alert when approaching liquidation"
                  >
                    <Toggle
                      checked={liquidationWarnings}
                      onCheckedChange={setLiquidationWarnings}
                    />
                  </SettingRow>
                  <SettingRow label="Referral Updates" description="Notify about referral activity">
                    <Toggle checked={referralUpdates} onCheckedChange={setReferralUpdates} />
                  </SettingRow>
                </Section>
              </Tabs.Content>

              <Tabs.Content value="security" className="space-y-6">
                <Section title="Authentication">
                  <SettingRow
                    label="Two-Factor Authentication"
                    description="Add an extra layer of security"
                  >
                    <Toggle checked={twoFactor} onCheckedChange={setTwoFactor} />
                  </SettingRow>
                  <SettingRow label="Auto-Lock Wallet" description="Lock wallet after inactivity">
                    <Toggle checked={autoLock} onCheckedChange={setAutoLock} />
                  </SettingRow>
                  <SettingRow
                    label="Biometric Authentication"
                    description="Use fingerprint or face ID"
                  >
                    <Toggle checked={biometrics} onCheckedChange={setBiometrics} />
                  </SettingRow>
                </Section>

                <Section title="Session">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Clear Active Sessions
                  </Button>
                </Section>
              </Tabs.Content>

              <Tabs.Content value="trading" className="space-y-6">
                <Section title="Transaction Settings">
                  <SettingRow
                    label="Slippage Tolerance"
                    description="Maximum price movement tolerance"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={slippageTolerance}
                        onChange={e => setSlippageTolerance(e.target.value)}
                        className="w-20 px-3 py-2 bg-base border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary text-right"
                        step="0.1"
                        min="0.1"
                        max="50"
                      />
                      <span className="text-sm text-text-tertiary">%</span>
                    </div>
                  </SettingRow>

                  <SettingRow label="Priority Fee" description="Transaction confirmation speed">
                    <select
                      value={priorityFee}
                      onChange={e => setPriorityFee(e.target.value)}
                      className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="low">Low (Slow)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (Fast)</option>
                    </select>
                  </SettingRow>

                  <SettingRow
                    label="Auto-Approve Transactions"
                    description="Skip confirmation prompts"
                  >
                    <Toggle checked={autoApprove} onCheckedChange={setAutoApprove} />
                  </SettingRow>
                </Section>
              </Tabs.Content>

              <Tabs.Content value="appearance" className="space-y-6">
                <Section title="Theme">
                  <SettingRow
                    label="Dark Mode"
                    description="Use dark theme throughout the app"
                    icon={<Moon className="w-4 h-4" />}
                  >
                    <Toggle checked={darkMode} onCheckedChange={setDarkMode} />
                  </SettingRow>
                </Section>

                <Section title="Color Scheme">
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { name: 'Forest', color: 'bg-gradient-to-br from-primary to-success' },
                      { name: 'Ocean', color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
                      { name: 'Sunset', color: 'bg-gradient-to-br from-orange-500 to-pink-500' },
                      { name: 'Purple', color: 'bg-gradient-to-br from-purple-500 to-indigo-500' },
                    ].map(theme => (
                      <button
                        key={theme.name}
                        className="aspect-square rounded-xl border-2 border-border hover:border-primary transition-colors p-1"
                      >
                        <div className={`w-full h-full rounded-lg ${theme.color}`} />
                        <div className="text-xs text-text-tertiary mt-1 text-center">
                          {theme.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </Section>
              </Tabs.Content>

              <Tabs.Content value="data" className="space-y-6">
                <Section title="Your Data">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="w-4 h-4" />
                    Export Transaction History
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-error border-error/30 hover:bg-error/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Local Cache
                  </Button>
                </Section>

                <Section title="Privacy">
                  <div className="p-4 bg-base rounded-xl border border-border">
                    <div className="text-sm text-text-primary mb-2">Analytics & Tracking</div>
                    <div className="text-xs text-text-tertiary mb-4">
                      We collect anonymized usage data to improve V1ta Protocol
                    </div>
                    <Button variant="outline" size="sm">
                      Manage Privacy Settings
                    </Button>
                  </div>
                </Section>
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function TabButton({
  value,
  icon,
  label,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Tabs.Trigger
      value={value}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
    >
      {icon}
      <span>{label}</span>
    </Tabs.Trigger>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  icon,
  children,
}: {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-base rounded-xl border border-border">
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-tertiary mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="text-sm font-medium text-text-primary mb-1">{label}</div>
          {description && <div className="text-xs text-text-tertiary">{description}</div>}
        </div>
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-base border border-border'}`}
    >
      <Switch.Thumb
        className={`block w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}
      />
    </Switch.Root>
  );
}
