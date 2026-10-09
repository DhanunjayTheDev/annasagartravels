const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Immutable snapshot of vehicle at time of booking
    vehicleSnapshot: {
      name: String,
      vehicleType: String,
      category: String,
      pricingType: String,
      rate: Number,
      seatingCapacity: Number,
      registrationNumber: String,
    },

    // Customer details (may differ from logged-in user)
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },

    // Trip details
    trip: {
      pickupLocation: { type: String, required: true, trim: true },
      dropLocation: { type: String, required: true, trim: true },
      distance: { type: Number, min: 0 }, // in km
      duration: { type: Number, min: 0 }, // in minutes
      tripType: {
        type: String,
        enum: ['oneWay', 'roundTrip', 'hourly', 'multiDay'],
        default: 'oneWay',
      },
    },

    // Schedule
    schedule: {
      startDateTime: { type: Date, required: true },
      endDateTime: { type: Date, required: true },
    },

    // Pricing
    pricing: {
      baseFare: { type: Number, required: true, min: 0 },
      taxes: { type: Number, default: 0, min: 0 },
      extraCharges: { type: Number, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      couponCode: String,
      finalAmount: { type: Number, required: true, min: 0 },
    },

    // Payment
    payment: {
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending',
      },
      method: {
        type: String,
        enum: ['razorpay', 'cash', 'bank_transfer', 'upi'],
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      transactionId: String,
      paidAt: Date,
      refundId: String,
      refundedAt: Date,
      refundAmount: Number,
    },

    // Booking status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Audit
    cancelledAt: Date,
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for availability queries
bookingSchema.index({ vehicleId: 1, status: 1, 'schedule.startDateTime': 1, 'schedule.endDateTime': 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ 'customer.phone': 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
