const PaymentLog = require('../models/PaymentLog');

class PaymentLogRepository {
  async create(data) {
    return PaymentLog.create(data);
  }

  async findByBookingId(bookingId) {
    return PaymentLog.find({ bookingId }).sort('-createdAt');
  }

  async findAll(filter = {}, { skip = 0, limit = 50, sort = '-createdAt' } = {}) {
    const [logs, total] = await Promise.all([
      PaymentLog.find(filter).sort(sort).skip(skip).limit(limit),
      PaymentLog.countDocuments(filter),
    ]);
    return { logs, total };
  }
}

module.exports = new PaymentLogRepository();
