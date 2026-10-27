/* Mamaput service worker: offline play after the first visit. */
const V = 'mamaput-v51-vercel';
const DAT = null;          // gzip game bundle (static copies) or null
const PRE = [];          // art + audio on the asset sites
const SHELL = ['/', '/manifest.json', '/favicon.ico', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png'].concat(DAT ? [DAT] : []);
const ASSET_HOST = /^mamaput[a-z0-9-]*\.sites\.tab\.bot$/;
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await Promise.allSettled(SHELL.map((u) => c.add(u)));
    await Promise.allSettled(PRE.map(async (u) => { const r = await fetch(new Request(u, { mode: 'no-cors' })); if (r.ok || r.type === 'opaque') await c.put(u, r); }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== V) await caches.delete(k); await self.clients.claim(); })());
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin && u.pathname.startsWith('/api/')) return; // accounts always go to the network
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put('/', cp)); return res; }).catch(async () => (await caches.match('/')) || Response.error()));
    return;
  }
  if (!(u.origin === location.origin || ASSET_HOST.test(u.hostname))) return;
  if (r.headers.has('range')) { // media range requests: serve the whole cached file if we have it
    e.respondWith(caches.match(r.url, { ignoreVary: true }).then((hit) => hit || fetch(r)));
    return;
  }
  e.respondWith((async () => { // stale-while-revalidate
    const c = await caches.open(V);
    const hit = await c.match(r, { ignoreVary: true }) || await c.match(r.url, { ignoreVary: true });
    const net = fetch(r).then((res) => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => hit || Response.error());
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  })());
});
