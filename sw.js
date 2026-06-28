const CACHE_NAME = "ayur-prakriti-portal-v2";

const APP_ASSETS = [
  "./",
  "./index5.html",
  "./style.css",
  "./app.js",
  "./logo.jpg",
  "./manifest.webmanifest",
  "./offline.html"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_ASSETS);
    }).then(function(){
      return self.skipWaiting();
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
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event){
  if(event.request.method !== "GET"){
    return;
  }

  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin){
    return;
  }

  if(event.request.mode === "navigate"){
    event.respondWith(
      fetch(event.request).catch(function(){
        return caches.match("./offline.html");
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse){
      if(cachedResponse){
        return cachedResponse;
      }

      return fetch(event.request).then(function(networkResponse){
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, copy);
        });
        return networkResponse;
      }).catch(function(){
        return caches.match("./offline.html");
      });
    })
  );
});
