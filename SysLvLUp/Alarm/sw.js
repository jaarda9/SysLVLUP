const CACHE_NAME = 'syslvlup-v2';
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
  '/js/sync.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Cache installation failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip API requests and other non-GET requests
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, you could show a custom offline page
        console.log('Fetch failed for:', event.request.url);
      })
  );
});

// Handle background sync (if supported)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered');
}