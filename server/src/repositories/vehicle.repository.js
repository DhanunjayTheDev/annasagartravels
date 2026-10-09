const Vehicle = require('../models/Vehicle');

class VehicleRepository {
  async create(data) {
    return Vehicle.create(data);
  }

  async findById(id) {
    return Vehicle.findById(id);
  }

  async update(id, data) {
    return Vehicle.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return Vehicle.findByIdAndDelete(id);
  }

  async findAll(filter = {}, { skip = 0, limit = 20, sort = '-createdAt' } = {}) {
    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).sort(sort).skip(skip).limit(limit),
      Vehicle.countDocuments(filter),
    ]);
    return { vehicles, total };
  }

  async findAvailable(filter = {}) {
    return Vehicle.find({ ...filter, isAvailable: true });
  }

  async setAvailability(id, isAvailable) {
    return Vehicle.findByIdAndUpdate(id, { isAvailable }, { new: true });
  }

  async getDistinctCategories(vehicleType) {
    const filter = vehicleType ? { vehicleType } : {};
    return Vehicle.distinct('category', filter);
  }
}

module.exports = new VehicleRepository();
