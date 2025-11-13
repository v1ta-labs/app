import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
  metadata?: any;
  createdAt: string;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for real-time notifications using Server-Sent Events (SSE)
 * Automatically connects to SSE endpoint when wallet is connected
 * Provides methods to mark as read and delete notifications
 */
export function useNotifications(): UseNotificationsReturn {
  const { address, isConnected: walletConnected } = useAppKitAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const previousNotificationsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Fetch initial notifications
  const refresh = useCallback(async () => {
    if (!address) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/notifications?wallet=${address}&limit=50`);

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Connect to SSE endpoint for real-time updates
  useEffect(() => {
    if (!address || !walletConnected) {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
      // Reset on disconnect
      isInitialLoadRef.current = true;
      previousNotificationsRef.current = new Set();
      return;
    }

    // Reset for new connection
    isInitialLoadRef.current = true;
    previousNotificationsRef.current = new Set();

    // Create new SSE connection
    const eventSource = new EventSource(`/api/notifications/stream?wallet=${address}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'connected':
            break;

          case 'notifications':
            // Update notifications from SSE
            if (data.data) {
              const newNotifications: Notification[] = data.data.notifications || [];

              // Detect new notifications (ones we haven't seen before)
              const currentIds = previousNotificationsRef.current;
              const newOnes = newNotifications.filter(n => !n.read && !currentIds.has(n.id));

              // Update state
              setNotifications(newNotifications);
              setUnreadCount(data.data.unreadCount || 0);

              // Update tracked IDs
              previousNotificationsRef.current = new Set(newNotifications.map(n => n.id));

              // Show toast and browser notification for new ones
              // Skip on initial load (those are old notifications)
              if (newOnes.length > 0 && !isInitialLoadRef.current) {
                newOnes.forEach(notification => {
                  // Show toast notification with close button
                  toast(notification.title, {
                    description: notification.message,
                    duration: 5000,
                    dismissible: true,
                    closeButton: true,
                    action: notification.link
                      ? {
                          label: 'View',
                          onClick: () => {
                            if (notification.link) {
                              window.location.href = notification.link;
                            }
                          },
                        }
                      : undefined,
                  });

                  // Show browser notification if enabled and permission granted
                  const actualPermission =
                    typeof Notification !== 'undefined' ? Notification.permission : 'default';
                  const shouldShowBrowserNotification = actualPermission === 'granted';

                  if (shouldShowBrowserNotification) {
                    try {
                      const desktopNotification = new Notification(notification.title, {
                        body: notification.message,
                        icon: '/favicon.ico',
                        badge: '/favicon.ico',
                        tag: notification.id,
                        data: {
                          url: notification.link || '/positions',
                        },
                      });

                      desktopNotification.onclick = () => {
                        window.focus();
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                        desktopNotification.close();
                      };
                    } catch (error) {
                      console.error('Error showing desktop notification:', error);
                    }
                  }
                });
              } else {
                if (isInitialLoadRef.current) {
                  isInitialLoadRef.current = false;
                }
              }
            }
            break;

          case 'heartbeat':
            // Keep-alive ping
            break;

          case 'error':
            console.error('SSE error:', data.message);
            break;

          default:
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = error => {
      console.error('SSE connection error:', error);
      setIsConnected(false);

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
        // The useEffect will recreate the connection
      }, 5000);
    };

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [address, walletConnected]);

  // Fetch initial notifications on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      if (!address) return;

      try {
        const response = await fetch(`/api/notifications/${id}?wallet=${address}`, {
          method: 'PATCH',
        });

        if (!response.ok) {
          throw new Error('Failed to mark notification as read');
        }

        // Optimistically update local state
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
        // Revert on error
        await refresh();
      }
    },
    [address, refresh]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/notifications/mark-all-read?wallet=${address}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Optimistically update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert on error
      await refresh();
    }
  }, [address, refresh]);

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      if (!address) return;

      try {
        const response = await fetch(`/api/notifications/${id}?wallet=${address}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete notification');
        }

        // Optimistically update local state
        const wasUnread = notifications.find(n => n.id === id)?.read === false;
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        // Revert on error
        await refresh();
      }
    },
    [address, notifications, refresh]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}
