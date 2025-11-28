// Eagle B2B Service Worker - Auth & Offline Support
const CACHE_NAME = 'eagle-auth-v1';
const API_URL = 'https://api.eagledtfsupply.com';

// Install
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Fetch - Add auth token to all API requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only intercept API requests
  if (url.origin === API_URL) {
    event.respondWith(
      (async () => {
        try {
          // Get token from IndexedDB
          const db = await openDB();
          const token = await getFromDB(db, 'eagle_token');
          
          // Clone request and add auth header
          const headers = new Headers(event.request.headers);
          if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          
          const authRequest = new Request(event.request, { headers });
          
          // Fetch with auth
          const response = await fetch(authRequest);
          
          // If 401, try to refresh token
          if (response.status === 401) {
            const newToken = await refreshToken(token);
            if (newToken) {
              // Retry with new token
              headers.set('Authorization', `Bearer ${newToken}`);
              const retryRequest = new Request(event.request, { headers });
              return await fetch(retryRequest);
            }
          }
          
          return response;
        } catch (error) {
          console.error('Service Worker fetch error:', error);
          return fetch(event.request);
        }
      })()
    );
  }
});

// IndexedDB helpers
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('eagle_auth_db', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('auth_store')) {
        db.createObjectStore('auth_store', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getFromDB(db, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['auth_store'], 'readonly');
    const store = transaction.objectStore('auth_store');
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result ? request.result.value : null);
    request.onerror = () => reject(request.error);
  });
}

async function refreshToken(oldToken) {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: oldToken }),
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.token) {
        // Store new token
        const db = await openDB();
        await setInDB(db, 'eagle_token', data.token);
        return data.token;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

async function setInDB(db, key, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['auth_store'], 'readwrite');
    const store = transaction.objectStore('auth_store');
    const request = store.put({ key, value, timestamp: Date.now() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

