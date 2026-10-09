const { z } = require('zod');

const createBookingSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  customer: z.object({
    name: z.string().min(2).max(100).trim(),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    email: z.string().email().optional().or(z.literal('')),
  }),
  trip: z.object({
    pickupLocation: z.string().min(2).trim(),
    dropLocation: z.string().min(2).trim(),
    distance: z.number().positive().optional(),
    duration: z.number().positive().optional(),
    tripType: z.enum(['oneWay', 'roundTrip', 'hourly', 'multiDay']).optional(),
  }),
  schedule: z.object({
    startDateTime: z.string().datetime({ offset: true }).or(z.string().min(1)),
    endDateTime: z.string().datetime({ offset: true }).or(z.string().min(1)),
  }),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(['razorpay', 'cash', 'bank_transfer', 'upi']).optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'ongoing', 'completed', 'cancelled']),
  cancellationReason: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const bookingQuerySchema = z.object({
  status: z.string().optional(),
  vehicleType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  search: z.string().optional(),
}).passthrough();

module.exports = { createBookingSchema, updateBookingStatusSchema, bookingQuerySchema };
