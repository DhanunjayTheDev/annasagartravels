import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AdminGuard() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!['admin', 'superadmin', 'staff'].includes(user.role)) return <Navigate to="/login" replace />;

  return <Outlet />;
}
