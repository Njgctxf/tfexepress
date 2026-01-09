import { Menu, Bell, UserCircle } from "lucide-react";
import { useAdminUI } from "../context/AdminUIContext";

export default function Topbar() {
  const { setSidebarOpen } = useAdminUI();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* BURGER MOBILE */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <h1 className="text-lg font-semibold text-gray-800">
          TFExpress <span className="text-blue-600">Admin</span>
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5 text-gray-600" />
        <UserCircle className="w-7 h-7 text-gray-600" />
      </div>
    </header>
  );
}
