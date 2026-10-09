const vehicleService = require('../services/vehicle.service');
const { asyncHandler } = require('../utils/helpers');

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.create(req.body, req.user._id);
  res.created(vehicle, 'Vehicle created successfully');
});

const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getById(req.params.id);
  res.success(vehicle);
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.update(req.params.id, req.body, req.user._id);
  res.success(vehicle, 'Vehicle updated successfully');
});

const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.delete(req.params.id, req.user._id);
  res.success(null, 'Vehicle deleted successfully');
});

const getAllVehicles = asyncHandler(async (req, res) => {
  const { vehicles, pagination } = await vehicleService.getAll(req.query);
  res.paginated(vehicles, pagination);
});

const getAvailableVehicles = asyncHandler(async (req, res) => {
  const { vehicleType } = req.query;
  const filter = vehicleType ? { vehicleType } : {};
  const vehicles = await vehicleService.getAvailable(filter);
  res.success(vehicles);
});

const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No images provided',
    });
  }
  const vehicle = await vehicleService.addImages(req.params.id, req.files, req.user._id);
  res.success(vehicle, 'Images uploaded successfully');
});

const removeImage = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.removeImage(req.params.id, req.params.imageId, req.user._id);
  res.success(vehicle, 'Image removed successfully');
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await vehicleService.getCategories(req.query.vehicleType);
  res.success(categories);
});

module.exports = {
  createVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  getAllVehicles,
  getAvailableVehicles,
  uploadImages,
  removeImage,
  getCategories,
};
