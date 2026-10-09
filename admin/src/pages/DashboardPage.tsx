import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  IndianRupee, CalendarCheck, Car, Users, TrendingUp, ArrowUpRight,
} from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalVehicles: number;
  totalUsers: number;
  recentBookings: any[];
  monthlyStats: { pending: number; confirmed: number; completed: number; cancelled: number };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-card animate-pulse h-32" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: IndianRupee,
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: CalendarCheck,
      gradient: 'from-indigo-500 to-violet-600',
      bg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'Vehicles',
      value: stats?.totalVehicles || 0,
      icon: Car,
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
    confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    completed: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                <TrendingUp className="w-3 h-3" />
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Booking status breakdown */}
      {stats?.monthlyStats && (
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-5">Booking Status Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(stats.monthlyStats).map(([status, count]) => {
              const colors = statusColors[status] || statusColors.pending;
              return (
                <div key={status} className={`text-center p-5 ${colors.bg} rounded-xl`}>
                  <div className={`inline-block w-2 h-2 rounded-full ${colors.dot} mb-2`} />
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className={`text-sm font-medium capitalize ${colors.text}`}>{status}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
            <p className="text-sm text-gray-500 mt-0.5">Latest booking activity</p>
          </div>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100">
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Booking ID</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats?.recentBookings || []).map((b: any) => {
                const colors = statusColors[b.status] || statusColors.pending;
                return (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{b.bookingId}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{b.customer?.name}</td>
                    <td className="px-6 py-4 text-gray-600">{b.vehicleSnapshot?.name}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(b.pricing?.finalAmount || 0)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colors.bg} ${colors.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No bookings yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
