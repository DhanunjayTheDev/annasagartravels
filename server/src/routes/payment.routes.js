const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /payments/{bookingId}/order:
 *   post:
 *     summary: Create Razorpay order for booking
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:bookingId/order', authenticate, paymentController.createOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);

// Webhook (no auth - verified via signature)
router.post('/webhook', paymentController.handleWebhook);

// Admin
router.post('/:bookingId/refund',
  authenticate,
  authorize('admin', 'superadmin'),
  paymentController.initiateRefund
);

router.get('/:bookingId/logs',
  authenticate,
  authorize('staff', 'admin', 'superadmin'),
  paymentController.getPaymentLogs
);

module.exports = router;
