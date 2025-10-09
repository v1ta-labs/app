'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User, Settings, LogOut, Calendar, TrendingUp, Copy, Check } from 'lucide-react';
import { useState } from 'react';

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

interface ProfileDropdownProps {
  user: UserProfile;
  children: React.ReactNode;
  onSettingsClick: () => void;
  onDisconnect: () => void;
}

export function ProfileDropdown({
  user,
  children,
  onSettingsClick,
  onDisconnect,
}: ProfileDropdownProps) {
  const [copied, setCopied] = useState(false);
  const shortAddress = `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[280px] bg-surface border border-border rounded-xl shadow-2xl p-2 z-[100]"
          sideOffset={8}
          align="end"
        >
          {/* Profile Header */}
          <div className="px-3 py-3 mb-2 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">@{user.username}</p>
                {user.email && <p className="text-xs text-text-tertiary truncate">{user.email}</p>}
              </div>
            </div>

            <button
              onClick={copyAddress}
              className="flex items-center gap-2 px-2 py-1.5 w-full rounded-lg hover:bg-elevated transition-colors group"
            >
              <span className="text-xs font-mono text-text-secondary flex-1 text-left">
                {shortAddress}
              </span>
              {copied ? (
                <Check className="w-3 h-3 text-success" />
              ) : (
                <Copy className="w-3 h-3 text-text-tertiary group-hover:text-text-primary transition-colors" />
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="px-2 py-2 mb-2 grid grid-cols-2 gap-2">
            <div className="px-3 py-2 bg-base rounded-lg border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3 h-3 text-text-tertiary" />
                <p className="text-[10px] text-text-tertiary uppercase tracking-wide font-semibold">
                  Member Since
                </p>
              </div>
              <p className="text-xs font-bold text-text-primary">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="px-3 py-2 bg-base rounded-lg border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-text-tertiary" />
                <p className="text-[10px] text-text-tertiary uppercase tracking-wide font-semibold">
                  Positions
                </p>
              </div>
              <p className="text-xs font-bold text-text-primary">0</p>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu.Item
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-text-primary hover:bg-elevated rounded-lg outline-none cursor-pointer transition-colors"
            onSelect={onSettingsClick}
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Settings</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border my-2" />

          <DropdownMenu.Item
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-error hover:bg-error/5 rounded-lg outline-none cursor-pointer transition-colors"
            onSelect={onDisconnect}
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Disconnect</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
