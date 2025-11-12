'use client';

import * as Popover from '@radix-ui/react-popover';
import { Bell, Check, X, ExternalLink, Loader2, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useNotifications } from '@/hooks';
import { formatDistanceToNow } from 'date-fns';
import { NotificationSettings } from './notification-settings';

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationModal({ open, onOpenChange }: NotificationModalProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BORROW_SUCCESS':
      case 'REPAY_SUCCESS':
      case 'COLLATERAL_ADDED':
        return 'text-success';
      case 'POSITION_HEALTH_WARNING':
        return 'text-warning';
      case 'POSITION_LIQUIDATED':
        return 'text-error';
      case 'PROTOCOL_UPDATE':
      case 'SYSTEM_ALERT':
        return 'text-primary';
      default:
        return 'text-text-primary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
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
              {/* Real-time connection indicator */}
              {isConnected ? (
                <div className="flex items-center gap-1 text-[9px] text-success" title="Real-time updates active">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  <span className="font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[9px] text-text-tertiary" title="Reconnecting...">
                  <WifiOff className="w-2.5 h-2.5" />
                </div>
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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-text-tertiary">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
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
                            onClick={() => deleteNotification(notification.id)}
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
                            {formatTimestamp(notification.createdAt)}
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
                                onClick={() => onOpenChange(false)}
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

          {/* Footer - Settings */}
          <div className="px-4 py-3 border-t border-border/30">
            <NotificationSettings />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
