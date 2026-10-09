# Seed Data Documentation

This document describes all the seed data that is populated when running `npm run seed` in the `/server` directory.

## Overview

The seed script populates all 6 database models with realistic test data:

```
Users (3)
├── 1 Superadmin
├── 1 Staff
└── 1 Customer

Vehicles (10)
├── 5 Cars (Sedan, SUV, Hatchback, Luxury)
└── 5 Buses (Mini, Standard, Luxury, Sleeper, Tempo Traveller)

Bookings (2)
├── 1 Confirmed Booking (Paid)
└── 1 Pending Booking (Unpaid)

Payment Logs (3)
├── 1 Order created for Booking 1
├── 1 Payment captured for Booking 1
└── 1 Order created for Booking 2

Activity Logs (4)
├── 1 User login
├── 1 Booking creation
├── 1 Payment completion
└── 1 Vehicle creation

Sessions (1)
└── 1 Active session for Customer
```

---

## Seeded Data Details

### 1. Users

#### Superadmin
- **Email:** superadmin@annasagartravels.com
- **Password:** Admin@12345
- **Phone:** 9999999999
- **Role:** superadmin
- **Description:** Full platform access, user management, analytics

#### Staff
- **Email:** staff@annasagartravels.com
- **Password:** Staff@12345
- **Phone:** 9999999998
- **Role:** staff
- **Description:** Vehicle management, booking management

#### Customer
- **Email:** customer@annasagartravels.com
- **Password:** Customer@12345
- **Phone:** 9876543210
- **Role:** customer
- **Description:** Can make bookings, view history, manage profile

---

### 2. Vehicles

#### Cars (5)
1. **Swift Dzire** - Sedan
   - Seating: 4 | Rate: ₹12/km | Min Fare: ₹500
   - Fuel: Petrol | Amenities: AC, Music System

2. **Toyota Innova Crysta** - SUV
   - Seating: 7 | Rate: ₹18/km | Min Fare: ₹1000
   - Fuel: Diesel | Amenities: AC, Music, USB Charging, Spacious Boot

3. **Hyundai Creta** - SUV
   - Seating: 5 | Rate: ₹15/km | Min Fare: ₹800
   - Fuel: Diesel | Amenities: AC, Music, Sunroof

4. **Toyota Fortuner** - Luxury
   - Seating: 7 | Rate: ₹25/km | Min Fare: ₹2000
   - Fuel: Diesel | Amenities: AC, Music, Leather Seats, GPS, Rear AC

5. **Maruti Alto** - Hatchback
   - Seating: 4 | Rate: ₹9/km | Min Fare: ₹300
   - Fuel: Petrol | Amenities: AC, Music System

#### Buses (5)
1. **Mini Bus (18 Seater)** - Mini
   - Rate: ₹30/km | Min Fare: ₹3000
   - Fuel: Diesel | Amenities: AC, Music, Mic

2. **Standard Bus (35 Seater)** - Standard
   - Rate: ₹45/km | Min Fare: ₹5000
   - Fuel: Diesel | Amenities: AC, Music, Mic, Curtains, First Aid

3. **Luxury Bus (45 Seater)** - Luxury
   - Rate: ₹65/km | Min Fare: ₹8000
   - Fuel: Diesel | Amenities: AC, Music, Reclining Seats, Curtains, WiFi, TV, First Aid

4. **Tempo Traveller (12 Seater)** - Mini
   - Rate: ₹22/km | Min Fare: ₹2500
   - Fuel: Diesel | Amenities: AC, Music, Push-back Seats

5. **Sleeper Bus (30 Seater)** - Sleeper
   - Rate: ₹55/km | Min Fare: ₹7000
   - Fuel: Diesel | Amenities: AC, Sleeper Berths, Blankets, Reading Light, Charging Points

---

### 3. Bookings

#### Booking 1 - CONFIRMED (PAID)
- **Booking ID:** TRV-YYYY-XXXX (auto-generated)
- **Vehicle:** Swift Dzire
- **Customer:** Test Customer
- **Route:** Mumbai Central Station → Mumbai Airport
- **Distance:** 25 km
- **Date:** Tomorrow (UTC)
- **Duration:** 1 hour
- **Pricing:**
  - Base Fare: ₹300
  - Taxes: ₹54
  - Discount: ₹0
  - **Total: ₹354**
