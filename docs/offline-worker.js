const CACHE_NAME = 'forge-disconnected-v4';

var STATIC_URLS = [
	'/',
	'/index.html',
	'/skeleton.min.css',
	'/logo.png',

    'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/viewer3D.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/lmvworker.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/extensions/PDF/PDF.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/extensions/PDF/PDF.worker.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/extensions/Markup/Markup.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/extensions/Measure/Measure.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/extensions/Hyperlink/Hyperlink.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/extensions/CompGeom/CompGeom.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/res/locales/en/allstrings.json',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/style.min.css',
	'https://fonts.autodesk.com/ArtifaktElement/WOFF2/Artifakt%20Element%20Regular.woff2',

	'/pdfs/qcad1.pdf',
	'/pdfs/qcad3.pdf',
	'/pdfs/wood.pdf',
];

self.addEventListener('install',  e => { e.waitUntil(installAsync())  });
self.addEventListener('activate', e => { e.waitUntil(activateAsync()) });
self.addEventListener('fetch',    e => { e.respondWith(fetchAsync(e)) });
self.addEventListener('error',    e => { console.error('Error event', e ) });

async function installAsync() {
    self.skipWaiting(); // Replace old service workers without waiting for them to wrap up
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(STATIC_URLS);
}

async function activateAsync() {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    await self.clients.claim();
}

async function fetchAsync(event) {
    const match = await caches.match(event.request.url, { ignoreSearch: true });
    if (!match) return fetch(event.request);
    if (STATIC_URLS.includes(event.request.url)) {
        caches.open(CACHE_NAME)
            .then((cache) => cache.add(event.request))
            .catch((err) => console.log('Cache not updated, but that\'s ok...', err));
    }
    return match;
}