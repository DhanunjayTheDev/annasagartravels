const { Queue, Worker } = require('bullmq');
const { getRedis } = require('../config/redis');
const logger = require('../utils/logger');

const queues = {};
const workers = {};

const QUEUE_NAMES = ['email', 'invoice', 'payment', 'notification'];

const initQueues = async () => {
  const redis = getRedis();
  if (!redis) {
    logger.warn('Queues disabled: Redis not available');
    return;
  }

  const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  };

  for (const name of QUEUE_NAMES) {
    queues[name] = new Queue(name, { connection });
    logger.info(`Queue "${name}" initialized`);
  }

  // Email worker
  workers.email = new Worker('email', async (job) => {
    const { processEmailJob } = require('./workers/email.worker');
    await processEmailJob(job);
  }, {
    connection,
    concurrency: 5,
    limiter: { max: 10, duration: 1000 },
  });

  // Invoice worker
  workers.invoice = new Worker('invoice', async (job) => {
    const { processInvoiceJob } = require('./workers/invoice.worker');
    await processInvoiceJob(job);
  }, { connection, concurrency: 2 });

  // Payment worker
  workers.payment = new Worker('payment', async (job) => {
    const { processPaymentJob } = require('./workers/payment.worker');
    await processPaymentJob(job);
  }, { connection, concurrency: 3 });

  // Attach error handlers
  Object.entries(workers).forEach(([name, worker]) => {
    worker.on('completed', (job) => {
      logger.info(`[${name}] Job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
      logger.error(`[${name}] Job ${job?.id} failed:`, err.message);
    });
  });
};

const addJob = async (queueName, jobName, data, opts = {}) => {
  const queue = queues[queueName];
  if (!queue) {
    logger.warn(`Queue "${queueName}" not available, skipping job "${jobName}"`);
    return null;
  }

  return queue.add(jobName, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
    ...opts,
  });
};

module.exports = { initQueues, addJob, queues };
