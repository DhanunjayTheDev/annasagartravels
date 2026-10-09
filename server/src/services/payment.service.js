const crypto = require('crypto');
const { getRazorpay } = require('../config/razorpay');
const bookingRepository = require('../repositories/booking.repository');
const paymentLogRepository = require('../repositories/paymentLog.repository');
const activityLogRepository = require('../repositories/activityLog.repository');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { addJob } = require('../queues');
const logger = require('../utils/logger');

class PaymentService {
  /**
   * Create Razorpay order for a booking
   */
  async createOrder(bookingId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.payment.status === 'paid') {
      throw new BadRequestError('Payment already completed');
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: Math.round(booking.pricing.finalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: booking.bookingId,
      notes: {
        bookingId: booking.bookingId,
        customerName: booking.customer.name,
        customerPhone: booking.customer.phone,
      },
    });

    // Update booking with Razorpay order ID
    await bookingRepository.update(bookingId, {
      'payment.razorpayOrderId': order.id,
    });

    // Log
    await paymentLogRepository.create({
      bookingId: booking._id,
      event: 'order_created',
      razorpayOrderId: order.id,
      amount: booking.pricing.finalAmount,
      status: 'created',
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking.bookingId,
      keyId: process.env.RAZORPAY_KEY_ID,
      customer: booking.customer,
    };
  }

  /**
   * Verify payment via webhook (server-side verification - NOT frontend trust)
   */
  async verifyWebhook(body, signature) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.warn('Invalid webhook signature');
      throw new BadRequestError('Invalid webhook signature');
    }

    const event = body.event;
    const payload = body.payload;

    switch (event) {
      case 'payment.authorized':
        await this.handlePaymentAuthorized(payload);
        break;
      case 'payment.captured':
        await this.handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(payload);
        break;
      case 'refund.processed':
        await this.handleRefundProcessed(payload);
        break;
      default:
        logger.info(`Unhandled webhook event: ${event}`);
    }
  }

  async handlePaymentAuthorized(payload) {
    const payment = payload.payment.entity;
    const orderId = payment.order_id;

    await paymentLogRepository.create({
      bookingId: await this.getBookingIdByOrderId(orderId),
      event: 'payment_authorized',
      razorpayOrderId: orderId,
      razorpayPaymentId: payment.id,
      amount: payment.amount / 100,
      status: payment.status,
      method: payment.method,
      rawPayload: payment,
    });

    logger.info(`Payment authorized: ${payment.id}`);
  }

  async handlePaymentCaptured(payload) {
    const payment = payload.payment.entity;
    const orderId = payment.order_id;

    // Find booking by Razorpay order ID
    const booking = await this.findBookingByOrderId(orderId);
    if (!booking) {
      logger.error(`Booking not found for order: ${orderId}`);
      return;
    }

    // Update booking payment status
    await bookingRepository.update(booking._id, {
      'payment.status': 'paid',
      'payment.razorpayPaymentId': payment.id,
      'payment.transactionId': payment.id,
      'payment.method': payment.method,
      'payment.paidAt': new Date(),
      status: 'confirmed',
    });

    await paymentLogRepository.create({
      bookingId: booking._id,
      event: 'payment_captured',
      razorpayOrderId: orderId,
      razorpayPaymentId: payment.id,
      amount: payment.amount / 100,
      status: 'captured',
      method: payment.method,
      rawPayload: payment,
    });

    // Queue notifications
    addJob('email', 'payment_confirmation', {
      bookingId: booking.bookingId,
      customer: booking.customer,
      amount: payment.amount / 100,
    }).catch(() => {});

    // Queue invoice PDF generation
    addJob('invoice', 'generate', {
      bookingId: booking._id.toString(),
    }).catch(() => {});

    logger.info(`Payment captured for booking ${booking.bookingId}: ${payment.id}`);
  }

  async handlePaymentFailed(payload) {
    const payment = payload.payment.entity;
    const orderId = payment.order_id;

    const booking = await this.findBookingByOrderId(orderId);
    if (!booking) return;

    await bookingRepository.update(booking._id, {
      'payment.status': 'failed',
    });

    await paymentLogRepository.create({
      bookingId: booking._id,
      event: 'payment_failed',
      razorpayOrderId: orderId,
      razorpayPaymentId: payment.id,
      amount: payment.amount / 100,
      status: 'failed',
      errorMessage: payment.error_description,
      rawPayload: payment,
    });

    logger.warn(`Payment failed for booking ${booking.bookingId}: ${payment.error_description}`);
  }

  async handleRefundProcessed(payload) {
    const refund = payload.refund.entity;
    const paymentId = refund.payment_id;

    const booking = await this.findBookingByPaymentId(paymentId);
    if (!booking) return;

    await bookingRepository.update(booking._id, {
      'payment.status': 'refunded',
      'payment.refundId': refund.id,
      'payment.refundedAt': new Date(),
      'payment.refundAmount': refund.amount / 100,
    });

    await paymentLogRepository.create({
      bookingId: booking._id,
      event: 'refund_completed',
      razorpayPaymentId: paymentId,
      amount: refund.amount / 100,
      status: 'refunded',
      rawPayload: refund,
    });

    logger.info(`Refund processed for booking ${booking.bookingId}: ${refund.id}`);
  }

  /**
   * Manual payment verification (backup - frontend callback)
   */
  async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new BadRequestError('Payment verification failed');
    }

    const booking = await this.findBookingByOrderId(razorpay_order_id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Only update if not already handled by webhook
    if (booking.payment.status !== 'paid') {
      await bookingRepository.update(booking._id, {
        'payment.status': 'paid',
        'payment.razorpayPaymentId': razorpay_payment_id,
        'payment.transactionId': razorpay_payment_id,
        'payment.paidAt': new Date(),
        status: 'confirmed',
      });

      await paymentLogRepository.create({
        bookingId: booking._id,
        event: 'payment_verified_manual',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: booking.pricing.finalAmount,
        status: 'paid',
      });
    }

    return booking;
  }

  /**
   * Initiate a refund
   */
  async initiateRefund(bookingId, amount = null) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.payment.status !== 'paid') {
      throw new BadRequestError('Payment has not been captured');
    }

    const razorpay = getRazorpay();
    const refundAmount = amount || booking.pricing.finalAmount;

    const refund = await razorpay.payments.refund(booking.payment.razorpayPaymentId, {
      amount: Math.round(refundAmount * 100),
      notes: {
        bookingId: booking.bookingId,
        reason: 'Booking cancelled',
      },
    });

    await paymentLogRepository.create({
      bookingId: booking._id,
      event: 'refund_initiated',
      razorpayPaymentId: booking.payment.razorpayPaymentId,
      amount: refundAmount,
      status: 'processing',
    });

    return refund;
  }

  // Helper methods
  async findBookingByOrderId(orderId) {
    const Booking = require('../models/Booking');
    return Booking.findOne({ 'payment.razorpayOrderId': orderId });
  }

  async findBookingByPaymentId(paymentId) {
    const Booking = require('../models/Booking');
    return Booking.findOne({ 'payment.razorpayPaymentId': paymentId });
  }

  async getBookingIdByOrderId(orderId) {
    const booking = await this.findBookingByOrderId(orderId);
    return booking?._id;
  }

  async getPaymentLogs(bookingId) {
    return paymentLogRepository.findByBookingId(bookingId);
  }
}

module.exports = new PaymentService();
