/**
 * HealthOS Service Worker
 * Strategy:
 *  - Static assets  → Cache First (fast, offline-safe)
 *  - API/data calls → Network First with cache fallback
 *  - Navigation     → Network First with offline.html fallback
 */

const CACHE_VERSION = 'healthos-v1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Core assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('healthos-') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Skip Next.js internal routes and Supabase API calls
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('supabase')
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // HTML navigation pages → Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images) → Cache First
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|svg|ico|webp|gif)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else → Network First
  event.respondWith(networkFirst(request));
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// ─── Push Notifications ──────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title   = data.title   ?? 'HealthOS';
  const options = {
    body:    data.body    ?? 'إشعار جديد من HealthOS',
    icon:    '/icons/icon-192x192.png',
    badge:   '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data:    { url: data.url ?? '/' },
    actions: [
      { action: 'open',    title: 'فتح' },
      { action: 'dismiss', title: 'تجاهل' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(clients.openWindow(url));
});

// ─── Background Sync ─────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-patient-data') {
    event.waitUntil(syncPatientData());
  }
});

async function syncPatientData() {
  // When back online, trigger the app's sync service
  const allClients = await clients.matchAll({ includeUncontrolled: true });
  allClients.forEach((client) => client.postMessage({ type: 'BACKGROUND_SYNC' }));
}
