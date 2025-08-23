const CACHE_NAME = 'syslvlup-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/alarm.html',
  '/daily_quest.html',
  '/status.html',
  '/Initiation.html',
  '/Quest_Info_Mental.html',
  '/Quest_Info_Physical.html',
  '/Quest_Info_Spiritual.html',
  '/css/login.css',
  '/css/alarm.css',
  '/css/daily_quest.css',
  '/css/status.css',
  '/css/Initiation.css',
  '/css/Quest_Info_Mental.css',
  '/css/Quest_Info_Physical.css',
  '/css/Quest_Info_Spiritual.css',
  '/js/login.js',
  '/js/alarm.js',
  '/js/daily_quest.js',
  '/js/status.js',
  '/js/Initiation.js',
  '/js/Quest_Info_Mental.js',
  '/js/Quest_Info_Physical.js',
  '/js/Quest_Info_Spiritual.js',
  '/js/database.js',
  '/js/sync.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Add self.clients.claim() to activate immediately
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});