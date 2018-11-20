'use strict';


var shellFilesToCache = [
	'/index.html',
	'/skeleton.min.css',
	'/logo.png',
	'/pdfs/qcad1.pdf',
	'/pdfs/qcad3.pdf',
	'/pdfs/wood.pdf',
	'https://developer.api.autodesk.com/viewingservice/v1/viewers/extensions/Measure/Measure.min.js',
	'https://developer.api.autodesk.com/viewingservice/v1/viewers/extensions/Hyperlink/Hyperlink.min.js',
	'https://developer.api.autodesk.com/viewingservice/v1/viewers/extensions/PDF/PDF.min.js',
	'https://developer.api.autodesk.com/viewingservice/v1/viewers/extensions/PDF/PDF.worker.min.js',
	'https://developer.api.autodesk.com/viewingservice/v1/viewers/extensions/CompGeom/CompGeom.min.js',
	'https://developer.api.autodesk.com/viewingservice/v1/viewers/extensions/Markup/Markup.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/style.min.css',
    'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/viewer3D.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/lmvworker.min.js',
	'https://developer.api.autodesk.com/modelderivative/v2/viewers/6.*/res/locales/en/allstrings.json',
	'https://fonts.autodesk.com/ArtifaktElement/WOFF2/Artifakt%20Element%20Regular.woff2',
];

const staticShellPrefix = 'offlineSW-';
const staticShellCacheId = staticShellPrefix + '01';


self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(staticShellCacheId).then(function (cache) {
			return cache.addAll( shellFilesToCache );
		}).catch(function (error) {
			console.error(error);
		})
	);
});



self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(function (cacheNames) {
			return Promise.all(
				cacheNames.map(function (cacheName) {
					if (cacheName !== staticShellCacheId && cacheName.startsWith( staticShellPrefix )) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});


self.addEventListener('fetch', function (event) {
	const requestedUrl = event.request.url;
	event.respondWith(
		caches.match(event.request).then(function (response) {
			if (response)
				return response;

			return fetch(event.request).then(function (response) {
				return response;
			}).catch(function (error) {
				console.error('SERVICEWORKER fetch error: ' + error);
				return new Response();
			});
		})
	);
});