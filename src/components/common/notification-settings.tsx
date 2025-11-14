'use client';

import { Bell, BellOff, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDialectNotifications } from '@/hooks/useDialectNotifications';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Notification Settings Component
 * Uses Dialect for multi-channel notifications (Push, Email, Telegram)
 * Works even when tab is closed or wallet disconnected
 */
export function NotificationSettings() {
  const { isSubscribed, subscribe, unsubscribe } = useDialectNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      const success = await subscribe();

      if (success) {
        toast.success('Multi-channel notifications enabled!', {
          description: "You&apos;ll receive alerts via push, email, and in-app",
        });
      } else {
        toast.error('Failed to enable notifications');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);

    try {
      const success = await unsubscribe();

      if (success) {
        toast.success('Notifications disabled');
      } else {
        toast.error('Failed to disable notifications');
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-3 backdrop-blur-xl bg-surface/70 border-border/50">
      <div className="flex items-start gap-2.5">
        <Bell className="w-4 h-4 text-primary mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-text-primary">Notifications</h3>
            {isSubscribed && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 text-success text-[9px] font-semibold">
                <span className="w-1 h-1 bg-success rounded-full animate-pulse" />
                Active
              </span>
            )}
          </div>

          {isSubscribed ? (
            <>
              <p className="text-[10px] text-text-secondary mb-2">
                Receiving alerts via push, email & in-app
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDisableNotifications}
                disabled={isLoading}
                className="w-full h-7 text-[10px]"
              >
                <BellOff className="w-3 h-3 mr-1.5" />
                Disable
              </Button>
            </>
          ) : (
            <>
              <p className="text-[10px] text-text-secondary mb-2">
                Get alerts even when tab is closed
              </p>
              <Button
                size="sm"
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="w-full h-7 text-[10px] bg-primary hover:bg-primary/90"
              >
                <Bell className="w-3 h-3 mr-1.5" />
                Enable Notifications
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
