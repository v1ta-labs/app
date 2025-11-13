import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';

// Disable edge runtime and buffering for SSE
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Server-Sent Events endpoint for real-time notifications
 * Streams notifications to connected clients
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const walletAddress = searchParams.get('wallet');

  if (!walletAddress) {
    return new Response('Wallet address is required', { status: 400 });
  }

  // Create a new ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isClosed = false;

      // Send initial connection message
      const sendMessage = (data: any) => {
        if (isClosed) return;

        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          // Controller might be closed
          isClosed = true;
        }
      };

      sendMessage({ type: 'connected', timestamp: new Date().toISOString() });

      // Poll for new notifications every 3 seconds
      const pollInterval = setInterval(async () => {
        if (isClosed) {
          clearInterval(pollInterval);
          return;
        }

        try {
          // Get unread notifications
          const notifications = await db.notification.findMany({
            where: {
              walletAddress,
              read: false,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10, // Limit to prevent large payloads
          });

          // Get unread count
          const unreadCount = await db.notification.count({
            where: {
              walletAddress,
              read: false,
            },
          });

          // Send notification update
          sendMessage({
            type: 'notifications',
            data: {
              notifications,
              unreadCount,
            },
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          // Silently handle DB errors - return empty state
          sendMessage({
            type: 'notifications',
            data: {
              notifications: [],
              unreadCount: 0,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }, 3000); // Poll every 3 seconds

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        if (isClosed) {
          clearInterval(heartbeatInterval);
          return;
        }
        sendMessage({ type: 'heartbeat', timestamp: new Date().toISOString() });
      }, 30000);

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        isClosed = true;
        clearInterval(pollInterval);
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch (error) {
          // Already closed
        }
      });
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  });
}
