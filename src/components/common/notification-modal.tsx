'use client';

import * as Popover from '@radix-ui/react-popover';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock notifications - replace with real data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Position Health Alert',
    message: 'Your collateral ratio is approaching liquidation threshold',
    timestamp: '2 hours ago',
    read: false,
    type: 'warning',
    link: '/positions',
  },
  {
    id: '2',
    title: 'Borrow Successful',
    message: 'Successfully borrowed 1,000 VUSD',
    timestamp: '1 day ago',
    read: true,
    type: 'success',
  },
  {
    id: '3',
    title: 'Protocol Update',
    message: 'New interest rate model deployed',
    timestamp: '3 days ago',
    read: true,
    type: 'info',
  },
];

export function NotificationModal({ open, onOpenChange }: NotificationModalProps) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-primary';
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button className="p-2 hover:bg-surface rounded-[12px] transition-colors relative">
          <Bell className="w-5 h-5 text-text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse" />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="w-[380px] bg-surface/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
          align="end"
          sideOffset={8}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-primary/20 text-primary rounded">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-12 h-12 rounded-xl bg-elevated border border-border/50 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-text-tertiary" />
                </div>
                <p className="text-sm text-text-tertiary">No notifications</p>
              </div>
            ) : (
              <div className="py-1">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      'px-4 py-3 border-b border-border/20 hover:bg-elevated/50 transition-all group',
                      !notification.read && 'bg-primary/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full mt-1.5',
                          !notification.read ? 'bg-primary' : 'bg-transparent'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={cn('text-sm font-semibold', getTypeColor(notification.type))}
                          >
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => clearNotification(notification.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-surface rounded"
                          >
                            <X className="w-3.5 h-3.5 text-text-tertiary hover:text-text-primary" />
                          </button>
                        </div>
                        <p className="text-xs text-text-secondary mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-text-tertiary">
                            {notification.timestamp}
                          </span>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-[10px] font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Mark read
                              </button>
                            )}
                            {notification.link && (
                              <a
                                href={notification.link}
                                className="text-[10px] font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
                              >
                                View
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border/30">
              <button className="w-full text-center text-xs font-medium text-primary hover:text-primary-hover transition-colors">
                View all notifications
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
