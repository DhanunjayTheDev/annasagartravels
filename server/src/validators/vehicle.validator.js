const { z } = require('zod');

const createVehicleSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  vehicleType: z.enum(['car', 'bus']),
  category: z.string().min(2).max(50).trim(),
  pricingType: z.enum(['perKm', 'perHour', 'fixed']),
  rate: z.number().positive('Rate must be positive'),
  minimumFare: z.number().min(0).optional(),
  seatingCapacity: z.number().int().min(1).max(60),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'cng', 'hybrid']).optional(),
  amenities: z.array(z.string().trim()).optional(),
  registrationNumber: z.string().trim().optional(),
  description: z.string().max(1000).optional(),
  isAvailable: z.boolean().optional(),
});

const updateVehicleSchema = createVehicleSchema.partial();

const vehicleQuerySchema = z.object({
  vehicleType: z.enum(['car', 'bus']).optional(),
  category: z.string().optional(),
  minCapacity: z.string().optional(),
  maxRate: z.string().optional(),
  isAvailable: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
}).passthrough();

module.exports = { createVehicleSchema, updateVehicleSchema, vehicleQuerySchema };
