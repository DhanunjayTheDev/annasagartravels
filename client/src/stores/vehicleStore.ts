import { create } from 'zustand';
import api from '../lib/api';
import type { Vehicle, Pagination } from '../types';

interface VehicleState {
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  fetchVehicles: (params?: Record<string, string>) => Promise<void>;
  fetchVehicle: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: [],
  currentVehicle: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchVehicles: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/vehicles', { params });
      set({
        vehicles: data.data,
        pagination: data.pagination,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch vehicles' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchVehicle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/vehicles/${id}`);
      set({ currentVehicle: data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch vehicle' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
