const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    event: {
      type: String,
      required: true,
      // e.g., 'order_created', 'payment_authorized', 'payment_captured', 'payment_failed', 'refund_initiated', 'refund_completed'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    amount: Number,
    currency: { type: String, default: 'INR' },
    status: String,
    method: String,
    rawPayload: mongoose.Schema.Types.Mixed,
    errorMessage: String,
  },
  { timestamps: true }
);

paymentLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
