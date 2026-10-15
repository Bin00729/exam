const CACHE_NAME = 'examshield-static-v1';
const DYNAMIC_CACHE = 'examshield-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

// Service Worker Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Service Worker Activate - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to check if URL is a static asset
function isStaticAsset(url) {
  return (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.json'
  );
}

// Fetch handler:
// 1. Static Assets -> Cache-First with Network fallback & cache update
// 2. Data / API / Submissions -> Network-First with Offline JSON Fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip chrome-extension or non-http requests
  if (!url.protocol.startsWith('http')) return;

  // Handle submissions / API requests with Network-First
  if (url.pathname.startsWith('/api/') || request.method === 'POST') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(async () => {
          // Offline fallback response for queued submissions
          if (request.method === 'POST' && url.pathname.includes('submit')) {
            return new Response(
              JSON.stringify({
                status: 'queued_offline',
                message: 'Device is offline. Exam submission queued in local IndexedDB and will sync once connectivity returns.',
                timestamp: new Date().toISOString()
              }),
              {
                status: 202,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }

          // Fallback generic offline response
          return new Response(
            JSON.stringify({
              error: 'Network unavailable. Operating in Offline Safe mode.',
              offline: true
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Handle Static Assets (Cache-First)
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Background fetch to update cache (stale-while-revalidate style)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {
              /* ignore background fetch failures when offline */
            });
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            // If navigation request fails, return cached index.html
            if (request.mode === 'navigate') {
              return caches.match('/index.html') || caches.match('/');
            }
          });
      })
    );
    return;
  }

  // General Navigation / other requests: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
          const clone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline content unavailable', { status: 503 });
      })
  );
});

// Background Sync Event (Standard Service Worker Sync)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-exam-submissions') {
    event.waitUntil(notifyClientsToSync());
  }
});

// Broadcast to active clients to trigger sync from IndexedDB
async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({
      type: 'SYNC_OFFLINE_SUBMISSIONS',
      timestamp: Date.now()
    });
  }
}

// Client message listener
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
