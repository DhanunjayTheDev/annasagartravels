import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Eye, X, CalendarCheck, MapPin, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Booking {
  _id: string;
  bookingId: string;
  customer: { name: string; phone: string; email?: string };
  vehicleSnapshot: { name: string; vehicleType: string };
  trip: { pickupLocation: string; dropLocation: string };
  schedule: { startDateTime: string; endDateTime: string };
  pricing: { finalAmount: number };
  payment: { status: string };
  status: string;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  completed: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  unpaid: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [filter, setFilter] = useState({ status: '', page: 1 });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(filter.page), limit: '20' });
      if (filter.status) params.set('status', filter.status);
      const { data } = await api.get(`/admin/bookings?${params}`);
      setBookings(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
      setSelected(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getColors = (status: string) => statusColors[status] || statusColors.pending;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all customer bookings</p>
        </div>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value, page: 1 })}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Booking ID</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Route</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Payment</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded-lg animate-pulse" /></td></tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No bookings found</p>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const sc = getColors(b.status);
                  const pc = getColors(b.payment.status);
                  return (
                    <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">{b.bookingId}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{b.customer.name}</p>
                        <p className="text-xs text-gray-400">{b.customer.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{b.vehicleSnapshot.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[80px]">{b.trip.pickupLocation}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[80px]">{b.trip.dropLocation}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{formatDateTime(b.schedule.startDateTime)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(b.pricing.finalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${pc.bg} ${pc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                          {b.payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelected(b)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6">
              <div>
                <h2 className="font-semibold text-gray-900">Booking Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selected.bookingId}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="px-6 pb-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <p className="font-medium text-gray-900">{selected.customer.name}</p>
                  <p className="text-xs text-gray-500">{selected.customer.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                  <p className="font-medium text-gray-900">{selected.vehicleSnapshot.name}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Route</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-gray-900">{selected.trip.pickupLocation}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-900">{selected.trip.dropLocation}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Start</p>
                  <p className="font-medium text-gray-900 text-xs">{formatDateTime(selected.schedule.startDateTime)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">End</p>
                  <p className="font-medium text-gray-900 text-xs">{formatDateTime(selected.schedule.endDateTime)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Amount</p>
                  <p className="font-bold text-gray-900">{formatCurrency(selected.pricing.finalAmount)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Payment</p>
                  <p className="font-medium capitalize text-gray-900">{selected.payment.status}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="font-medium capitalize text-gray-900">{selected.status}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {selected.status === 'pending' && (
                  <button onClick={() => updateStatus(selected._id, 'confirmed')} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
                    <CheckCircle className="w-4 h-4" /> Confirm
                  </button>
                )}
                {['pending', 'confirmed'].includes(selected.status) && (
                  <button onClick={() => updateStatus(selected._id, 'cancelled')} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                )}
                {selected.status === 'confirmed' && (
                  <button onClick={() => updateStatus(selected._id, 'completed')} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
                    <Clock className="w-4 h-4" /> Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
