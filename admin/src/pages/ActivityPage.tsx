import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';

interface Log {
  _id: string;
  userId?: { name: string; email: string };
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/admin/activity-logs?page=${page}&limit=30`);
        setLogs(data.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  const actionColors: Record<string, { bg: string; text: string; dot: string }> = {
    create: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    register: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    delete: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
    cancel: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
    update: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
    change: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  };

  const getActionColor = (action: string) => {
    for (const [key, val] of Object.entries(actionColors)) {
      if (action.includes(key)) return val;
    }
    return { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' };
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Track all system activity and changes</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Time</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Action</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Resource</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Description</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded-lg animate-pulse" /></td></tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No activity logs</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const colors = getActionColor(log.action);
                  return (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="px-6 py-4">
                        {log.userId ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-[10px] font-semibold">{getInitials(log.userId.name)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-xs">{log.userId.name}</p>
                              <p className="text-[10px] text-gray-400">{log.userId.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">System</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs capitalize text-gray-600">{log.resourceType}</span>
                        <p className="font-mono text-[10px] text-gray-400 mt-0.5">{log.resourceId}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">{log.description}</td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">{log.ipAddress}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={logs.length < 30}
            className="flex items-center gap-1 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
