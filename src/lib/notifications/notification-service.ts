import { db } from '@/lib/db/client';
import { NotificationType } from '@prisma/client';
import { DialectService } from '@/lib/dialect/dialect-service';

export interface CreateNotificationData {
  walletAddress: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

/**
 * Notification Service
 * Handles creating and managing notifications for users
 * Dual-channel: Local DB + SSE for in-app, Dialect for multi-channel (email, Telegram, push)
 */
export class NotificationService {
  /**
   * Create a new notification
   * Sends via both local database (SSE) and Dialect (multi-channel)
   */
  static async create(data: CreateNotificationData) {
    try {
      // Create in local database for SSE and in-app notifications
      const notification = await db.notification.create({
        data: {
          walletAddress: data.walletAddress,
          type: data.type,
          title: data.title,
          message: data.message,
          link: data.link,
          metadata: data.metadata || undefined,
          expiresAt: data.expiresAt,
        },
      });

      // Also send via Dialect for multi-channel delivery (async, don't wait)
      this.sendViaDialect(data).catch(error => {
        console.error('Failed to send via Dialect:', error);
        // Don't fail the whole operation if Dialect fails
      });

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Send notification via Dialect API for multi-channel delivery
   * This enables notifications even when tab is closed or wallet disconnected
   */
  private static async sendViaDialect(data: CreateNotificationData) {
    const fullLink = data.link?.startsWith('http')
      ? data.link
      : `${process.env.NEXT_PUBLIC_APP_URL || 'https://v1ta.xyz'}${data.link || '/positions'}`;

    await DialectService.sendNotification(
      {
        title: data.title,
        body: data.message,
        actions: data.link
          ? [
              {
                type: 'link',
                label: 'View',
                url: fullLink,
              },
            ]
          : undefined,
      },
      {
        walletAddress: data.walletAddress,
        channels: ['PUSH', 'EMAIL', 'IN_APP'],
        data: data.metadata,
        // High priority for critical notifications
        priority: this.isPriorityNotification(data.type) ? 'high' : 'normal',
      }
    );
  }

  /**
   * Determine if notification type should have high priority
   */
  private static isPriorityNotification(type: NotificationType): boolean {
    return type === 'POSITION_HEALTH_WARNING' || type === 'POSITION_LIQUIDATED';
  }

  /**
   * Create a position health warning notification
   */
  static async notifyPositionHealthWarning(
    walletAddress: string,
    collateralRatio: number,
    positionId?: string
  ) {
    return this.create({
      walletAddress,
      type: 'POSITION_HEALTH_WARNING',
      title: 'Position Health Alert',
      message: `Your collateral ratio (${collateralRatio.toFixed(
        1
      )}%) is approaching the liquidation threshold of 110%`,
      link: '/positions',
      metadata: { collateralRatio, positionId },
    });
  }

  /**
   * Create a position liquidated notification
   */
  static async notifyPositionLiquidated(
    walletAddress: string,
    debtCovered: number,
    collateralLost: number,
    signature: string
  ) {
    return this.create({
      walletAddress,
      type: 'POSITION_LIQUIDATED',
      title: 'Position Liquidated',
      message: `Your position was liquidated. ${debtCovered.toFixed(
        2
      )} vUSD debt repaid, ${collateralLost.toFixed(4)} SOL collateral lost`,
      link: `/transactions/${signature}`,
      metadata: { debtCovered, collateralLost, signature },
    });
  }

  /**
   * Create a borrow success notification
   */
  static async notifyBorrowSuccess(walletAddress: string, amount: number, signature: string) {
    return this.create({
      walletAddress,
      type: 'BORROW_SUCCESS',
      title: 'Borrow Successful',
      message: `Successfully borrowed ${amount.toFixed(2)} vUSD`,
      link: `/transactions/${signature}`,
      metadata: { amount, signature },
    });
  }

  /**
   * Create a repay success notification
   */
  static async notifyRepaySuccess(walletAddress: string, amount: number, signature: string) {
    return this.create({
      walletAddress,
      type: 'REPAY_SUCCESS',
      title: 'Repayment Successful',
      message: `Successfully repaid ${amount.toFixed(2)} vUSD`,
      link: `/transactions/${signature}`,
      metadata: { amount, signature },
    });
  }

  /**
   * Create a collateral added notification
   */
  static async notifyCollateralAdded(
    walletAddress: string,
    amount: number,
    collateralType: string,
    signature: string
  ) {
    return this.create({
      walletAddress,
      type: 'COLLATERAL_ADDED',
      title: 'Collateral Added',
      message: `Added ${amount.toFixed(4)} ${collateralType} as collateral`,
      link: `/transactions/${signature}`,
      metadata: { amount, collateralType, signature },
    });
  }

  /**
   * Create a collateral removed notification
   */
  static async notifyCollateralRemoved(
    walletAddress: string,
    amount: number,
    collateralType: string,
    signature: string
  ) {
    return this.create({
      walletAddress,
      type: 'COLLATERAL_REMOVED',
      title: 'Collateral Removed',
      message: `Removed ${amount.toFixed(4)} ${collateralType} from collateral`,
      link: `/transactions/${signature}`,
      metadata: { amount, collateralType, signature },
    });
  }

  /**
   * Create a protocol update notification (broadcast to all users)
   */
  static async notifyProtocolUpdate(title: string, message: string, link?: string) {
    // Get all user wallet addresses
    const users = await db.user.findMany({
      select: { walletAddress: true },
    });

    // Create notification for each user
    const notifications = await Promise.allSettled(
      users.map(user =>
        this.create({
          walletAddress: user.walletAddress,
          type: 'PROTOCOL_UPDATE',
          title,
          message,
          link,
        })
      )
    );

    return notifications;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, walletAddress: string) {
    try {
      const notification = await db.notification.update({
        where: {
          id: notificationId,
          walletAddress, // Ensure user owns this notification
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return notification;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(walletAddress: string) {
    try {
      const result = await db.notification.updateMany({
        where: {
          walletAddress,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async delete(notificationId: string, walletAddress: string) {
    try {
      const notification = await db.notification.delete({
        where: {
          id: notificationId,
          walletAddress, // Ensure user owns this notification
        },
      });

      return notification;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getForUser(
    walletAddress: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ) {
    const { limit = 50, offset = 0, unreadOnly = false } = options;

    try {
      const notifications = await db.notification.findMany({
        where: {
          walletAddress,
          ...(unreadOnly && { read: false }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return notifications;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(walletAddress: string) {
    try {
      const count = await db.notification.count({
        where: {
          walletAddress,
          read: false,
        },
      });

      return count;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpired() {
    try {
      const result = await db.notification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      return result;
    } catch (error) {
      console.error('Failed to cleanup expired notifications:', error);
      throw error;
    }
  }
}
