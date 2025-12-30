const Redis = require('ioredis');

let redisClient = null;
let redisEnabled = false;

/**
 * Initialize Redis connection
 */
const connectRedis = () => {
  try {
    // Check if Redis is enabled in environment
    if (process.env.REDIS_ENABLED === 'true' || process.env.REDIS_URL) {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryStrategy: (times) => {
          // Retry with exponential backoff
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: true, // Allow queuing commands when offline
        connectTimeout: 10000,
        lazyConnect: true, // Connect only when needed
      };

      // If REDIS_URL is provided, use it (for cloud Redis services)
      if (process.env.REDIS_URL) {
        redisClient = new Redis(process.env.REDIS_URL, {
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          enableOfflineQueue: true, // Allow queuing commands when offline
          connectTimeout: 10000,
          lazyConnect: true, // Connect only when needed
        });
      } else {
        redisClient = new Redis(redisConfig);
      }

      // Handle Redis connection events
      redisClient.on('connect', () => {
        console.log('✅ Redis Connected');
        redisEnabled = true;
      });

      redisClient.on('ready', () => {
        console.log('✅ Redis Ready');
        redisEnabled = true;
      });

      redisClient.on('error', (err) => {
        console.error('❌ Redis Connection Error:', err.message);
        redisEnabled = false;
        // Don't exit process, allow app to continue without Redis
      });

      redisClient.on('close', () => {
        console.log('⚠️ Redis Connection Closed');
        redisEnabled = false;
      });

      redisClient.on('reconnecting', () => {
        console.log('🔄 Redis Reconnecting...');
      });

      // Test connection (with lazy connect, we need to connect first)
      redisClient.connect()
        .then(() => {
          return redisClient.ping();
        })
        .then(() => {
          console.log('✅ Redis connection test successful');
          redisEnabled = true;
        })
        .catch((err) => {
          console.error('❌ Redis connection test failed:', err.message);
          console.log('⚠️ Continuing without Redis cache (using in-memory fallback)');
          redisEnabled = false;
        });

      return redisClient;
    } else {
      console.log('ℹ️ Redis is disabled. Set REDIS_ENABLED=true or REDIS_URL to enable.');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);
    console.log('⚠️ Continuing without Redis cache (using in-memory fallback)');
    redisEnabled = false;
    return null;
  }
};

/**
 * Get Redis client instance
 */
const getRedisClient = () => {
  return redisClient;
};

/**
 * Check if Redis is enabled and connected
 */
const isRedisEnabled = () => {
  return redisEnabled && redisClient && redisClient.status === 'ready';
};

/**
 * Close Redis connection gracefully
 */
const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('✅ Redis connection closed');
    } catch (error) {
      console.error('❌ Error closing Redis connection:', error.message);
    }
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisEnabled,
  closeRedis
};

