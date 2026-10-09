const router = require('express').Router();
const vehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createVehicleSchema, updateVehicleSchema, vehicleQuerySchema } = require('../validators/vehicle.validator');
const { uploadVehicleImages } = require('../config/cloudinary');

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: vehicleType
 *         schema: { type: string, enum: [car, bus] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of vehicles }
 */
router.get('/', validate(vehicleQuerySchema, 'query'), vehicleController.getAllVehicles);
router.get('/available', vehicleController.getAvailableVehicles);
router.get('/categories', vehicleController.getCategories);
router.get('/:id', vehicleController.getVehicle);

// Admin-only routes
router.post('/',
  authenticate,
  authorize('admin', 'superadmin'),
  validate(createVehicleSchema),
  vehicleController.createVehicle
);

router.put('/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle
);

router.delete('/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  vehicleController.deleteVehicle
);

router.post('/:id/images',
  authenticate,
  authorize('admin', 'superadmin'),
  uploadVehicleImages.array('images', 5),
  vehicleController.uploadImages
);

router.delete('/:id/images/:imageId',
  authenticate,
  authorize('admin', 'superadmin'),
  vehicleController.removeImage
);

module.exports = router;
