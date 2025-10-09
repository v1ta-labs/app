'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';

interface UsernameModalProps {
  open: boolean;
  walletAddress: string;
  onComplete: (username: string) => void;
  onClose?: () => void;
}

export function UsernameModal({ open, walletAddress, onComplete, onClose }: UsernameModalProps) {
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
      checkUsername(cleaned);
    }
  };

  const handleSubmit = async () => {
    if (!available || !username) return;
    setCreating(true);

    try {
      await onComplete(username);
    } catch (error) {
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
      onOpenChange={onClose ? () => onClose() : undefined}
      size="sm"
      showClose={!!onClose}
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <ModalHeader centered>
        <ModalTitle>Welcome to v1ta</ModalTitle>
        <ModalDescription>Choose your unique username to get started</ModalDescription>
      </ModalHeader>

      <ModalBody>
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
