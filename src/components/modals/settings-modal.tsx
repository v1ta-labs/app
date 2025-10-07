'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import * as Tabs from '@radix-ui/react-tabs';
import { X, Bell, Shield, Palette, Zap, Globe, Moon, Sun, Volume2, VolumeX, Eye, EyeOff, Database, Trash2, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
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

          <Tabs.Root defaultValue="general" className="flex h-[calc(85vh-88px)]">
            <Tabs.List className="w-56 border-r border-border p-4 space-y-1 overflow-y-auto">
              <TabButton value="general" icon={<Zap className="w-4 h-4" />} label="General" />
              <TabButton value="notifications" icon={<Bell className="w-4 h-4" />} label="Notifications" />
              <TabButton value="security" icon={<Shield className="w-4 h-4" />} label="Security" />
              <TabButton value="trading" icon={<RefreshCw className="w-4 h-4" />} label="Trading" />
              <TabButton value="appearance" icon={<Palette className="w-4 h-4" />} label="Appearance" />
              <TabButton value="data" icon={<Database className="w-4 h-4" />} label="Data & Privacy" />
            </Tabs.List>

            <div className="flex-1 overflow-y-auto p-6">
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
                      onChange={(e) => setLanguage(e.target.value)}
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
                    <Toggle checked={liquidationWarnings} onCheckedChange={setLiquidationWarnings} />
                  </SettingRow>
                  <SettingRow
                    label="Referral Updates"
                    description="Notify about referral activity"
                  >
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
                  <SettingRow
                    label="Auto-Lock Wallet"
                    description="Lock wallet after inactivity"
                  >
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
                        onChange={(e) => setSlippageTolerance(e.target.value)}
                        className="w-20 px-3 py-2 bg-base border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary text-right"
                        step="0.1"
                        min="0.1"
                        max="50"
                      />
                      <span className="text-sm text-text-tertiary">%</span>
                    </div>
                  </SettingRow>

                  <SettingRow
                    label="Priority Fee"
                    description="Transaction confirmation speed"
                  >
                    <select
                      value={priorityFee}
                      onChange={(e) => setPriorityFee(e.target.value)}
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
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        className="aspect-square rounded-xl border-2 border-border hover:border-primary transition-colors p-1"
                      >
                        <div className={`w-full h-full rounded-lg ${theme.color}`} />
                        <div className="text-xs text-text-tertiary mt-1 text-center">{theme.name}</div>
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
                  <Button variant="outline" className="w-full justify-start gap-2 text-error border-error/30 hover:bg-error/10">
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

function TabButton({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
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
      <div className="space-y-4">
        {children}
      </div>
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
          {description && (
            <div className="text-xs text-text-tertiary">{description}</div>
          )}
        </div>
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-base border border-border'}`}
    >
      <Switch.Thumb className={`block w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </Switch.Root>
  );
}
