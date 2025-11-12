/**
 * Dialect Notification Service
 * Handles sending multi-channel notifications (push, email, Telegram, in-app)
 * Works even when user's tab is closed or wallet is disconnected
 */

const DIALECT_API_URL = 'https://alerts-api.dial.to/v2';
const DIALECT_API_KEY = process.env.DIALECT_API_KEY;
const DIALECT_APP_ID = process.env.NEXT_PUBLIC_DIALECT_APP_ID;

export type DialectChannel = 'PUSH' | 'EMAIL' | 'TELEGRAM' | 'IN_APP';

export interface DialectNotificationPayload {
  title: string;
  body: string;
  image?: string;
  actions?: Array<{
    type: 'link' | 'action';
    label: string;
    url?: string;
    action?: string;
  }>;
}

export interface DialectNotificationOptions {
  walletAddress: string;
  channels?: DialectChannel[];
  data?: Record<string, any>;
  priority?: 'high' | 'normal';
}

/**
 * Dialect Notification Service
 */
export class DialectService {
  /**
   * Send notification to user across all enabled channels
   */
  static async sendNotification(
    payload: DialectNotificationPayload,
    options: DialectNotificationOptions
  ): Promise<boolean> {
    if (!DIALECT_API_KEY || !DIALECT_APP_ID) {
      console.error('Dialect credentials not configured');
      return false;
    }

    try {
      const response = await fetch(`${DIALECT_API_URL}/${DIALECT_APP_ID}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dialect-api-key': DIALECT_API_KEY,
        },
        body: JSON.stringify({
          recipient: {
            type: 'subscriber',
            walletAddress: options.walletAddress,
          },
          channels: options.channels || ['PUSH', 'EMAIL', 'IN_APP'],
          message: {
            title: payload.title,
            body: payload.body,
            image: payload.image || 'https://v1ta.xyz/logo.png',
            actions: payload.actions,
          },
          data: options.data,
          // Priority queue for urgent notifications like liquidation warnings
          push: options.priority === 'high' ? { priority: 'high' } : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Dialect notification failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending Dialect notification:', error);
      return false;
    }
  }

  /**
   * Send position health warning notification
   */
  static async notifyPositionHealthWarning(
    walletAddress: string,
    collateralRatio: number,
    positionLink?: string
  ): Promise<boolean> {
    return this.sendNotification(
      {
        title: '⚠️ Position Health Warning',
        body: `Your collateral ratio (${collateralRatio.toFixed(
          2
        )}%) is approaching liquidation threshold. Add collateral or repay debt to avoid liquidation.`,
        actions: positionLink
          ? [
              {
                type: 'link',
                label: 'View Position',
                url: positionLink,
              },
            ]
          : undefined,
      },
      {
        walletAddress,
        channels: ['PUSH', 'EMAIL', 'TELEGRAM', 'IN_APP'],
        priority: 'high', // High priority for liquidation warnings
        data: {
          type: 'position_health_warning',
          collateralRatio,
        },
      }
    );
  }

  /**
   * Send liquidation notification
   */
  static async notifyLiquidation(
    walletAddress: string,
    collateralAmount: number,
    debtAmount: number,
    transactionLink?: string
  ): Promise<boolean> {
    return this.sendNotification(
      {
        title: '🚨 Position Liquidated',
        body: `Your position with ${collateralAmount.toFixed(
          4
        )} SOL collateral and ${debtAmount.toFixed(2)} vUSD debt has been liquidated.`,
        actions: transactionLink
          ? [
              {
                type: 'link',
                label: 'View Transaction',
                url: transactionLink,
              },
            ]
          : undefined,
      },
      {
        walletAddress,
        channels: ['PUSH', 'EMAIL', 'TELEGRAM', 'IN_APP'],
        priority: 'high',
        data: {
          type: 'liquidation',
          collateralAmount,
          debtAmount,
        },
      }
    );
  }

  /**
   * Send borrow success notification
   */
  static async notifyBorrowSuccess(
    walletAddress: string,
    amount: number,
    transactionLink?: string
  ): Promise<boolean> {
    return this.sendNotification(
      {
        title: '✅ Borrow Successful',
        body: `You successfully borrowed ${amount.toFixed(2)} vUSD`,
        actions: transactionLink
          ? [
              {
                type: 'link',
                label: 'View Transaction',
                url: transactionLink,
              },
            ]
          : undefined,
      },
      {
        walletAddress,
        channels: ['PUSH', 'IN_APP'],
        data: {
          type: 'borrow_success',
          amount,
        },
      }
    );
  }

  /**
   * Send repay success notification
   */
  static async notifyRepaySuccess(
    walletAddress: string,
    amount: number,
    transactionLink?: string
  ): Promise<boolean> {
    return this.sendNotification(
      {
        title: '✅ Repayment Successful',
        body: `You successfully repaid ${amount.toFixed(2)} vUSD`,
        actions: transactionLink
          ? [
              {
                type: 'link',
                label: 'View Transaction',
                url: transactionLink,
              },
            ]
          : undefined,
      },
      {
        walletAddress,
        channels: ['PUSH', 'IN_APP'],
        data: {
          type: 'repay_success',
          amount,
        },
      }
    );
  }

  /**
   * Send collateral added notification
   */
  static async notifyCollateralAdded(
    walletAddress: string,
    amount: number,
    transactionLink?: string
  ): Promise<boolean> {
    return this.sendNotification(
      {
        title: '✅ Collateral Added',
        body: `You added ${amount.toFixed(4)} SOL as collateral`,
        actions: transactionLink
          ? [
              {
                type: 'link',
                label: 'View Transaction',
                url: transactionLink,
              },
            ]
          : undefined,
      },
      {
        walletAddress,
        channels: ['PUSH', 'IN_APP'],
        data: {
          type: 'collateral_added',
          amount,
        },
      }
    );
  }

  /**
   * Send collateral removed notification
   */
  static async notifyCollateralRemoved(
    walletAddress: string,
    amount: number,
    transactionLink?: string
  ): Promise<boolean> {
    return this.sendNotification(
      {
        title: '✅ Collateral Withdrawn',
        body: `You withdrew ${amount.toFixed(4)} SOL from collateral`,
        actions: transactionLink
          ? [
              {
                type: 'link',
                label: 'View Transaction',
                url: transactionLink,
              },
            ]
          : undefined,
      },
      {
        walletAddress,
        channels: ['PUSH', 'IN_APP'],
        data: {
          type: 'collateral_removed',
          amount,
        },
      }
    );
  }

  /**
   * Send protocol update notification (broadcast to all users)
   */
  static async notifyProtocolUpdate(
    walletAddress: string,
    title: string,
    body: string,
    linkUrl?: string
  ): Promise<boolean> {
    return this.sendNotification(
      {
        title: `📢 ${title}`,
        body,
        actions: linkUrl
          ? [
              {
                type: 'link',
                label: 'Learn More',
                url: linkUrl,
              },
            ]
          : undefined,
      },
      {
        walletAddress,
        channels: ['EMAIL', 'IN_APP'],
        data: {
          type: 'protocol_update',
        },
      }
    );
  }
}
