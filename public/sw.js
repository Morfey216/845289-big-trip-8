const CACHE_NAME = `STATIC_V1.0`;

self.addEventListener(`install`, (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME)
    .then((cache) => {
      return cache.addAll([
        `./`,
        `./index.html`,
        `./css/normalize.css`,
        `./css/main.css`,
        `./img/star.svg`,
        `./img/star--check.svg`,
        `./bundle.js`,
      ]);
    })
    .catch((err) => {
      throw err;
    })
  );
});

const refreshCache = (request) => {
  return fetch(request)
    .then((response) => {
      caches.open(CACHE_NAME)
        .then((cache) => cache.put(request, response.clone()));
      return response.clone();
    });
};

self.addEventListener(`fetch`, (evt) => {
  evt.respondWith(caches.match(evt.request)
    .then((response) => {
      return response ? response : refreshCache(evt.request);
    })
    .catch((err) => {
      throw err;
    })
  );
});
