const CACHE_NAME = "ayur-prakriti-portal-v1";

const APP_ASSETS = [
  "./",
  "./index5.html",
  "./style.css",
  "./app.js",
  "./logo.jpg",
  "./manifest.webmanifest"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_ASSETS);
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names
          .filter(function(name){
            return name !== CACHE_NAME;
          })
          .map(function(name){
            return caches.delete(name);
          })
      );
    })
  );
});

self.addEventListener("fetch", function(event){
  if(event.request.method !== "GET"){
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse){
      return cachedResponse || fetch(event.request);
    })
  );
});
