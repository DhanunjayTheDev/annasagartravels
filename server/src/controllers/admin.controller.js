const userRepository = require('../repositories/user.repository');
const sessionRepository = require('../repositories/session.repository');
const activityLogRepository = require('../repositories/activityLog.repository');
const { asyncHandler, paginate } = require('../utils/helpers');
const { NotFoundError } = require('../utils/errors');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page, limit } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const pagination = paginate(page, limit);
  const { users, total } = await userRepository.findAll(filter, {
    skip: pagination.skip,
    limit: pagination.limit,
  });

  res.paginated(users, {
    page: pagination.page,
    limit: pagination.limit,
    total,
    pages: Math.ceil(total / pagination.limit),
  });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  res.success(user);
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await userRepository.update(req.params.id, { role });
  if (!user) throw new NotFoundError('User not found');
  
  await activityLogRepository.create({
    userId: req.user._id,
    action: 'user.role_change',
    resourceType: 'user',
    resourceId: req.params.id,
    description: `Changed user role to ${role}`,
  });
  
  res.success(user, 'User role updated');
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userRepository.deactivate(req.params.id);
  if (!user) throw new NotFoundError('User not found');

  // Kill all sessions
  await sessionRepository.deactivateAllForUser(req.params.id);

  await activityLogRepository.create({
    userId: req.user._id,
    action: 'user.deactivate',
    resourceType: 'user',
    resourceId: req.params.id,
    description: `Deactivated user ${user.email}`,
  });

  res.success(user, 'User deactivated');
});

const activateUser = asyncHandler(async (req, res) => {
  const user = await userRepository.activate(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  res.success(user, 'User activated');
});

const forceLogoutUser = asyncHandler(async (req, res) => {
  await sessionRepository.deactivateAllForUser(req.params.id);
  
  await activityLogRepository.create({
    userId: req.user._id,
    action: 'user.force_logout',
    resourceType: 'user',
    resourceId: req.params.id,
    description: 'Force logged out all sessions',
  });

  res.success(null, 'All sessions terminated for user');
});

const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive, name } = req.body;
  const updates = {};
  if (role !== undefined) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;
  if (name !== undefined) updates.name = name;
  const user = await userRepository.update(req.params.id, updates);
  if (!user) throw new NotFoundError('User not found');
  res.success(user, 'User updated');
});

const getActivityLogs = asyncHandler(async (req, res) => {
  const { action, resourceType, page, limit } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (resourceType) filter.resourceType = resourceType;

  const pagination = paginate(page, limit);
  const { logs, total } = await activityLogRepository.findAll(filter, {
    skip: pagination.skip,
    limit: pagination.limit,
  });

  res.paginated(logs, {
    page: pagination.page,
    limit: pagination.limit,
    total,
    pages: Math.ceil(total / pagination.limit),
  });
});

module.exports = {
  getAllUsers,
  getUser,
  updateUserRole,
  updateUser,
  deactivateUser,
  activateUser,
  forceLogoutUser,
  getActivityLogs,
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

const getDashboard = asyncHandler(async (req, res) => {
  const [totalBookings, totalVehicles, totalUsers, revenueResult, recentBookings, statusCounts] =
    await Promise.all([
      Booking.countDocuments(),
      Vehicle.countDocuments(),
      User.countDocuments(),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.finalAmount' } } },
      ]),
      Booking.find()
        .sort('-createdAt')
        .limit(10)
        .lean(),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

  const monthlyStats = statusCounts.reduce(
    (acc, { _id, count }) => { acc[_id] = count; return acc; },
    { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  );

  res.success({
    totalBookings,
    totalRevenue: revenueResult[0]?.total || 0,
    totalVehicles,
    totalUsers,
    recentBookings,
    monthlyStats,
  });
});

// ─── Analytics ───────────────────────────────────────────────────────────────

const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalBookings,
    totalVehicles,
    bookingsByStatus,
    vehiclesByType,
    monthlyRevenue,
    topVehicles,
    topRoutes,
    totalRevenueResult,
  ] = await Promise.all([
    Booking.countDocuments(),
    Vehicle.countDocuments(),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Vehicle.aggregate([{ $group: { _id: '$vehicleType', count: { $sum: 1 } } }]),
    Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$pricing.finalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      {
        $group: {
          _id: '$vehicleSnapshot.name',
          bookingCount: { $sum: 1 },
          revenue: { $sum: '$pricing.finalAmount' },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      { $project: { name: '$_id', bookingCount: 1, revenue: 1, _id: 0 } },
    ]),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      {
        $group: {
          _id: { pickup: '$trip.pickupLocation', drop: '$trip.dropLocation' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.finalAmount' } } },
    ]),
  ]);

  res.success({
    revenue: {
      total: totalRevenueResult[0]?.total || 0,
      monthly: monthlyRevenue,
    },
    bookings: {
      total: totalBookings,
      byStatus: bookingsByStatus,
    },
    vehicles: {
      total: totalVehicles,
      byType: vehiclesByType,
    },
    topVehicles,
    topRoutes,
  });
});

// ─── Generic user update (role or isActive) ───────────────────────────────────

const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const updates = {};
  if (role !== undefined) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;

  const user = await userRepository.update(req.params.id, updates);
  if (!user) throw new NotFoundError('User not found');

  res.success(user, 'User updated');
});

Object.assign(module.exports, { getDashboard, getAnalytics, updateUser });
