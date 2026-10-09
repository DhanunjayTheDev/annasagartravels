const bookingService = require('../services/booking.service');
const { asyncHandler } = require('../utils/helpers');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.create(req.body, req.user?._id);
  res.created(booking, 'Booking created successfully');
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getById(req.params.id);
  res.success(booking);
});

const getBookingByBookingId = asyncHandler(async (req, res) => {
  const booking = await bookingService.getByBookingId(req.params.bookingId);
  res.success(booking);
});

const getAllBookings = asyncHandler(async (req, res) => {
  const { bookings, pagination } = await bookingService.getAll(req.query);
  res.paginated(bookings, pagination);
});

const getUserBookings = asyncHandler(async (req, res) => {
  const { bookings, total } = await bookingService.getUserBookings(req.user._id, req.query);
  res.paginated(bookings, {
    total,
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 20,
    pages: Math.ceil(total / (parseInt(req.query.limit, 10) || 20)),
  });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateStatus(req.params.id, req.body, req.user._id);
  res.success(booking, 'Booking status updated');
});

const adminUpdateBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.adminUpdate(req.params.id, req.body, req.user._id);
  res.success(booking, 'Booking updated by admin');
});

const checkAvailability = asyncHandler(async (req, res) => {
  const { vehicleId, startDateTime, endDateTime } = req.query;
  const result = await bookingService.checkAvailability(vehicleId, startDateTime, endDateTime);
  res.success(result);
});

// Analytics
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await bookingService.getDashboardStats();
  res.success(stats);
});

const getRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const report = await bookingService.getRevenueReport(startDate, endDate);
  res.success(report);
});

const getTopRoutes = asyncHandler(async (req, res) => {
  const routes = await bookingService.getTopRoutes(parseInt(req.query.limit, 10) || 10);
  res.success(routes);
});

const getVehicleUtilization = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const utilization = await bookingService.getVehicleUtilization(startDate, endDate);
  res.success(utilization);
});

module.exports = {
  createBooking,
  getBooking,
  getBookingByBookingId,
  getAllBookings,
  getUserBookings,
  updateBookingStatus,
  adminUpdateBooking,
  checkAvailability,
  getDashboardStats,
  getRevenueReport,
  getTopRoutes,
  getVehicleUtilization,
};
