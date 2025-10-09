'use client';

import { useState, useRef } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Mail, Copy, Check, ExternalLink, Calendar, TrendingUp, Camera, Send } from 'lucide-react';

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
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [saving, setSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState<'email' | 'twitter' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shortAddress = `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}`;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      // TODO: Implement verification API
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Show success toast
    } finally {
      setSendingVerification(null);
    }
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
          avatar: avatar || null,
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

  const handleCancel = () => {
    setEditing(false);
    setEmail(user.email || '');
    setBio(user.bio || '');
    setTwitter(user.twitter || '');
    setAvatar(user.avatar || '');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/user?wallet=${user.walletAddress}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onClose();
        onDisconnect();
        // Redirect to home page after account deletion
        window.location.href = '/';
      }
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>Profile</ModalTitle>
      </ModalHeader>

      <ModalBody className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="relative group flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-primary" />
              )}
            </div>
            {editing && (
              <>
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
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text-primary truncate">@{user.username}</h3>
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
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Fields */}
        <div className="space-y-4">
          <div>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="your@email.com"
              disabled={!editing}
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
            {email && !user.emailVerified && !editing && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => handleSendVerification('email')}
                loading={sendingVerification === 'email'}
                loadingText="Sending..."
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send Verification Email
              </Button>
            )}
          </div>

          <Textarea
            label="Bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            disabled={!editing}
            rows={3}
            maxLength={160}
            showCount={editing}
          />

          <div>
            <Input
              label="Twitter"
              value={twitter}
              onChange={value => setTwitter(value.replace('@', ''))}
              placeholder="username"
              disabled={!editing}
              leftIcon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              }
              leftElement={<span className="pl-3 text-text-tertiary">@</span>}
              rightElement={
                twitter && !editing ? (
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
            {twitter && !editing && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => handleSendVerification('twitter')}
                loading={sendingVerification === 'twitter'}
                loadingText="Verifying..."
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Verify Twitter Account
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-base rounded-xl border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-text-tertiary" />
              <p className="text-xs text-text-tertiary uppercase tracking-wide font-semibold">
                Member Since
              </p>
            </div>
            <p className="text-sm font-bold text-text-primary">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="p-4 bg-base rounded-xl border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-text-tertiary" />
              <p className="text-xs text-text-tertiary uppercase tracking-wide font-semibold">
                Positions
              </p>
            </div>
            <p className="text-sm font-bold text-text-primary">0</p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter align={editing ? 'between' : 'center'}>
        {editing ? (
          <>
            <Button variant="ghost" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving} loadingText="Saving...">
              Save Changes
            </Button>
          </>
        ) : showDeleteConfirm ? (
          <>
            <div className="w-full space-y-3">
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
          </>
        ) : (
          <div className="w-full space-y-2">
            <Button
              fullWidth
              variant="danger"
              onClick={() => {
                onDisconnect();
                onClose();
              }}
            >
              Disconnect Wallet
            </Button>
            <Button
              fullWidth
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-error hover:text-error hover:bg-error/5"
            >
              Delete Account
            </Button>
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
}