- **Payment Status:** Paid
- **Booking Status:** Confirmed
- **Notes:** Please provide AC and comfortable ride

#### Booking 2 - PENDING (UNPAID)
- **Booking ID:** TRV-YYYY-XXXX (auto-generated)
- **Vehicle:** Swift Dzire
- **Customer:** Test Customer
- **Route:** Bandra West → Worli Sea Face
- **Distance:** 8 km
- **Date:** Day after tomorrow
- **Duration:** 30 minutes
- **Pricing:**
  - Base Fare: ₹96
  - Taxes: ₹17
  - Discount: ₹0
  - **Total: ₹113**
- **Payment Status:** Unpaid
- **Booking Status:** Pending

---

### 4. Payment Logs

#### Log 1: Order Created
- Event: order_created
- Booking: Booking 1
- Amount: ₹354
- Status: initiated

#### Log 2: Payment Captured
- Event: payment_captured
- Booking: Booking 1
- Amount: ₹354
- Status: successful
- Method: Netbanking (HDFC)

#### Log 3: Order Created
- Event: order_created
- Booking: Booking 2
- Amount: ₹113
- Status: initiated

---

### 5. Activity Logs

| # | User | Action | Resource | Details |
|---|------|--------|----------|---------|
| 1 | Customer | login | user | User logged in via email/password |
| 2 | Customer | booking_created | booking | Booking for Swift Dzire created (25 km trip) |
| 3 | Customer | payment_completed | payment | Payment of ₹354 processed via Razorpay |
| 4 | Superadmin | vehicle_created | vehicle | Swift Dzire vehicle added to platform |

**Timestamps:** All logs created at seed time  
**IP Address:** Simulated IPs (192.168.1.100, 192.168.1.101)

---

### 6. Sessions

#### Session 1
- **User:** Test Customer
- **Status:** Active
- **Expiry:** 7 days from seed time
- **Device:** Browser (Windows, Chrome)
- **IP Address:** 192.168.1.100
- **User Agent:** Full browser string for realistic tracking

---

## How to Run Seed

```bash
# Navigate to server directory
cd server

# Ensure .env is configured with MongoDB URI
cat .env

# Run seed script
npm run seed
```

### Output Example
```
Connected to MongoDB
Superadmin created: superadmin@annasagartravels.com
Staff user created
Test customer created
10 vehicles seeded

✅ Full Seed completed successfully!

📊 Data Summary:
   • Users: 3 (1 superadmin, 1 staff, 1 customer)
   • Vehicles: 10
   • Bookings: 2
   • Payment Logs: 3
   • Activity Logs: 4
   • Sessions: 1

🔐 Login credentials:
   • Superadmin: superadmin@annasagartravels.com / Admin@12345
   • Staff: staff@annasagartravels.com / Staff@12345
   • Customer: customer@annasagartravels.com / Customer@12345
```

---

## Resetting & Re-seeding

To clear all data and re-seed:

```bash
# The seed script automatically clears all collections
npm run seed

# Or manually reset MongoDB
mongo <database_name>
db.users.deleteMany({})
db.vehicles.deleteMany({})
db.bookings.deleteMany({})
db.paymentlogs.deleteMany({})
db.activitylogs.deleteMany({})
db.sessions.deleteMany({})
```

---

## Testing Scenarios

### Scenario 1: Test Booking Flow
1. Login as Customer
2. View Booking 1 (Confirmed)
3. Check PaymentLog for successful payment
4. Verify ActivityLog shows booking_created and payment_completed

### Scenario 2: Admin Analytics
1. Login as Superadmin
2. Go to Dashboard
3. View stats (₹354 revenue, 2 bookings)
4. Check Activity Log for all 4 events

### Scenario 3: Pending Booking
1. Login as Customer
2. View Booking 2 (Pending)
3. Proceed to payment
4. Test Razorpay integration

---

## Notes

- ✅ All passwords are hashed using bcryptjs
- ✅ UUIDs used for payment transaction IDs
- ✅ Booking IDs follow format: TRV-YYYY-NNNN
- ✅ Timestamps are realistic (future bookings)
- ✅ Prices include GST calculations (18%)
- ✅ All foreign key references are valid
- ✅ Session expires in 7 days (JWT refresh token expiry)
