/**
 * Position Health Monitoring Service
 * Monitors all active positions for health issues and sends alerts
 * Runs as a background service to warn users before liquidation
 */

import { db } from '@/lib/db/client';
import { NotificationService } from '@/lib/notifications/notification-service';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

// Health thresholds
const CRITICAL_HEALTH_THRESHOLD = 110; // 110% - very close to liquidation (105%)
const WARNING_HEALTH_THRESHOLD = 130; // 130% - early warning
const LIQUIDATION_THRESHOLD = 105; // 105% - liquidation point

interface PositionHealth {
  pubkey: string;
  owner: string;
  collateralRatio: number;
  health: 'healthy' | 'warning' | 'critical';
  shouldNotify: boolean;
}

/**
 * Position Health Monitor
 * Continuously monitors positions and sends alerts
 */
export class PositionHealthMonitor {
  private connection: Connection;
  private isRunning = false;
  private checkInterval = 60000; // Check every 60 seconds

  constructor(rpcUrl?: string) {
    this.connection = new Connection(
      rpcUrl || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    );
  }

  /**
   * Start monitoring positions
   */
  async start() {
    if (this.isRunning) {
      console.warn('Position health monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting position health monitor...');

    // Initial check
    await this.checkAllPositions();

    // Set up interval for continuous monitoring
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }

      try {
        await this.checkAllPositions();
      } catch (error) {
        console.error('Error in position health check:', error);
      }
    }, this.checkInterval);
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isRunning = false;
    console.log('Stopped position health monitor');
  }

  /**
   * Check all active positions for health issues
   */
  private async checkAllPositions() {
    try {
      // Get all active positions from database
      const positions = await db.position.findMany({
        where: {
          status: 0, // Active positions
          closedAt: null,
        },
      });

      if (positions.length === 0) {
        return;
      }

      console.log(`Checking health of ${positions.length} positions...`);

      // Get current SOL price (you may want to use your price feed service)
      const solPrice = await this.getSOLPrice();

      // Check each position
      for (const position of positions) {
        try {
          const health = await this.checkPositionHealth(position, solPrice);

          if (health.shouldNotify) {
            await this.sendHealthAlert(health);
          }
        } catch (error) {
          console.error(`Error checking position ${position.pubkey}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking all positions:', error);
    }
  }

  /**
   * Check health of a single position
   */
  private async checkPositionHealth(position: any, solPrice: number): Promise<PositionHealth> {
    // Calculate collateral value in USD
    const collateralValue = position.collateralAmount * solPrice;

    // Calculate collateral ratio
    const collateralRatio = position.debt > 0 ? (collateralValue / position.debt) * 100 : Infinity;

    // Determine health status
    let health: 'healthy' | 'warning' | 'critical' = 'healthy';
    let shouldNotify = false;

    if (collateralRatio <= CRITICAL_HEALTH_THRESHOLD) {
      health = 'critical';
      shouldNotify = true;
    } else if (collateralRatio <= WARNING_HEALTH_THRESHOLD) {
      health = 'warning';
      shouldNotify = await this.shouldSendWarning(position.owner, position.pubkey);
    }

    return {
      pubkey: position.pubkey,
      owner: position.owner,
      collateralRatio,
      health,
      shouldNotify,
    };
  }

  /**
   * Send health alert notification
   */
  private async sendHealthAlert(health: PositionHealth) {
    try {
      const message =
        health.health === 'critical'
          ? `🚨 URGENT: Your position is at ${health.collateralRatio.toFixed(
              1
            )}% collateral ratio. Add collateral immediately to avoid liquidation at ${LIQUIDATION_THRESHOLD}%.`
          : `⚠️ Warning: Your position is at ${health.collateralRatio.toFixed(
              1
            )}% collateral ratio. Consider adding collateral to stay safe.`;

      // Send notification via NotificationService (which sends to both local DB and Dialect)
      await NotificationService.notifyPositionHealthWarning(
        health.owner,
        health.collateralRatio,
        health.pubkey
      );

      // Log the alert
      console.log(`Sent ${health.health} health alert to ${health.owner}`);

      // Update last notified timestamp
      await this.updateLastNotified(health.owner, health.pubkey);
    } catch (error) {
      console.error('Error sending health alert:', error);
    }
  }

  /**
   * Check if we should send a warning (avoid spam)
   * Only send if we haven't sent one in the last 4 hours
   */
  private async shouldSendWarning(walletAddress: string, positionPubkey: string): Promise<boolean> {
    try {
      // Check last notification time from database
      const lastNotification = await db.notification.findFirst({
        where: {
          walletAddress,
          type: 'POSITION_HEALTH_WARNING',
          createdAt: {
            gte: new Date(Date.now() - 4 * 60 * 60 * 1000), // Last 4 hours
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return !lastNotification;
    } catch (error) {
      // If error, allow notification to be safe
      return true;
    }
  }

  /**
   * Update last notified timestamp
   */
  private async updateLastNotified(walletAddress: string, positionPubkey: string) {
    // Store in metadata for future reference
    // This could be enhanced with a separate tracking table
  }

  /**
   * Get current SOL price
   * TODO: Replace with your actual price feed service
   */
  private async getSOLPrice(): Promise<number> {
    try {
      // You might want to use Pyth, Chainlink, or your own price feed
      // For now, fetch from a simple API
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );
      const data = await response.json();
      return data.solana?.usd || 150; // Fallback to $150 if API fails
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      return 150; // Fallback price
    }
  }

  /**
   * Get position health summary
   */
  async getHealthSummary(): Promise<{
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  }> {
    const positions = await db.position.findMany({
      where: {
        status: 0,
        closedAt: null,
      },
    });

    const solPrice = await this.getSOLPrice();

    let healthy = 0;
    let warning = 0;
    let critical = 0;

    for (const position of positions) {
      const health = await this.checkPositionHealth(position, solPrice);
      if (health.health === 'critical') critical++;
      else if (health.health === 'warning') warning++;
      else healthy++;
    }

    return {
      total: positions.length,
      healthy,
      warning,
      critical,
    };
  }
}

// Export singleton instance
let monitorInstance: PositionHealthMonitor | null = null;

export function getMonitorInstance(): PositionHealthMonitor {
  if (!monitorInstance) {
    monitorInstance = new PositionHealthMonitor();
  }
  return monitorInstance;
}
