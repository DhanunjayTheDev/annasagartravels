import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, Calendar, IndianRupee, MapPin, Car, ArrowRight } from 'lucide-react';

interface Analytics {
  revenue: { total: number; monthly: { _id: string; revenue: number; count: number }[] };
  bookings: { total: number; byStatus: { _id: string; count: number }[] };
  vehicles: { total: number; byType: { _id: string; count: number }[] };
  topVehicles: { name: string; bookingCount: number; revenue: number }[];
  topRoutes: { _id: { pickup: string; drop: string }; count: number }[];
}

const statusColorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  completed: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-400' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res } = await api.get('/admin/analytics');
        setData(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business insights and performance metrics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-48 animate-pulse shadow-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Business insights and performance metrics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-50 rounded-xl"><IndianRupee className="h-5 w-5 text-emerald-600" /></div>
            <span className="text-sm text-gray-500">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data?.revenue.total || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-indigo-50 rounded-xl"><Calendar className="h-5 w-5 text-indigo-600" /></div>
            <span className="text-sm text-gray-500">Total Bookings</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.bookings.total || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-violet-50 rounded-xl"><TrendingUp className="h-5 w-5 text-violet-600" /></div>
            <span className="text-sm text-gray-500">Avg per Booking</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data?.bookings.total ? formatCurrency(Math.round((data.revenue.total || 0) / data.bookings.total)) : '₹0'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-900">Monthly Revenue</h2>
          </div>
          <div className="space-y-3">
            {(data?.revenue.monthly || []).slice(-12).map((m) => {
              const maxRev = Math.max(...(data?.revenue.monthly || []).map((x) => x.revenue), 1);
              return (
                <div key={m._id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 font-medium">{m._id}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all"
                      style={{ width: `${(m.revenue / maxRev) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-28 text-right">{formatCurrency(m.revenue)} <span className="text-gray-400">({m.count})</span></span>
                </div>
              );
            })}
            {(!data?.revenue.monthly || data.revenue.monthly.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
            )}
          </div>
        </div>

        {/* Bookings by Status */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Bookings by Status</h2>
          <div className="grid grid-cols-2 gap-4">
            {(data?.bookings.byStatus || []).map((s) => {
              const colors = statusColorMap[s._id] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' };
              return (
                <div key={s._id} className={`p-5 rounded-xl border ${colors.bg} ${colors.border}`}>
                  <div className={`inline-block w-2 h-2 rounded-full ${colors.dot} mb-2`} />
                  <p className="text-2xl font-bold text-gray-900">{s.count}</p>
                  <p className={`text-sm font-medium capitalize ${colors.text}`}>{s._id}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Vehicles */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Car className="h-5 w-5 text-violet-500" />
            <h2 className="font-semibold text-gray-900">Top Vehicles</h2>
          </div>
          <div className="space-y-1">
            {(data?.topVehicles || []).slice(0, 5).map((v, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{v.name}</p>
                    <p className="text-xs text-gray-400">{v.bookingCount} bookings</p>
                  </div>
                </div>
                <p className="font-semibold text-sm text-gray-900">{formatCurrency(v.revenue)}</p>
              </div>
            ))}
            {(!data?.topVehicles || data.topVehicles.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
            )}
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-5 w-5 text-emerald-500" />
            <h2 className="font-semibold text-gray-900">Popular Routes</h2>
          </div>
          <div className="space-y-1">
            {(data?.topRoutes || []).slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{r._id.pickup}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span>{r._id.drop}</span>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">{r.count} trips</span>
              </div>
            ))}
            {(!data?.topRoutes || data.topRoutes.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
