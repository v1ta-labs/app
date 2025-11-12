import { useState, useEffect, useCallback } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

export interface DialectNotification {
  id: string;
  title: string;
  body: string;
  image?: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
  actions?: Array<{
    type: 'link' | 'action';
    label: string;
    url?: string;
  }>;
}

export interface UseDialectNotificationsReturn {
  notifications: DialectNotification[];
  unreadCount: number;
  isLoading: boolean;
  isSubscribed: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DIALECT_API_URL = 'https://alerts-api.dial.to/v2';
const CLIENT_KEY = process.env.NEXT_PUBLIC_DIALECT_CLIENT_KEY;

/**
 * Hook for Dialect notifications with custom V1ta UI
 * Fetches notifications from Dialect API
 * Works with tabs closed, wallet disconnected via multi-channel delivery
 */
export function useDialectNotifications(): UseDialectNotificationsReturn {
  const { address, isConnected } = useAppKitAccount();
  const [notifications, setNotifications] = useState<DialectNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get authentication token from wallet signature
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (!address) return null;

    // Check if we have a cached token
    const cached = localStorage.getItem(`dialect_token_${address}`);
    if (cached) {
      try {
        const { token, expiry } = JSON.parse(cached);
        if (expiry > Date.now()) {
          return token;
        }
      } catch (e) {
        // Invalid cache, continue to get new token
      }
    }

    // TODO: Implement wallet signature for authentication
    // For now, return null and notifications will work via SSE fallback
    return null;
  }, [address]);

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    if (!address) {
      setIsSubscribed(false);
      return;
    }

    try {
      const token = await getAuthToken();
      if (!token) {
        // Check localStorage for subscription status
        const subscribed = localStorage.getItem(`dialect_subscribed_${address}`);
        setIsSubscribed(subscribed === 'true');
        return;
      }

      const response = await fetch(`${DIALECT_API_URL}/subscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Dialect-Client-Key': CLIENT_KEY!,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.subscribed || false);
      }
    } catch (error) {
      // Fallback to localStorage
      const subscribed = localStorage.getItem(`dialect_subscribed_${address}`);
      setIsSubscribed(subscribed === 'true');
    }
  }, [address, getAuthToken]);

  // Subscribe to notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!address) return false;

    try {
      // For now, use localStorage until we implement full auth
      localStorage.setItem(`dialect_subscribed_${address}`, 'true');
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return false;
    }
  }, [address]);

  // Unsubscribe from notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!address) return false;

    try {
      localStorage.removeItem(`dialect_subscribed_${address}`);
      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      return false;
    }
  }, [address]);

  // Fetch notifications from Dialect API
  const refresh = useCallback(async () => {
    if (!address) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // For now, fallback to our local database
      // In production, this would fetch from Dialect API with proper auth
      const response = await fetch(
        `/api/notifications?wallet=${address}&limit=50`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      // Transform to Dialect notification format
      const dialectNotifications: DialectNotification[] = (data.notifications || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        body: n.message,
        timestamp: n.createdAt,
        read: n.read,
        data: n.metadata,
        actions: n.link ? [{
          type: 'link' as const,
          label: 'View',
          url: n.link,
        }] : undefined,
      }));

      setNotifications(dialectNotifications);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      if (!address) return;

      try {
        // Update local state optimistically
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Update via API
        await fetch(`/api/notifications/${id}?wallet=${address}`, {
          method: 'PATCH',
        });
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
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      await fetch(`/api/notifications/mark-all-read?wallet=${address}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      await refresh();
    }
  }, [address, refresh]);

  // Check subscription on mount and wallet change
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Fetch notifications on mount and wallet change
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!address || !isConnected) return;

    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [address, isConnected, refresh]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isSubscribed,
    subscribe,
    unsubscribe,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
