const User = require('../models/User');

class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findById(id) {
    return User.findById(id);
  }

  async findByIdWithPassword(id) {
    return User.findById(id).select('+password');
  }

  async findByEmail(email) {
    return User.findOne({ email }).select('+password');
  }

  async findByPhone(phone) {
    return User.findOne({ phone });
  }

  async update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async findAll(filter = {}, { skip = 0, limit = 20, sort = '-createdAt' } = {}) {
    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return { users, total };
  }

  async deactivate(id) {
    return User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async activate(id) {
    return User.findByIdAndUpdate(id, { isActive: true }, { new: true });
  }
}

module.exports = new UserRepository();
