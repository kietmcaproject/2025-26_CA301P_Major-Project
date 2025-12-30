const { isRedisEnabled, getRedisClient } = require('../config/redis');

// Fallback in-memory cache if Redis is not available
const memoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default

// Clean up expired memory cache entries every 10 minutes
setInterval(() => {
  if (!isRedisEnabled()) {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
      if (value.expiresAt < now) {
        memoryCache.delete(key);
      }
    }
  }
}, 10 * 60 * 1000);

/**
 * Get cached value from Redis or memory
 */
const getCache = async (key) => {
  if (isRedisEnabled()) {
    try {
      const redis = getRedisClient();
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('Redis get error:', error.message);
      // Fallback to memory cache
      return memoryCache.get(key)?.data || null;
    }
  } else {
    // Use memory cache
    const cached = memoryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    return null;
  }
};

/**
 * Set cached value in Redis or memory
 */
const setCache = async (key, data, ttl) => {
  const ttlSeconds = Math.floor(ttl / 1000); // Convert milliseconds to seconds

  if (isRedisEnabled()) {
    try {
      const redis = getRedisClient();
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      console.error('Redis set error:', error.message);
      // Fallback to memory cache
      memoryCache.set(key, {
        data,
        expiresAt: Date.now() + ttl
      });
    }
  } else {
    // Use memory cache
    memoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttl
    });
  }
};

/**
 * Delete cached value from Redis or memory
 */
const deleteCache = async (key) => {
  if (isRedisEnabled()) {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error.message);
      // Fallback to memory cache
      memoryCache.delete(key);
    }
  } else {
    memoryCache.delete(key);
  }
};

/**
 * Clear cache by pattern (supports Redis pattern matching)
 */
const clearCacheByPattern = async (pattern) => {
  if (isRedisEnabled()) {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis clear pattern error:', error.message);
      // Fallback to memory cache
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern)) {
          memoryCache.delete(key);
        }
      }
    }
  } else {
    // Memory cache pattern matching
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }
  }
};

/**
 * Clear all cache
 */
const clearAllCache = async () => {
  if (isRedisEnabled()) {
    try {
      const redis = getRedisClient();
      await redis.flushdb();
    } catch (error) {
      console.error('Redis flush error:', error.message);
      memoryCache.clear();
    }
  } else {
    memoryCache.clear();
  }
};

/**
 * Cache middleware for Express
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 * @param {function} keyGenerator - Optional function to generate cache key from request
 */
const cacheMiddleware = (ttl = CACHE_TTL, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : `cache:${req.originalUrl || req.url}:${JSON.stringify(req.query)}`;

    try {
      // Check cache
      const cached = await getCache(cacheKey);
      if (cached) {
        // Set cache headers
        res.set('X-Cache', isRedisEnabled() ? 'HIT-REDIS' : 'HIT-MEMORY');
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = async function(data) {
        // Cache the response
        await setCache(cacheKey, data, ttl);

        // Set cache headers
        res.set('X-Cache', isRedisEnabled() ? 'MISS-REDIS' : 'MISS-MEMORY');
        return originalJson(data);
      };

      next();
    } catch (error) {
      // If cache fails, continue without caching
      console.error('Cache middleware error:', error.message);
      next();
    }
  };
};

module.exports = {
  cacheMiddleware,
  getCache,
  setCache,
  deleteCache,
  clearCacheByPattern,
  clearAllCache,
  isRedisEnabled
};
