const CACHE = 'boykot-rehberi-v3-20260705-real';
const ASSETS = ['./','./index.html','./style.css','./app.js','./data.json','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => { self.skipWaiting(); event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.url.includes('data.json') || req.url.includes('app.js') || req.url.includes('style.css')){
    event.respondWith(fetch(req).then(res=>{ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res; }).catch(()=>caches.match(req)));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
