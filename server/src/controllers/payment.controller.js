const paymentService = require('../services/payment.service');
const { asyncHandler } = require('../utils/helpers');

const createOrder = asyncHandler(async (req, res) => {
  const order = await paymentService.createOrder(req.params.bookingId);
  res.success(order, 'Payment order created');
});

const verifyPayment = asyncHandler(async (req, res) => {
  const booking = await paymentService.verifyPayment(req.body);
  res.success(booking, 'Payment verified successfully');
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  await paymentService.verifyWebhook(req.body, signature);
  res.status(200).json({ success: true });
});

const initiateRefund = asyncHandler(async (req, res) => {
  const refund = await paymentService.initiateRefund(
    req.params.bookingId,
    req.body.amount
  );
  res.success(refund, 'Refund initiated');
});

const getPaymentLogs = asyncHandler(async (req, res) => {
  const logs = await paymentService.getPaymentLogs(req.params.bookingId);
  res.success(logs);
});

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  initiateRefund,
  getPaymentLogs,
};
