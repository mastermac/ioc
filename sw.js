const version='v1';

self.addEventListener('install',function(event){
	event.waitUntil(
		caches.open(version)
		.then(function (cache){
			return cache.addAll([
				'index.html',
				'offline.html',
				'main.js'
				]);
		}));
	self.skipWaiting();
});

self.addEventListener('activate',function(event){
	event.waitUntil(
		caches.keys()
		.then(function (keys){
			return Promise.all(keys.filter(function (key){
				return key!=version;
			}).map(function (key){
				return caches.delete(key);
			}));
		}));
	console.log('SW Activated at', new Date().toLocaleTimeString());
});

self.addEventListener('fetch',function(event){
	event.respondWith(
		caches.match(event.request)
		.then(function (res){
			if(res)
				return res;

			if(!navigator.onLine)
				return caches.match(new Request('offline.html'));

			return fetchAndUpdate(event.request);
		}));
});

function fetchAndUpdate(request){
	return fetch(request)
	.then(function (res){
		if(res){
			return caches.open(version)
			.then(function (cache){
				return cache.put(request,res.clone())
				.then(function(){
					return res;
				});
			});
		}
	});
}