const vehicleRepository = require('../repositories/vehicle.repository');
const activityLogRepository = require('../repositories/activityLog.repository');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { paginate } = require('../utils/helpers');
const { cloudinary } = require('../config/cloudinary');

class VehicleService {
  async create(data, userId) {
    const vehicle = await vehicleRepository.create(data);

    await activityLogRepository.create({
      userId,
      action: 'vehicle.create',
      resourceType: 'vehicle',
      resourceId: vehicle._id.toString(),
      description: `Created vehicle: ${vehicle.name}`,
    });

    return vehicle;
  }

  async getById(id) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }
    return vehicle;
  }

  async update(id, data, userId) {
    const vehicle = await vehicleRepository.update(id, data);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    await activityLogRepository.create({
      userId,
      action: 'vehicle.update',
      resourceType: 'vehicle',
      resourceId: id,
      description: `Updated vehicle: ${vehicle.name}`,
      metadata: { updatedFields: Object.keys(data) },
    });

    return vehicle;
  }

  async delete(id, userId) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    // Delete images from Cloudinary
    if (vehicle.images?.length > 0) {
      const deletePromises = vehicle.images
        .filter((img) => img.publicId)
        .map((img) => cloudinary.uploader.destroy(img.publicId));
      await Promise.allSettled(deletePromises);
    }

    await vehicleRepository.delete(id);

    await activityLogRepository.create({
      userId,
      action: 'vehicle.delete',
      resourceType: 'vehicle',
      resourceId: id,
      description: `Deleted vehicle: ${vehicle.name}`,
    });
  }

  async getAll(query) {
    const { vehicleType, category, minCapacity, maxRate, isAvailable, page, limit, sort } = query;

    const filter = {};
    if (vehicleType) filter.vehicleType = vehicleType;
    if (category) filter.category = category;
    if (minCapacity) filter.seatingCapacity = { $gte: parseInt(minCapacity, 10) };
    if (maxRate) filter.rate = { $lte: parseFloat(maxRate) };
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const pagination = paginate(page, limit);

    const { vehicles, total } = await vehicleRepository.findAll(filter, {
      skip: pagination.skip,
      limit: pagination.limit,
      sort: sort || '-createdAt',
    });

    return {
      vehicles,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getAvailable(filter = {}) {
    return vehicleRepository.findAvailable(filter);
  }

  async addImages(id, files, userId) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const images = files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    vehicle.images.push(...images);
    await vehicle.save();

    await activityLogRepository.create({
      userId,
      action: 'vehicle.images_added',
      resourceType: 'vehicle',
      resourceId: id,
      description: `Added ${files.length} images to ${vehicle.name}`,
    });

    return vehicle;
  }

  async removeImage(vehicleId, imageId, userId) {
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const image = vehicle.images.id(imageId);
    if (!image) {
      throw new NotFoundError('Image not found');
    }

    // Delete from Cloudinary
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    vehicle.images.pull(imageId);
    await vehicle.save();

    return vehicle;
  }

  async getCategories(vehicleType) {
    return vehicleRepository.getDistinctCategories(vehicleType);
  }
}

module.exports = new VehicleService();
