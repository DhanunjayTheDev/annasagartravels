export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin' | 'superadmin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Vehicle {
  _id: string;
  name: string;
  vehicleType: 'car' | 'bus';
  category: string;
  pricingType: 'perKm' | 'perHour' | 'fixed';
  rate: number;
  minimumFare: number;
  seatingCapacity: number;
  fuelType: string;
  amenities: string[];
  images: { url: string; publicId?: string; _id: string }[];
  registrationNumber?: string;
  isAvailable: boolean;
  description?: string;
  createdAt: string;
}

export interface Booking {
  _id: string;
  bookingId: string;
  vehicleId: Vehicle | string;
  userId?: string;
  vehicleSnapshot: {
    name: string;
    vehicleType: string;
    category: string;
    pricingType: string;
    rate: number;
    seatingCapacity: number;
    registrationNumber?: string;
  };
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  trip: {
    pickupLocation: string;
    dropLocation: string;
    distance?: number;
    duration?: number;
    tripType: 'oneWay' | 'roundTrip' | 'hourly' | 'multiDay';
  };
  schedule: {
    startDateTime: string;
    endDateTime: string;
  };
  pricing: {
    baseFare: number;
    taxes: number;
    extraCharges: number;
    discount: number;
    couponCode?: string;
    finalAmount: number;
  };
  payment: {
    status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    method?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    transactionId?: string;
    paidAt?: string;
  };
  status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
  error?: { code: string; stack?: string };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
  keyId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  monthRevenue: number;
  statusBreakdown: Record<string, number>;
}

export interface BookingFormData {
  vehicleId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  trip: {
    pickupLocation: string;
    dropLocation: string;
    distance?: number;
    duration?: number;
    tripType: string;
  };
  schedule: {
    startDateTime: string;
    endDateTime: string;
  };
  paymentMethod?: string;
  notes?: string;
}
