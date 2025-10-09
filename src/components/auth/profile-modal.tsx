'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import {
  X,
  LogOut,
  User,
  Mail,
  Edit3,
  Copy,
  Check,
  ExternalLink,
  Twitter
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

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

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  onDisconnect: () => void;
  onUpdate: () => void;
}

export function ProfileModal({ open, onClose, user, onDisconnect, onUpdate }: ProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user.email || '');
  const [bio, setBio] = useState(user.bio || '');
  const [twitter, setTwitter] = useState(user.twitter || '');
  const [saving, setSaving] = useState(false);

  const shortAddress = `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}`;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
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
        }),
      });

      if (res.ok) {
        setEditing(false);
        onUpdate();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <Dialog.Title className="text-xl font-bold text-text-primary">
                Profile
              </Dialog.Title>
              <div className="flex items-center gap-2">
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 hover:bg-elevated rounded-lg transition-all text-text-tertiary hover:text-text-primary"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <Dialog.Close asChild>
                  <button className="p-2 hover:bg-elevated rounded-lg transition-all text-text-tertiary hover:text-text-primary">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary">@{user.username}</h3>
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors group"
                  >
                    <span className="font-mono">{shortAddress}</span>
                    {copied ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <Copy className="w-3 h-3 group-hover:text-text-primary transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                    {user.emailVerified && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-success/10 text-success rounded uppercase">
                        Verified
                      </span>
                    )}
                    {email && !user.emailVerified && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-warning/10 text-warning rounded uppercase">
                        Unverified
                      </span>
                    )}
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 bg-base border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-text-primary">
                      {user.email || <span className="text-text-tertiary">Not set</span>}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
                    Bio
                  </label>
                  {editing ? (
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      maxLength={160}
                      className="w-full px-3 py-2 bg-base border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-text-primary min-h-[80px]">
                      {user.bio || <span className="text-text-tertiary">No bio yet</span>}
                    </p>
                  )}
                </div>

                {/* Twitter */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                    <Twitter className="w-3.5 h-3.5" />
                    Twitter
                  </label>
                  {editing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">
                        @
                      </span>
                      <input
                        type="text"
                        value={twitter}
                        onChange={e => setTwitter(e.target.value.replace('@', ''))}
                        placeholder="username"
                        className="w-full pl-7 pr-3 py-2 bg-base border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  ) : user.twitter ? (
                    <a
                      href={`https://twitter.com/${user.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-base border border-border rounded-lg text-sm text-text-primary hover:border-primary/50 transition-all group"
                    >
                      <span>@{user.twitter}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-tertiary group-hover:text-primary transition-colors" />
                    </a>
                  ) : (
                    <p className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-text-tertiary">
                      Not connected
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/30">
                <div className="p-3 bg-base rounded-xl border border-border/30">
                  <p className="text-xs text-text-tertiary mb-1">Member Since</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="p-3 bg-base rounded-xl border border-border/30">
                  <p className="text-xs text-text-tertiary mb-1">Total Positions</p>
                  <p className="text-sm font-semibold text-text-primary">0</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border/30 space-y-2">
              {editing ? (
                <div className="flex gap-2">
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => {
                      setEditing(false);
                      setEmail(user.email || '');
                      setBio(user.bio || '');
                      setTwitter(user.twitter || '');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button fullWidth onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => {
                    onDisconnect();
                    onClose();
                  }}
                  className="text-error hover:text-error"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect Wallet
                </Button>
              )}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
