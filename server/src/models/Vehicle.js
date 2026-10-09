const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Vehicle:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         vehicleType:
 *           type: string
 *           enum: [car, bus]
 *         category:
 *           type: string
 *         pricingType:
 *           type: string
 *           enum: [perKm, perHour, fixed]
 *         rate:
 *           type: number
 *         seatingCapacity:
 *           type: number
 */
const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
      maxlength: 200,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['car', 'bus'],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // car: sedan, suv, hatchback, luxury, etc.
      // bus: mini, standard, luxury, sleeper, etc.
    },
    pricingType: {
      type: String,
      required: true,
      enum: ['perKm', 'perHour', 'fixed'],
    },
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
      min: 0,
    },
    minimumFare: {
      type: Number,
      default: 0,
      min: 0,
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: 1,
      max: 60,
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'cng', 'hybrid'],
      default: 'diesel',
    },
    amenities: [{
      type: String,
      trim: true,
    }],
    images: [{
      url: { type: String, required: true },
      publicId: String,
    }],
    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

vehicleSchema.index({ vehicleType: 1, isAvailable: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ rate: 1 });
vehicleSchema.index({ seatingCapacity: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
