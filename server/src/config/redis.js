const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;

const connectRedis = async () => {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        if (times > 10) {
          logger.error('Redis max retries reached');
          return null;
        }
        return Math.min(times * 200, 5000);
      },
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.error('Redis error:', err));
    redis.on('close', () => logger.warn('Redis connection closed'));

    // Test connection
    await redis.ping();
    return redis;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    // Allow server to start without Redis in development
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Continuing without Redis in development mode');
      return null;
    }
    throw error;
  }
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
