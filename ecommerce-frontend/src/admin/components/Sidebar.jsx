import { NavLink } from "react-router-dom";
import { useAdminUI } from "../context/AdminUIContext";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Tags,
  Star,
  RotateCcw,
  Ticket,
  ChevronRight,
  Settings,
  DollarSign,
  Image as ImageIcon,
  HelpCircle
} from "lucide-react";

export default function Sidebar() {
  const { setSidebarOpen } = useAdminUI();
  const { logout } = useAuth();

  const menu = [
    { name: "Tableau de bord", path: "/admin", icon: LayoutDashboard },
    { name: "Revenus", path: "/admin/revenue", icon: DollarSign },
    { name: "Produits", path: "/admin/products", icon: Package },
    { name: "Catégories", path: "/admin/categories", icon: Tags },

    { name: "Commandes", path: "/admin/orders", icon: ShoppingCart },
    { name: "Retours / SAV", path: "/admin/returns", icon: RotateCcw },
    { name: "Utilisateurs", path: "/admin/users", icon: Users },
    { name: "Coupons & Offres", path: "/admin/coupons", icon: Ticket },
    { name: "Bannières (Hero)", path: "/admin/banners", icon: ImageIcon },
    { name: "Aide / FAQ", path: "/admin/faq", icon: HelpCircle },
    { name: "Paramètres", path: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-72 bg-black text-white h-full flex flex-col border-r border-gray-900">
      {/* HEADER */}
      <div className="px-8 py-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-extrabold text-xl">
          TF
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            TFExpress
          </h1>
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mt-0.5">
            Administration
          </span>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-4">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                ? "bg-white/10 text-white shadow-inner"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={`transition-colors ${isActive ? "text-yellow-400" : "text-gray-500 group-hover:text-white"
                    }`}
                />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight size={16} className="text-yellow-400 animate-in slide-in-from-left-1" />
                )}
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-400 rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
        <div className="pt-4 mt-2 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl w-full transition-colors"
            aria-label="Se déconnecter"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </nav>
    </aside>
  );
}
