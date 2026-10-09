const { getRedis } = require('../config/redis');
const { ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Idempotency middleware - prevents duplicate requests
 * Requires 'Idempotency-Key' header
 */
const idempotency = (ttlSeconds = 86400) => {
  return async (req, res, next) => {
    const key = req.headers['idempotency-key'];
    if (!key) {
      return next();
    }

    const redis = getRedis();
    if (!redis) {
      return next(); // Skip without Redis
    }

    const idempotencyKey = `idem:${key}`;

    try {
      const existing = await redis.get(idempotencyKey);
      if (existing) {
        const cached = JSON.parse(existing);
        logger.info(`Idempotent request detected: ${key}`);
        return res.status(cached.statusCode).json(cached.body);
      }

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        redis.setex(idempotencyKey, ttlSeconds, JSON.stringify({
          statusCode: res.statusCode,
          body,
        })).catch((err) => logger.error('Idempotency cache error:', err));
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Idempotency middleware error:', error);
      next();
    }
  };
};

module.exports = { idempotency };
