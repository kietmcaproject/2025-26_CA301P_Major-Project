/**
 * Redis Connection Test Script
 * Run this to verify your Redis Cloud configuration
 * Usage: node test-redis.js
 */

require('dotenv').config();
const Redis = require('ioredis');

console.log('\n🔍 Testing Redis Cloud Configuration...\n');

// Display configuration
console.log('📋 Configuration Check:');
console.log('─────────────────────────────────────');
console.log('REDIS_ENABLED:', process.env.REDIS_ENABLED || 'not set');
console.log('REDIS_URL:', process.env.REDIS_URL ? '***SET***' : 'not set');
console.log('REDIS_HOST:', process.env.REDIS_HOST || 'not set');
console.log('REDIS_PORT:', process.env.REDIS_PORT || 'not set');
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***SET***' : 'not set');
console.log('REDIS_DB:', process.env.REDIS_DB || 'not set');
console.log('─────────────────────────────────────\n');

let redisClient = null;
let connectionSuccess = false;

async function testRedisConnection() {
  try {
    // Check if Redis is enabled
    if (process.env.REDIS_ENABLED !== 'true' && !process.env.REDIS_URL) {
      console.log('⚠️  Redis is not enabled.');
      console.log('   Set REDIS_ENABLED=true or provide REDIS_URL in your .env file\n');
      return;
    }

    // Create Redis client
    if (process.env.REDIS_URL) {
      console.log('🔗 Connecting to Redis Cloud using REDIS_URL...');
      redisClient = new Redis(process.env.REDIS_URL, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 15000,
      });
    } else {
      console.log('🔗 Connecting to Redis using host/port...');
      redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 15000,
      });
    }

    // Set up event handlers
    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis Ready');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Error:', err.message);
    });

    // Test connection with ping
    console.log('\n🧪 Testing connection...');
    const pong = await redisClient.ping();
    
    if (pong === 'PONG') {
      console.log('✅ PING successful - Connection is working!\n');
      connectionSuccess = true;
    } else {
      console.log('⚠️  Unexpected PING response:', pong);
    }

    // Test set/get operations
    console.log('🧪 Testing SET/GET operations...');
    const testKey = 'test:connection:' + Date.now();
    const testValue = 'Hello from Redis Cloud!';
    
    await redisClient.set(testKey, testValue, 'EX', 60); // Expire in 60 seconds
    console.log('✅ SET operation successful');
    
    const retrievedValue = await redisClient.get(testKey);
    if (retrievedValue === testValue) {
      console.log('✅ GET operation successful');
      console.log(`   Retrieved value: "${retrievedValue}"\n`);
    } else {
      console.log('⚠️  GET operation failed - values do not match');
    }

    // Clean up test key
    await redisClient.del(testKey);
    console.log('✅ Test key cleaned up');

    // Get Redis info
    console.log('\n📊 Redis Server Info:');
    const info = await redisClient.info('server');
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    if (versionMatch) {
      console.log('   Redis Version:', versionMatch[1]);
    }

    // Check connection status
    console.log('\n📈 Connection Status:');
    console.log('   Status:', redisClient.status);
    console.log('   Mode:', redisClient.mode || 'standard');

    console.log('\n✅ All tests passed! Your Redis Cloud is configured correctly.\n');

  } catch (error) {
    console.error('\n❌ Connection Test Failed!');
    console.error('   Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check if REDIS_URL is correct (for Redis Cloud)');
    console.error('   2. Verify your Redis Cloud credentials');
    console.error('   3. Check if your IP is whitelisted in Redis Cloud');
    console.error('   4. Ensure Redis Cloud instance is running');
    console.error('   5. Check network connectivity\n');
  } finally {
    if (redisClient) {
      await redisClient.quit();
      console.log('🔌 Connection closed\n');
    }
    process.exit(connectionSuccess ? 0 : 1);
  }
}

// Run the test
testRedisConnection();

