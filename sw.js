// Offline support. Own files are network-first (edits show up right away), fonts cache-first.
// Bump VERSION to make every phone drop its old cache. Registered as sw.js?debug to log [supp-sw] lines.
const VERSION = 'v2';
const APP = `supp-app-${VERSION}`, FONTS = `supp-fonts-${VERSION}`;
// Relative to this file, so it works under /supplements/ on GitHub Pages.
const FILES = ['./', './index.html', './style.css', './app.js', './routine.js', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];
const DEBUG = new URL(location).searchParams.has('debug');
const log = (...a) => DEBUG && console.log('[supp-sw]', ...a);

addEventListener('install', (e) => e.waitUntil((async () => {
  await (await caches.open(APP)).addAll(FILES);
  log('installed', VERSION);
  await skipWaiting();
})()));

addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== APP && k !== FONTS) { log('dropping cache', k); await caches.delete(k); }
  await clients.claim();
})()));

addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) e.respondWith(cacheFirst(req));
  else if (url.origin === location.origin) e.respondWith(networkFirst(req));
});

async function cacheFirst(req) {
  const cache = await caches.open(FONTS);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) { const copy = res.clone(); caches.open(APP).then((c) => c.put(req, copy)); }
    return res;
  } catch (err) {
    log('offline, serving cache for', req.url, err.message);
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') return (await caches.match('./index.html')) ?? Response.error();
    return Response.error();
  }
}
