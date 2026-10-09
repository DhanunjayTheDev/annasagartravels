const ActivityLog = require('../models/ActivityLog');

class ActivityLogRepository {
  async create(data) {
    return ActivityLog.create(data);
  }

  async findAll(filter = {}, { skip = 0, limit = 50, sort = '-createdAt' } = {}) {
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('userId', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(filter),
    ]);
    return { logs, total };
  }

  async findByUser(userId, { skip = 0, limit = 50 } = {}) {
    return this.findAll({ userId }, { skip, limit });
  }

  async findByResource(resourceType, resourceId) {
    return this.findAll({ resourceType, resourceId });
  }
}

module.exports = new ActivityLogRepository();
