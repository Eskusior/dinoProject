const cacheName = 'dinoProject-pwa-conf';
const staticAssets = [
    '../',
    '../index.html',
    './scripts.js',
    './game.js',
    '../css/styles.css'
]


self.addEventListener('install', async event => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
})