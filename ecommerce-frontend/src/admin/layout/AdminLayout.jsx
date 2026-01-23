import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAdminUI } from "../context/AdminUIContext";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function AdminLayout() {
  const { sidebarOpen, setSidebarOpen } = useAdminUI();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return null; // Prevent flash while redirecting

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR DESKTOP */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* SIDEBAR MOBILE */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 bg-gray-100 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
