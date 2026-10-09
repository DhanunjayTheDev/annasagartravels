const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const bookingController = require('../controllers/booking.controller');
const vehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadVehicleImages } = require('../config/cloudinary');

// All admin routes require admin or superadmin
router.use(authenticate, authorize('admin', 'superadmin'));

// ─── Dashboard & Analytics ───────────────────────────────────────────────────
router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);

// ─── Users ───────────────────────────────────────────────────────────────────
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/deactivate', adminController.deactivateUser);
router.patch('/users/:id/activate', adminController.activateUser);
router.post('/users/:id/force-logout', adminController.forceLogoutUser);
router.patch('/users/:id', adminController.updateUser);

// ─── Bookings ────────────────────────────────────────────────────────────────
router.get('/bookings', bookingController.getAllBookings);
router.patch('/bookings/:id/status', bookingController.updateBookingStatus);

// ─── Vehicles ────────────────────────────────────────────────────────────────
router.get('/vehicles', vehicleController.getAllVehicles);
router.post('/vehicles', uploadVehicleImages.array('images', 5), vehicleController.createVehicle);
router.put('/vehicles/:id', vehicleController.updateVehicle);
router.delete('/vehicles/:id', vehicleController.deleteVehicle);

// ─── Activity Logs ───────────────────────────────────────────────────────────
router.get('/activity-logs', adminController.getActivityLogs);

module.exports = router;
