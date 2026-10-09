/**
 * Generates a human-readable booking ID
 * Format: TRV-YYYY-NNNN (e.g., TRV-2026-0001)
 */
const generateBookingId = async (BookingModel) => {
  const year = new Date().getFullYear();
  const prefix = `TRV-${year}-`;

  const lastBooking = await BookingModel.findOne(
    { bookingId: { $regex: `^${prefix}` } },
    { bookingId: 1 },
    { sort: { bookingId: -1 } }
  );

  let nextNum = 1;
  if (lastBooking) {
    const lastNum = parseInt(lastBooking.bookingId.split('-')[2], 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

/**
 * Wraps an async route handler to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Calculate distance-based fare
 */
const calculateFare = ({ rate, distance, duration, pricingType, minimumFare = 0 }) => {
  let baseFare;

  if (pricingType === 'perKm') {
    baseFare = rate * distance;
  } else if (pricingType === 'perHour') {
    const hours = duration / 60; // duration in minutes
    baseFare = rate * hours;
  } else {
    baseFare = rate;
  }

  // Apply minimum fare
  baseFare = Math.max(baseFare, minimumFare);

  return Math.round(baseFare * 100) / 100; // Round to 2 decimals
};

/**
 * Calculate GST
 */
const calculateTax = (amount, rate = 5) => {
  return Math.round(amount * (rate / 100) * 100) / 100;
};

/**
 * Sanitize user input object - remove undefined/null fields
 */
const sanitizeObject = (obj) => {
  const sanitized = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      sanitized[key] = obj[key];
    }
  });
  return sanitized;
};

/**
 * Paginate query results
 */
const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.min(100, Math.max(1, parseInt(limit, 10)));
  return {
    skip: (p - 1) * l,
    limit: l,
    page: p,
  };
};

module.exports = {
  generateBookingId,
  asyncHandler,
  calculateFare,
  calculateTax,
  sanitizeObject,
  paginate,
};
