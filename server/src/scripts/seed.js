require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const PaymentLog = require('../models/PaymentLog');
const ActivityLog = require('../models/ActivityLog');
const Session = require('../models/Session');

const generateBookingId = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRV-${new Date().getFullYear()}-${random}`;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    await PaymentLog.deleteMany({});
    await ActivityLog.deleteMany({});
    await Session.deleteMany({});

    // Create superadmin
    const superadmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@annasagartravels.com',
      phone: '9999999999',
      password: 'Admin@12345',
      role: 'superadmin',
    });
    console.log('Superadmin created:', superadmin.email);

    // Create staff
    await User.create({
      name: 'Staff Member',
      email: 'staff@annasagartravels.com',
      phone: '9999999998',
      password: 'Staff@12345',
      role: 'staff',
    });
    console.log('Staff user created');

    // Create test customer
    await User.create({
      name: 'Test Customer',
      email: 'customer@annasagartravels.com',
      phone: '9876543210',
      password: 'Customer@12345',
      role: 'customer',
    });
    console.log('Test customer created');

    // Seed vehicles
    const vehicles = [
      // Cars
      {
        name: 'Swift Dzire',
        vehicleType: 'car',
        category: 'sedan',
        pricingType: 'perKm',
        rate: 12,
        minimumFare: 500,
        seatingCapacity: 4,
        fuelType: 'petrol',
        amenities: ['AC', 'Music System'],
        description: 'Comfortable sedan for city and outstation travel',
        isAvailable: true,
      },
      {
        name: 'Toyota Innova Crysta',
        vehicleType: 'car',
        category: 'suv',
        pricingType: 'perKm',
        rate: 18,
        minimumFare: 1000,
        seatingCapacity: 7,
        fuelType: 'diesel',
        amenities: ['AC', 'Music System', 'USB Charging', 'Spacious Boot'],
        description: 'Premium SUV for family trips',
        isAvailable: true,
      },
      {
        name: 'Hyundai Creta',
        vehicleType: 'car',
        category: 'suv',
        pricingType: 'perKm',
        rate: 15,
        minimumFare: 800,
        seatingCapacity: 5,
        fuelType: 'diesel',
        amenities: ['AC', 'Music System', 'Sunroof'],
        description: 'Compact SUV for comfortable travel',
        isAvailable: true,
      },
      {
        name: 'Toyota Fortuner',
        vehicleType: 'car',
        category: 'luxury',
        pricingType: 'perKm',
        rate: 25,
        minimumFare: 2000,
        seatingCapacity: 7,
        fuelType: 'diesel',
        amenities: ['AC', 'Music System', 'Leather Seats', 'GPS Navigation', 'Rear AC'],
        description: 'Luxury SUV for premium travel experience',
        isAvailable: true,
      },
      {
        name: 'Maruti Alto',
        vehicleType: 'car',
        category: 'hatchback',
        pricingType: 'perKm',
        rate: 9,
        minimumFare: 300,
        seatingCapacity: 4,
        fuelType: 'petrol',
        amenities: ['AC', 'Music System'],
        description: 'Budget-friendly hatchback for short trips',
        isAvailable: true,
      },
      // Buses
      {
        name: 'Mini Bus (18 Seater)',
        vehicleType: 'bus',
        category: 'mini',
        pricingType: 'perKm',
        rate: 30,
        minimumFare: 3000,
        seatingCapacity: 18,
        fuelType: 'diesel',
        amenities: ['AC', 'Music System', 'Mic'],
        description: 'Mini bus for small group events',
        isAvailable: true,
      },
      {
        name: 'Standard Bus (35 Seater)',
        vehicleType: 'bus',
        category: 'standard',
        pricingType: 'perKm',
        rate: 45,
        minimumFare: 5000,
        seatingCapacity: 35,
        fuelType: 'diesel',
        amenities: ['AC', 'Music System', 'Mic', 'Curtains', 'First Aid'],
        description: 'Standard bus for medium-sized groups',
        isAvailable: true,
      },
      {
        name: 'Luxury Bus (45 Seater)',
        vehicleType: 'bus',
        category: 'luxury',
        pricingType: 'perKm',
        rate: 65,
        minimumFare: 8000,
        seatingCapacity: 45,
        fuelType: 'diesel',
        amenities: ['AC', 'Music System', 'Mic', 'Reclining Seats', 'Curtains', 'WiFi', 'TV', 'First Aid'],
        description: 'Luxury bus for premium group travel',
        isAvailable: true,
      },
      {
        name: 'Tempo Traveller (12 Seater)',
        vehicleType: 'bus',
        category: 'mini',
        pricingType: 'perKm',
        rate: 22,
        minimumFare: 2500,
        seatingCapacity: 12,
        fuelType: 'diesel',
        amenities: ['AC', 'Music System', 'Push-back Seats'],
        description: 'Tempo Traveller for small group outings',
        isAvailable: true,
      },
      {
        name: 'Sleeper Bus (30 Seater)',
        vehicleType: 'bus',
        category: 'sleeper',
        pricingType: 'perKm',
        rate: 55,
        minimumFare: 7000,
        seatingCapacity: 30,
        fuelType: 'diesel',
        amenities: ['AC', 'Sleeper Berths', 'Blankets', 'Reading Light', 'Charging Points'],
        description: 'Sleeper bus for overnight long-distance travel',
        isAvailable: true,
      },
    ];

    await Vehicle.insertMany(vehicles);
    console.log(`${vehicles.length} vehicles seeded`);

    // ====== SEED BOOKINGS ======
    const customer = await User.findOne({ email: 'customer@annasagartravels.com' });
    const testVehicle = await Vehicle.findOne({ name: 'Swift Dzire' });
    
    const bookings = [
      {
        bookingId: generateBookingId(),
        vehicleId: testVehicle._id,
        userId: customer._id,
        vehicleSnapshot: {
          name: testVehicle.name,
          vehicleType: testVehicle.vehicleType,
          category: testVehicle.category,
          seatingCapacity: testVehicle.seatingCapacity,
          rate: testVehicle.rate,
          pricingType: testVehicle.pricingType,
        },
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        trip: {
          pickupLocation: 'Mumbai Central Station',
          dropLocation: 'Mumbai Airport',
          distance: 25,
        },
        schedule: {
          startDateTime: new Date(Date.now() + 86400000), // Tomorrow
          endDateTime: new Date(Date.now() + 86400000 + 3600000), // 1 hour later
        },
        pricing: {
          baseFare: 300,
          taxes: 54,
          discount: 0,
          finalAmount: 354,
        },
        payment: {
          status: 'paid',
          razorpayOrderId: 'order_' + uuidv4().slice(0, 12),
          razorpayPaymentId: 'pay_' + uuidv4().slice(0, 12),
        },
        status: 'confirmed',
        notes: 'Please provide AC and comfortable ride',
      },
      {
        bookingId: generateBookingId(),
        vehicleId: testVehicle._id,
        userId: customer._id,
        vehicleSnapshot: {
          name: testVehicle.name,
          vehicleType: testVehicle.vehicleType,
          category: testVehicle.category,
          seatingCapacity: testVehicle.seatingCapacity,
          rate: testVehicle.rate,
          pricingType: testVehicle.pricingType,
        },
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        trip: {
          pickupLocation: 'Bandra West',
          dropLocation: 'Worli Sea Face',
          distance: 8,
        },
        schedule: {
          startDateTime: new Date(Date.now() + 172800000), // Day after tomorrow
          endDateTime: new Date(Date.now() + 172800000 + 1800000), // 30 min later
        },
        pricing: {
          baseFare: 96,
          taxes: 17,
          discount: 0,
          finalAmount: 113,
        },
        payment: {
          status: 'pending',
        },
        status: 'pending',
      },
    ];

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`${createdBookings.length} bookings seeded`);

    // ====== SEED PAYMENT LOGS ======
    const paymentLogs = [
      {
        bookingId: createdBookings[0]._id,
        event: 'order_created',
        razorpayOrderId: 'order_' + uuidv4().slice(0, 12),
        amount: 354,
        status: 'initiated',
        rawPayload: { notes: 'Test payment initiation' },
      },
      {
        bookingId: createdBookings[0]._id,
        event: 'payment_captured',
        razorpayOrderId: 'order_' + uuidv4().slice(0, 12),
        razorpayPaymentId: 'pay_' + uuidv4().slice(0, 12),
        amount: 354,
        status: 'successful',
        rawPayload: { method: 'netbanking', bank: 'HDFC', },
      },
      {
        bookingId: createdBookings[1]._id,
        event: 'order_created',
        razorpayOrderId: 'order_' + uuidv4().slice(0, 12),
        amount: 113,
        status: 'initiated',
        rawPayload: { notes: 'Test payment initiation' },
      },
    ];

    await PaymentLog.insertMany(paymentLogs);
    console.log(`${paymentLogs.length} payment logs seeded`);

    // ====== SEED ACTIVITY LOGS ======
    const superadminUser = await User.findOne({ role: 'superadmin' });
    
    const activityLogs = [
      {
        userId: customer._id,
        action: 'login',
        resourceType: 'user',
        resourceId: customer._id,
        description: `User ${customer.name} logged in`,
        metadata: { method: 'email_password' },
        ipAddress: '192.168.1.100',
      },
      {
        userId: customer._id,
        action: 'booking_created',
        resourceType: 'booking',
        resourceId: createdBookings[0]._id,
        description: `Booking ${createdBookings[0].bookingId} created for vehicle ${testVehicle.name}`,
        metadata: { vehicle: testVehicle._id, tripDistance: 25 },
        ipAddress: '192.168.1.100',
      },
      {
        userId: customer._id,
        action: 'payment_completed',
        resourceType: 'payment',
        resourceId: createdBookings[0]._id,
        description: `Payment of ₹354 completed for booking ${createdBookings[0].bookingId}`,
        metadata: { amount: 354, method: 'razorpay' },
        ipAddress: '192.168.1.100',
      },
      {
        userId: superadminUser._id,
        action: 'vehicle_created',
        resourceType: 'vehicle',
        resourceId: testVehicle._id,
        description: `Vehicle ${testVehicle.name} added to platform`,
        metadata: { category: testVehicle.category, capacity: testVehicle.seatingCapacity },
        ipAddress: '192.168.1.101',
      },
    ];

    await ActivityLog.insertMany(activityLogs);
    console.log(`${activityLogs.length} activity logs seeded`);

    // ====== SEED SESSIONS ======
    const sessions = [
      {
        userId: customer._id,
        refreshToken: 'refresh_token_' + uuidv4(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.100',
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    ];

    await Session.insertMany(sessions);
    console.log(`${sessions.length} sessions seeded`);

    console.log('\n✅ Full Seed completed successfully!');
    console.log('\n📊 Data Summary:');
    console.log(`   • Users: 3 (1 superadmin, 1 staff, 1 customer)`);
    console.log(`   • Vehicles: ${vehicles.length}`);
    console.log(`   • Bookings: ${createdBookings.length}`);
    console.log(`   • Payment Logs: ${paymentLogs.length}`);
    console.log(`   • Activity Logs: ${activityLogs.length}`);
    console.log(`   • Sessions: ${sessions.length}`);
    console.log('\n🔐 Login credentials:');
    console.log('   • Superadmin: superadmin@annasagartravels.com / Admin@12345');
    console.log('   • Staff: staff@annasagartravels.com / Staff@12345');
    console.log('   • Customer: customer@annasagartravels.com / Customer@12345');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
