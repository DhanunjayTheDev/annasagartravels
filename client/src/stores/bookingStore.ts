import { create } from 'zustand';
import api from '../lib/api';
import type { Booking, Pagination, BookingFormData, PaymentOrder } from '../types';
import { generateIdempotencyKey } from '../lib/utils';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  createBooking: (data: BookingFormData) => Promise<Booking>;
  fetchMyBookings: (params?: Record<string, string>) => Promise<void>;
  fetchBooking: (id: string) => Promise<void>;
  createPaymentOrder: (bookingId: string) => Promise<PaymentOrder>;
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => Promise<void>;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  currentBooking: null,
  pagination: null,
  isLoading: false,
  error: null,

  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/bookings', bookingData, {
        headers: { 'Idempotency-Key': generateIdempotencyKey() },
      });
      set({ currentBooking: data.data });
      return data.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create booking';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyBookings: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/bookings/my', { params });
      set({ bookings: data.data, pagination: data.pagination });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch bookings' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/bookings/${id}`);
      set({ currentBooking: data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch booking' });
    } finally {
      set({ isLoading: false });
    }
  },

  createPaymentOrder: async (bookingId) => {
    const { data } = await api.post(`/payments/${bookingId}/order`);
    return data.data;
  },

  verifyPayment: async (paymentData) => {
    await api.post('/payments/verify', paymentData);
  },

  clearError: () => set({ error: null }),
}));
