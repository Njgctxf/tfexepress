import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import { useAdminUI } from "../context/AdminUIContext";

export default function AdminLayout() {
  const { sidebarOpen } = useAdminUI();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR DESKTOP */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* SIDEBAR MOBILE */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-50 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
