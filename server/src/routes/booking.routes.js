const router = require('express').Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { idempotency } = require('../middleware/idempotency');
const { bookingLimiter } = require('../middleware/rateLimiter');
const { createBookingSchema, updateBookingStatusSchema } = require('../validators/booking.validator');

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     headers:
 *       Idempotency-Key:
 *         description: Unique key to prevent duplicate bookings
 *         schema: { type: string }
 */
router.post('/',
  authenticate,
  bookingLimiter,
  idempotency(),
  validate(createBookingSchema),
  bookingController.createBooking
);

router.get('/my', authenticate, bookingController.getUserBookings);
router.get('/availability', bookingController.checkAvailability);
router.get('/lookup/:bookingId', bookingController.getBookingByBookingId);

// Admin routes
router.get('/',
  authenticate,
  authorize('staff', 'admin', 'superadmin'),
  bookingController.getAllBookings
);

router.get('/:id',
  authenticate,
  bookingController.getBooking
);

router.patch('/:id/status',
  authenticate,
  authorize('staff', 'admin', 'superadmin'),
  validate(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

router.put('/:id/admin',
  authenticate,
  authorize('admin', 'superadmin'),
  bookingController.adminUpdateBooking
);

// Analytics
router.get('/analytics/dashboard',
  authenticate,
  authorize('staff', 'admin', 'superadmin'),
  bookingController.getDashboardStats
);

router.get('/analytics/revenue',
  authenticate,
  authorize('admin', 'superadmin'),
  bookingController.getRevenueReport
);

router.get('/analytics/routes',
  authenticate,
  authorize('admin', 'superadmin'),
  bookingController.getTopRoutes
);

router.get('/analytics/utilization',
  authenticate,
  authorize('admin', 'superadmin'),
  bookingController.getVehicleUtilization
);

module.exports = router;
