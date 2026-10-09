const Session = require('../models/Session');

class SessionRepository {
  async create(data) {
    return Session.create(data);
  }

  async findByRefreshToken(refreshToken) {
    return Session.findOne({ refreshToken, isActive: true });
  }

  async findActiveByUserId(userId) {
    return Session.find({ userId, isActive: true }).sort('-createdAt');
  }

  async deactivate(id) {
    return Session.findByIdAndUpdate(id, { isActive: false });
  }

  async deactivateByRefreshToken(refreshToken) {
    return Session.findOneAndUpdate({ refreshToken }, { isActive: false });
  }

  async deactivateAllForUser(userId) {
    return Session.updateMany({ userId, isActive: true }, { isActive: false });
  }

  async deactivateById(sessionId) {
    return Session.findByIdAndUpdate(sessionId, { isActive: false });
  }

  async countActiveForUser(userId) {
    return Session.countDocuments({ userId, isActive: true });
  }
}

module.exports = new SessionRepository();
