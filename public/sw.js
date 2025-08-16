const CACHE_NAME = 'riverlife-v1'
const IMAGE_CACHE_NAME = 'riverlife-images-v1'

// List of images to cache (only existing files)
const IMAGES_TO_CACHE = [
  '/one.svg',
  '/two.svg',
  '/three.svg',
  '/four.svg',
  '/five.svg',
  '/six.svg',
  '/seven.svg',
  '/eight.svg',
  '/nine.svg',
  '/ten.svg',
  '/eleven.svg',
  '/twelve.svg',
  '/thirteen.svg',
  '/fourteen.svg',
  '/fifteen.svg',
  '/sixteen.svg',
  '/seventeen.svg',
  '/eighteenth.svg',
  '/nineteen.svg',
  '/twenty.svg',
  '/twentyone.svg',
  '/twentytwo.svg',
  '/twentythree.svg',
  '/twentyfour.svg',
  '/twentyfive.svg',
  '/twentysix.svg',
  '/twentyseven.svg',
  '/twentyeight.svg',
  '/twentynine.svg',
  '/thirty.svg',
  '/thirtyone.svg',
  '/thirtytwo.svg',
  '/thirtythree.svg',
  '/thirtyfour.svg',
  '/thirtyfive.svg',
  '/thirtysix.svg',
  '/thirtyseven.svg',
  // '/thirtyeight.svg', // ❌ Missing file
  // '/thirtynine.svg',  // ❌ Missing file
  // '/forty.svg',       // ❌ Missing file
  '/fourtyone.svg',
  '/fourtytwo.svg',
  '/fourtyfour.svg',
  '/fourtyfive.svg',
  '/fourtysix.svg',
  '/track.mp3'
]

// Install event - cache images
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(IMAGE_CACHE_NAME).then((cache) => {
      return cache.addAll(IMAGES_TO_CACHE)
    })
  )
})

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image' || 
      event.request.url.includes('.svg') ||
      event.request.url.includes('.mp3')) {
    
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            // Return cached version
            return response
          }
          
          // Fetch from network and cache
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
        })
      })
    )
  }
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
