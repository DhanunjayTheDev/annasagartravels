const mongoose = require('mongoose');
const bookingRepository = require('../repositories/booking.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const activityLogRepository = require('../repositories/activityLog.repository');
const paymentLogRepository = require('../repositories/paymentLog.repository');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');
const { generateBookingId, calculateFare, calculateTax, paginate } = require('../utils/helpers');
const Booking = require('../models/Booking');
const { addJob } = require('../queues');

class BookingService {
  /**
   * Create a booking with atomic transaction and availability check
   */
  async create(data, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Verify vehicle exists and is available
      const vehicle = await vehicleRepository.findById(data.vehicleId);
      if (!vehicle) {
        throw new NotFoundError('Vehicle not found');
      }
      if (!vehicle.isAvailable) {
        throw new BadRequestError('Vehicle is not available');
      }

      const startDateTime = new Date(data.schedule.startDateTime);
      const endDateTime = new Date(data.schedule.endDateTime);

      // Validate dates
      if (startDateTime >= endDateTime) {
        throw new BadRequestError('End date must be after start date');
      }
      if (startDateTime < new Date()) {
        throw new BadRequestError('Start date must be in the future');
      }

      // 2. Check for overlapping bookings (CRITICAL - prevent double booking)
      const overlapping = await bookingRepository.findOverlapping(
        data.vehicleId,
        startDateTime,
        endDateTime
      );

      if (overlapping.length > 0) {
        throw new ConflictError('Vehicle is already booked for the selected time period');
      }

      // 3. Calculate pricing
      const distance = data.trip.distance || 0;
      const duration = data.trip.duration || 0;

      const baseFare = calculateFare({
        rate: vehicle.rate,
        distance,
        duration,
        pricingType: vehicle.pricingType,
        minimumFare: vehicle.minimumFare,
      });

      const taxes = calculateTax(baseFare, 5); // 5% GST
      const discount = 0; // Coupon logic can be added
      const finalAmount = baseFare + taxes - discount;

      // 4. Generate booking ID
      const bookingId = await generateBookingId(Booking);

      // 5. Create booking atomically
      const bookingData = {
        bookingId,
        vehicleId: vehicle._id,
        userId,
        vehicleSnapshot: {
          name: vehicle.name,
          vehicleType: vehicle.vehicleType,
          category: vehicle.category,
          pricingType: vehicle.pricingType,
          rate: vehicle.rate,
          seatingCapacity: vehicle.seatingCapacity,
          registrationNumber: vehicle.registrationNumber,
        },
        customer: data.customer,
        trip: {
          pickupLocation: data.trip.pickupLocation,
          dropLocation: data.trip.dropLocation,
          distance,
          duration,
          tripType: data.trip.tripType || 'oneWay',
        },
        schedule: { startDateTime, endDateTime },
        pricing: {
          baseFare,
          taxes,
          extraCharges: 0,
          discount,
          couponCode: data.couponCode,
          finalAmount,
        },
        payment: {
          status: 'pending',
          method: data.paymentMethod || 'razorpay',
        },
        status: 'pending',
        notes: data.notes,
      };

      const booking = await bookingRepository.create(bookingData, session);

      await session.commitTransaction();

      // Log activity (non-blocking)
      activityLogRepository.create({
        userId,
        action: 'booking.create',
        resourceType: 'booking',
        resourceId: booking._id.toString(),
        description: `Booking ${bookingId} created for ${vehicle.name}`,
      }).catch(() => {});

      // Queue email notification (non-blocking)
      if (data.customer.email) {
        addJob('email', 'booking_confirmation', {
          bookingId: booking.bookingId,
          customer: data.customer,
          vehicle: bookingData.vehicleSnapshot,
          trip: bookingData.trip,
          schedule: bookingData.schedule,
          pricing: bookingData.pricing,
        }).catch(() => {});
      }

      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getById(id) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }
    return booking;
  }

  async getByBookingId(bookingId) {
    const booking = await bookingRepository.findByBookingId(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }
    return booking;
  }

  async getAll(query) {
    const { status, vehicleType, startDate, endDate, search, page, limit, sort } = query;

    const filter = {};
    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }
    if (vehicleType) {
      filter['vehicleSnapshot.vehicleType'] = vehicleType;
    }

    const pagination = paginate(page, limit);

    const { bookings, total } = await bookingRepository.findAll(filter, {
      skip: pagination.skip,
      limit: pagination.limit,
      sort: sort || '-createdAt',
    });

    return {
      bookings,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getUserBookings(userId, query) {
    const pagination = paginate(query.page, query.limit);
    return bookingRepository.findByUserId(userId, {
      skip: pagination.skip,
      limit: pagination.limit,
    });
  }

  async updateStatus(id, { status, cancellationReason, notes }, userId) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['ongoing', 'cancelled'],
      ongoing: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      throw new BadRequestError(
        `Cannot transition from "${booking.status}" to "${status}"`
      );
    }

    const updateData = { status };

    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason;
      updateData.cancelledBy = userId;

      // Trigger refund if payment was completed
      if (booking.payment.status === 'paid') {
        addJob('payment', 'initiate_refund', {
          bookingId: booking._id,
          amount: booking.pricing.finalAmount,
          razorpayPaymentId: booking.payment.razorpayPaymentId,
        }).catch(() => {});
      }
    }

    if (notes) updateData.notes = notes;

    const updatedBooking = await bookingRepository.update(id, updateData);

    await activityLogRepository.create({
      userId,
      action: `booking.${status}`,
      resourceType: 'booking',
      resourceId: id,
      description: `Booking ${booking.bookingId} status changed to ${status}`,
      metadata: { previousStatus: booking.status, cancellationReason },
    });

    return updatedBooking;
  }

  async adminUpdate(id, data, userId) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const updatedBooking = await bookingRepository.update(id, data);

    await activityLogRepository.create({
      userId,
      action: 'booking.admin_update',
      resourceType: 'booking',
      resourceId: id,
      description: `Admin override on booking ${booking.bookingId}`,
      metadata: { updatedFields: Object.keys(data) },
    });

    return updatedBooking;
  }

  // Analytics
  async getDashboardStats() {
    return bookingRepository.getDashboardStats();
  }

  async getRevenueReport(startDate, endDate) {
    return bookingRepository.getRevenueByPeriod(startDate, endDate);
  }

  async getTopRoutes(limit) {
    return bookingRepository.getTopRoutes(limit);
  }

  async getVehicleUtilization(startDate, endDate) {
    return bookingRepository.getVehicleUtilization(startDate, endDate);
  }

  async checkAvailability(vehicleId, startDateTime, endDateTime) {
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const overlapping = await bookingRepository.findOverlapping(
      vehicleId,
      startDateTime,
      endDateTime
    );

    return {
      available: overlapping.length === 0,
      vehicle: {
        id: vehicle._id,
        name: vehicle.name,
        vehicleType: vehicle.vehicleType,
      },
      conflictingBookings: overlapping.map((b) => ({
        bookingId: b.bookingId,
        start: b.schedule.startDateTime,
        end: b.schedule.endDateTime,
      })),
    };
  }
}

module.exports = new BookingService();
