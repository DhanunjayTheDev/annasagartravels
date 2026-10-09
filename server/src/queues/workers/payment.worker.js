const logger = require('../../utils/logger');

const processPaymentJob = async (job) => {
  const { name, data } = job;

  switch (name) {
    case 'initiate_refund': {
      const paymentService = require('../../services/payment.service');
      try {
        await paymentService.initiateRefund(data.bookingId, data.amount);
        logger.info(`Refund initiated for booking ${data.bookingId}`);
      } catch (error) {
        logger.error(`Refund failed for booking ${data.bookingId}:`, error.message);
        throw error;
      }
      break;
    }
    default:
      logger.warn(`Unknown payment job: ${name}`);
  }
};

module.exports = { processPaymentJob };
