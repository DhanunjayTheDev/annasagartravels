const mongoose = require('mongoose');
const BookingService = require('../src/services/booking.service');
const Vehicle = require('../src/models/Vehicle');
const User = require('../src/models/User');
const Booking = require('../src/models/Booking');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/annasagar_test';

describe('BookingService', () => {
  let testUser;
  let testVehicle;

  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
    await User.deleteMany({});
    await Vehicle.deleteMany({});

    testUser = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '9876543210',
      password: 'hashedpassword123',
    });

    testVehicle = await Vehicle.create({
      name: 'Test Car',
      vehicleType: 'car',
      category: 'sedan',
      seatingCapacity: 4,
      rate: 12,
      pricingType: 'per_km',
      minimumFare: 500,
      fuelType: 'diesel',
      registrationNumber: 'RJ-14-AB-1234',
    });
  });

  describe('createBooking', () => {
    it('should create a booking with correct pricing', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const booking = await BookingService.createBooking(
        {
          vehicleId: testVehicle._id.toString(),
          customer: { name: 'John', phone: '9876543210' },
          trip: {
            pickupLocation: 'Ajmer',
            dropLocation: 'Jaipur',
            distance: 130,
            tripType: 'one_way',
          },
          schedule: {
            startDateTime: tomorrow.toISOString(),
            endDateTime: dayAfter.toISOString(),
          },
        },
        testUser._id.toString()
      );

      expect(booking).toBeDefined();
      expect(booking.bookingId).toMatch(/^TRV-/);
      expect(booking.status).toBe('pending');
      expect(booking.pricing.baseFare).toBeGreaterThan(0);
      expect(booking.vehicleSnapshot.name).toBe('Test Car');
    });

    it('should detect overlapping bookings', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const bookingData = {
        vehicleId: testVehicle._id.toString(),
        customer: { name: 'John', phone: '9876543210' },
        trip: {
          pickupLocation: 'Ajmer',
          dropLocation: 'Jaipur',
          distance: 130,
          tripType: 'one_way',
        },
        schedule: {
          startDateTime: tomorrow.toISOString(),
          endDateTime: dayAfter.toISOString(),
        },
      };

      await BookingService.createBooking(bookingData, testUser._id.toString());

      await expect(
        BookingService.createBooking(bookingData, testUser._id.toString())
      ).rejects.toThrow();
    });
  });
});
