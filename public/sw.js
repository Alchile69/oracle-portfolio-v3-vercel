/**
 * Service Worker - Oracle Portfolio V3.0
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-08
 */

const CACHE_NAME = 'oracle-portfolio-v3-cache-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/site.webmanifest'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker: Erreur lors de la mise en cache:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la réponse du cache si disponible
        if (response) {
          return response;
        }
        
        // Sinon, faire la requête réseau
        return fetch(event.request)
          .then((response) => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloner la réponse pour la mettre en cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.warn('⚠️ Service Worker: Erreur réseau:', error);
            // Retourner une réponse par défaut en cas d'erreur
            return new Response('Contenu non disponible hors ligne', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

