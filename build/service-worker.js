const CACHE_NAME = "nisqamanta-cache-v1";
const URLS_TO_CACHE = [
  "/", 
  "/index.html",
  "/manifest.json"
];

//Guardar en caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

//fetch con llamadas
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
