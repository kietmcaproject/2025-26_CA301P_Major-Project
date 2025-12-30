import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for caching and optimization
const requestCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds (reduced from 2 minutes for fresher data)

// Clean up expired cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (value.expiresAt < now) {
      requestCache.delete(key);
    }
  }
}, 60 * 1000); // Clean every 1 minute

// Helper to generate cache key excluding timestamp and noCache params
const generateCacheKey = (url, params) => {
  if (!params || params.noCache) return null; // Don't cache if noCache flag is set

  // Exclude timestamp params and noCache from cache key
  const filteredParams = { ...params };
  delete filteredParams._t;
  delete filteredParams._ts;
  delete filteredParams.timestamp;
  delete filteredParams.noCache;

  // Sort keys for consistent cache key generation
  const sortedKeys = Object.keys(filteredParams).sort();
  const sortedParams = {};
  sortedKeys.forEach(key => {
    sortedParams[key] = filteredParams[key];
  });

  return `${url}?${JSON.stringify(sortedParams)}`;
};

api.interceptors.request.use(
  (config) => {
    // Only cache GET requests and if noCache is not set
    if (config.method === 'get' && !config.params?.noCache) {
      const cacheKey = generateCacheKey(config.url, config.params);

      if (cacheKey) {
        const cached = requestCache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
          // Return cached response
          return Promise.reject({
            __cached: true,
            data: cached.data,
            config
          });
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for caching and error handling
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses (exclude timestamp params from cache key)
    const config = response.config;
    if (config.method === 'get' && !config.params?.noCache) {
      const cacheKey = generateCacheKey(config.url, config.params);

      if (cacheKey) {
        requestCache.set(cacheKey, {
          data: response.data,
          expiresAt: Date.now() + CACHE_TTL
        });
      }
    }

    // Clear related cache on mutations (POST, PUT, DELETE, PATCH)
    // This ensures fresh data after creating/updating/deleting resources
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      const urlPath = config.url?.split('?')[0]; // Get path without query params

      // Clear cache for related endpoints
      if (urlPath?.includes('/complaints')) {
        clearApiCache('/api/complaints');
        clearApiCache('/api/dashboard');
        clearApiCache('/api/super-admin');
      } else if (urlPath?.includes('/profile')) {
        clearApiCache('/api/profile');
        clearApiCache('/api/dashboard');
      } else if (urlPath?.includes('/super-admin')) {
        clearApiCache('/api/super-admin');
        clearApiCache('/api/dashboard');
        clearApiCache('/api/complaints');
      } else if (urlPath?.includes('/admin')) {
        clearApiCache('/api/admin');
        clearApiCache('/api/dashboard');
      }
    }

    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: { 'X-Cache': 'HIT' },
        config: error.config
      });
    }

    // Retry logic for network errors
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      const config = error.config;
      if (!config.__retryCount) {
        config.__retryCount = 0;
      }

      if (config.__retryCount < 2) {
        config.__retryCount++;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(api(config));
          }, 1000 * config.__retryCount); // Exponential backoff
        });
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to clear cache
export const clearApiCache = (pattern) => {
  if (pattern) {
    for (const key of requestCache.keys()) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
      }
    }
  } else {
    requestCache.clear();
  }
};

export default api


