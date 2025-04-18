self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
    event.waitUntil(
        caches.open('notification-assets').then(function(cache) {
            return cache.addAll([
                '/notification-sound.mp3',
                '/vendor/adminlte/dist/img/ICON_APP.png'
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheName !== 'notification-assets') {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.toast.message,
            icon: '/vendor/adminlte/dist/img/ICON_APP.png',
            badge: '/vendor/adminlte/dist/img/ICON_APP.png',
            vibrate: [200, 100, 200],
            tag: 'notification-' + Date.now(),
            data: {
                url: data.url || '/',
                timestamp: data.timestamp || Date.now()
            },
            actions: [
                {
                    action: 'view',
                    title: 'View Details'
                },
                {
                    action: 'close',
                    title: 'Dismiss'
                }
            ],
            requireInteraction: true
        };

        // Play notification sound if available
        playNotificationSound();

        event.waitUntil(
            self.registration.showNotification(data.toast.title, options)
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Handle notification action clicks
    if (event.action === 'view') {
        // Open the notification URL
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    } else if (event.action === 'close') {
        // Just close the notification, no further action
        return;
    } else {
        // Default action when clicking the notification body
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

self.addEventListener('notificationclose', (event) => {
    // Handle notification close event if needed
    console.log('Notification closed:', event.notification.data);
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline');
                        }
                        return new Response('', {
                            status: 408,
                            statusText: 'Request timed out.'
                        });
                    });
            })
    );
});

async function playNotificationSound() {
    try {
        const cache = await caches.open('notification-assets');
        const response = await cache.match('/notification-sound.mp3');
        if (response) {
            const audio = new Audio('/notification-sound.mp3');
            await audio.play();
        }
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}

// Cache static assets for offline use
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('pwa-cache-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/css/app.css',
                '/css/toast.css',
                '/js/app.js',
                '/js/toast.js',
                '/vendor/adminlte/dist/img/ICON_APP.png',
                '/offline'
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== 'pwa-cache-v1' && cache !== 'notification-assets') {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
