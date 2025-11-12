import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications/test-browser
 * Test endpoint that returns HTML page to trigger browser notification directly
 * This tests the service worker and browser notification without needing Dialect subscription
 */
export async function GET(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Browser Notification Test</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background: #0a0a0a;
      color: #fff;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      margin: 10px 5px;
    }
    button:hover {
      background: #2563eb;
    }
    button:disabled {
      background: #6b7280;
      cursor: not-allowed;
    }
    .status {
      padding: 15px;
      margin: 15px 0;
      border-radius: 8px;
      background: #1f2937;
    }
    .success { background: #065f46; }
    .error { background: #7f1d1d; }
    h1 { color: #3b82f6; }
  </style>
</head>
<body>
  <h1>🔔 Browser Notification Test</h1>
  <p>This page tests browser notifications and service worker registration.</p>

  <div id="status" class="status">Status: Checking...</div>

  <button id="requestPermission">Request Permission</button>
  <button id="showNotification" disabled>Show Test Notification</button>
  <button id="showSWNotification" disabled>Show SW Notification</button>

  <h3>Service Worker Status:</h3>
  <div id="swStatus" class="status">Checking service worker...</div>

  <script>
    const statusDiv = document.getElementById('status');
    const swStatusDiv = document.getElementById('swStatus');
    const requestBtn = document.getElementById('requestPermission');
    const showBtn = document.getElementById('showNotification');
    const showSWBtn = document.getElementById('showSWNotification');

    // Check current permission
    function updateStatus() {
      const permission = 'Notification' in window ? Notification.permission : 'not supported';
      statusDiv.textContent = \`Notification Permission: \${permission}\`;
      statusDiv.className = 'status ' + (permission === 'granted' ? 'success' : permission === 'denied' ? 'error' : '');

      showBtn.disabled = permission !== 'granted';
      showSWBtn.disabled = permission !== 'granted';
    }

    // Check service worker
    async function checkServiceWorker() {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          swStatusDiv.textContent = \`✅ Service Worker: Active (\${registration.active?.state})\`;
          swStatusDiv.className = 'status success';
        } catch (error) {
          swStatusDiv.textContent = \`❌ Service Worker: Error - \${error.message}\`;
          swStatusDiv.className = 'status error';
        }
      } else {
        swStatusDiv.textContent = '❌ Service Worker: Not supported in this browser';
        swStatusDiv.className = 'status error';
      }
    }

    // Request permission
    requestBtn.addEventListener('click', async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        updateStatus();

        if (permission === 'granted') {
          statusDiv.textContent = '✅ Permission granted! You can now test notifications.';
          statusDiv.className = 'status success';
        } else if (permission === 'denied') {
          statusDiv.textContent = '❌ Permission denied. Please enable notifications in browser settings.';
          statusDiv.className = 'status error';
        }
      } else {
        statusDiv.textContent = '❌ Notifications not supported in this browser';
        statusDiv.className = 'status error';
      }
    });

    // Show direct browser notification
    showBtn.addEventListener('click', () => {
      const notification = new Notification('🎉 V1ta Test Notification', {
        body: 'This is a direct browser notification test!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        data: { url: '/positions' },
        vibrate: [200, 100, 200],
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      statusDiv.textContent = '✅ Browser notification sent!';
      statusDiv.className = 'status success';
    });

    // Show service worker notification
    showSWBtn.addEventListener('click', async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;

          await registration.showNotification('🚀 V1ta SW Test', {
            body: 'This notification was triggered via Service Worker!',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'sw-test-notification',
            data: { url: '/positions' },
            vibrate: [200, 100, 200],
            actions: [
              { action: 'view', title: 'View' },
              { action: 'close', title: 'Dismiss' }
            ],
          });

          statusDiv.textContent = '✅ Service Worker notification sent!';
          statusDiv.className = 'status success';
        } catch (error) {
          statusDiv.textContent = \`❌ Error: \${error.message}\`;
          statusDiv.className = 'status error';
        }
      }
    });

    // Initialize
    updateStatus();
    checkServiceWorker();
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
