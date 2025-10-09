'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';

interface UsernameModalProps {
  open: boolean;
  walletAddress: string;
  onComplete: (username: string) => void;
}

export function UsernameModal({ open, walletAddress, onComplete }: UsernameModalProps) {
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
    setUsername(value);
    setAvailable(null);
    setError('');

    if (value.length >= 3) {
      checkUsername(value);
    }
  };

  const handleSubmit = async () => {
    if (!available || !username) return;

    setCreating(true);

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, username }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create profile');
        return;
      }

      onComplete(username);
    } catch {
      setError('Failed to create profile');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to v1ta</h2>
            <p className="text-sm text-text-tertiary">Choose your unique username</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value.toLowerCase())}
                  placeholder="satoshi"
                  className="w-full px-4 py-3 bg-base border border-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  maxLength={20}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AnimatePresence mode="wait">
                    {checking && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="w-4 h-4 text-text-tertiary animate-spin" />
                      </motion.div>
                    )}
                    {!checking && available === true && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        <Check className="w-4 h-4 text-success" />
                      </motion.div>
                    )}
                    {!checking && available === false && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        <X className="w-4 h-4 text-error" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                3-20 characters, letters, numbers, _ or -
              </p>
              {error && <p className="text-xs text-error mt-2">{error}</p>}
              {available === false && !error && (
                <p className="text-xs text-error mt-2">Username is already taken</p>
              )}
              {available === true && (
                <p className="text-xs text-success mt-2">Username is available!</p>
              )}
            </div>

            <Button
              fullWidth
              size="lg"
              disabled={!available || creating}
              onClick={handleSubmit}
              className="mt-6"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
}
