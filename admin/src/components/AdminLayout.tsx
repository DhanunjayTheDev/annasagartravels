import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Sidebar />
      <main className="lg:ml-[280px] p-4 pt-20 lg:pt-8 lg:p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
