const Booking = require('../models/Booking');
const mongoose = require('mongoose');

class BookingRepository {
  async create(data, session = null) {
    const options = session ? { session } : {};
    const [booking] = await Booking.create([data], options);
    return booking;
  }

  async findById(id) {
    return Booking.findById(id).populate('vehicleId', 'name vehicleType category images');
  }

  async findByBookingId(bookingId) {
    return Booking.findOne({ bookingId }).populate('vehicleId', 'name vehicleType category images');
  }

  async update(id, data, session = null) {
    const options = { new: true, runValidators: true };
    if (session) options.session = session;
    return Booking.findByIdAndUpdate(id, data, options);
  }

  async findAll(filter = {}, { skip = 0, limit = 20, sort = '-createdAt' } = {}) {
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('vehicleId', 'name vehicleType category images')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);
    return { bookings, total };
  }

  async findByUserId(userId, { skip = 0, limit = 20 } = {}) {
    return this.findAll({ userId }, { skip, limit });
  }

  /**
   * Check for overlapping bookings to prevent double-booking
   */
  async findOverlapping(vehicleId, startDateTime, endDateTime, excludeBookingId = null) {
    const filter = {
      vehicleId: new mongoose.Types.ObjectId(vehicleId),
      status: { $nin: ['cancelled'] },
      'schedule.startDateTime': { $lt: new Date(endDateTime) },
      'schedule.endDateTime': { $gt: new Date(startDateTime) },
    };

    if (excludeBookingId) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
    }

    return Booking.find(filter);
  }

  /**
   * Analytics helpers
   */
  async getRevenueByPeriod(startDate, endDate) {
    return Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'completed'] },
          'payment.status': 'paid',
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalRevenue: { $sum: '$pricing.finalAmount' },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getTopRoutes(limit = 10) {
    return Booking.aggregate([
      {
        $match: { status: { $in: ['confirmed', 'completed'] } },
      },
      {
        $group: {
          _id: {
            pickup: '$trip.pickupLocation',
            drop: '$trip.dropLocation',
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.finalAmount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
  }

  async getVehicleUtilization(startDate, endDate) {
    return Booking.aggregate([
      {
        $match: {
          status: { $nin: ['cancelled'] },
          'schedule.startDateTime': { $gte: new Date(startDate) },
          'schedule.endDateTime': { $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: '$vehicleId',
          bookingCount: { $sum: 1 },
          totalDuration: {
            $sum: {
              $divide: [
                { $subtract: ['$schedule.endDateTime', '$schedule.startDateTime'] },
                3600000, // Convert to hours
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicle',
        },
      },
      { $unwind: '$vehicle' },
      {
        $project: {
          vehicleName: '$vehicle.name',
          vehicleType: '$vehicle.vehicleType',
          bookingCount: 1,
          totalDuration: 1,
        },
      },
      { $sort: { bookingCount: -1 } },
    ]);
  }

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalBookings, todayBookings, monthRevenue, statusCounts] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      }),
      Booking.aggregate([
        {
          $match: {
            'payment.status': 'paid',
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$pricing.finalAmount' } } },
      ]),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      totalBookings,
      todayBookings,
      monthRevenue: monthRevenue[0]?.total || 0,
      statusBreakdown: statusCounts.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
    };
  }
}

module.exports = new BookingRepository();
