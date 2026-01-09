import { NavLink } from "react-router-dom";
import { useAdminUI } from "../context/AdminUIContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Tags,
  Star,
} from "lucide-react";

export default function Sidebar() {
  const { setSidebarOpen } = useAdminUI();

  const menu = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Produits", path: "/admin/products", icon: Package },
    { name: "Catégories", path: "/admin/categories", icon: Tags },
    {
      name: "Catégories vedettes",
      path: "/admin/featured-categories",
      icon: Star,
    },
    { name: "Commandes", path: "/admin/orders", icon: ShoppingCart },
    { name: "Utilisateurs", path: "/admin/users", icon: Users },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="px-6 py-5 text-xl font-bold border-b border-gray-800">
        TFExpress<span className="text-blue-500 ml-1">Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg w-full">
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
