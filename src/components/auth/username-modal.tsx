'use client';

import { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, User } from 'lucide-react';

interface UsernameModalProps {
  open: boolean;
  walletAddress: string;
  onComplete: (username: string) => void;
  onClose?: () => void;
  socialProfile?: {
    email?: string;
    avatar?: string;
    name?: string;
  } | null;
}

export function UsernameModal({
  open,
  walletAddress: _walletAddress,
  onComplete,
  onClose,
  socialProfile,
}: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const checkUsername = async (value: string) => {
    if (value.length < 3) {
      setAvailable(null);
      setError('');
      return;
    }

    setChecking(true);
    setError('');

    try {
      const res = await fetch(`/api/user/username/check?username=${value}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid username');
        setAvailable(false);
      } else {
        setAvailable(data.available);
      }
    } catch {
      setError('Failed to check username');
      setAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(cleaned);
    setAvailable(null);
    setError('');

    if (cleaned.length >= 3) {
      void checkUsername(cleaned);
    }
  };

  const handleSubmit = async () => {
    if (!available || !username) return;
    setCreating(true);

    try {
      await onComplete(username);
    } catch {
      setError('Failed to create profile');
      setCreating(false);
    }
  };

  const getRightIcon = () => {
    if (checking) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (available === true) return <Check className="w-4 h-4 text-success" />;
    if (available === false) return <X className="w-4 h-4 text-error" />;
    return null;
  };

  return (
    <Modal
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen && onClose) {
          onClose();
        }
      }}
      size="sm"
      showClose={true}
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <ModalHeader centered>
        <ModalTitle>Welcome to v1ta</ModalTitle>
        <ModalDescription>Choose your unique username to get started</ModalDescription>
      </ModalHeader>

      <ModalBody className="space-y-4">
        {socialProfile && (socialProfile.avatar || socialProfile.email) && (
          <div className="flex items-center gap-3 p-3 bg-surface/50 rounded-lg border border-border/50">
            {socialProfile.avatar ? (
              <img src={socialProfile.avatar} alt="Profile" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {socialProfile.name && (
                <p className="text-sm font-medium text-text-primary truncate">
                  {socialProfile.name}
                </p>
              )}
              {socialProfile.email && (
                <p className="text-xs text-text-tertiary truncate">{socialProfile.email}</p>
              )}
            </div>
            <Check className="w-4 h-4 text-success flex-shrink-0" />
          </div>
        )}

        <Input
          label="Username"
          value={username}
          onChange={handleUsernameChange}
          placeholder="satoshi"
          maxLength={20}
          rightIcon={getRightIcon()}
          error={error || (available === false && !error ? 'Username already taken' : undefined)}
          hint={
            available === true
              ? '✓ Username is available!'
              : '3-20 characters, letters, numbers, _ or -'
          }
          variant={available === true ? 'success' : available === false ? 'error' : 'default'}
          autoFocus
        />
      </ModalBody>

      <ModalFooter align="center">
        <Button
          fullWidth
          size="lg"
          disabled={!available || creating}
          onClick={handleSubmit}
          loading={creating}
          loadingText="Creating Profile..."
        >
          Continue
        </Button>
      </ModalFooter>
    </Modal>
  );
}
