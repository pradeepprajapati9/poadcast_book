/* StoryVerse service worker — offline shell + runtime caching */
const VERSION = 'storyverse-v1';
const OFFLINE_URLS = ['/', '/offline.html'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(VERSION).then((cache) => cache.addAll(OFFLINE_URLS)).catch(() => {}),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
        ),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Cache-first for built assets & icons (hashed = safe)
    if (url.pathname.startsWith('/build/') || url.pathname.startsWith('/icons/')) {
        event.respondWith(
            caches.match(request).then((cached) =>
                cached ||
                fetch(request).then((res) => {
                    const copy = res.clone();
                    caches.open(VERSION).then((c) => c.put(request, copy));
                    return res;
                }),
            ),
        );
        return;
    }

    // Network-first for pages; fall back to cache/offline
    event.respondWith(
        fetch(request)
            .then((res) => {
                const copy = res.clone();
                caches.open(VERSION).then((c) => c.put(request, copy));
                return res;
            })
            .catch(() => caches.match(request).then((c) => c || caches.match('/offline.html'))),
    );
});
