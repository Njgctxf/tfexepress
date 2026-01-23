import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Menu, Bell, User, Search, ChevronDown, Calendar, Settings, LogOut, Package, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useAdminUI } from "../context/AdminUIContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useAdminNotifications } from "../context/AdminNotificationsContext";

export default function Topbar() {
  const { setSidebarOpen, adminProfile } = useAdminUI();
  const { logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useAdminNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);
  const searchRef = useRef(null);

  // Helper for Icon/Color (duplicated from Notifications.jsx, could be util)
  const getIcon = (type) => {
    switch (type) {
      case 'order': return Package;
      case 'user': return User;
      case 'alert': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'order': return "bg-blue-50 text-blue-600";
      case 'user': return "bg-green-50 text-green-600";
      case 'alert': return "bg-orange-50 text-orange-600";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    setIsNotificationsOpen(false);

    if (notif.link) {
      navigate(notif.link);
    } else {
      switch (notif.type) {
        case "order": navigate("/admin/orders"); break;
        case "user": navigate("/admin/users"); break;
        case "alert": navigate("/admin/products"); break;
        default: navigate("/admin/notifications");
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef, notificationRef, searchRef]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setShowResults(true);

        try {
          const results = { products: [], users: [], orders: [] };

          // 1. Search Products
          const { data: products } = await supabase
            .from('products')
            .select('id, name, price, images')
            .ilike('name', `%${searchQuery}%`)
            .limit(3);
          if (products) results.products = products;

          // 2. Search Users
          const { data: users } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name')
            .or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
            .limit(5);
          if (users) results.users = users;

          // 3. Search Orders
          // Strategy: Match by Order ID OR by User ID (from found users)
          let foundOrders = [];

          // A. By User IDs (if any users found)
          if (users && users.length > 0) {
            const userIds = users.map(u => u.id);
            const { data: ordersByUser } = await supabase
              .from('orders')
              .select('id, total_amount, status, created_at, user_id')
              .in('user_id', userIds)
              .order('created_at', { ascending: false })
              .limit(3);

            if (ordersByUser) {
              // Manually attach user info to avoid complex joins failing
              const ordersWithUser = ordersByUser.map(o => ({
                ...o,
                profiles: users.find(u => u.id === o.user_id)
              }));
              foundOrders = [...foundOrders, ...ordersWithUser];
            }
          }

          // B. By exact Order ID match
          if (searchQuery.length > 4) {
            const { data: orderById } = await supabase
              .from('orders')
              .select('id, total_amount, status, created_at, user_id')
              .eq('id', searchQuery)
              .maybeSingle(); // Use maybeSingle to avoid error if 0 rows

            if (orderById) {
              // If we found an order by ID, we might need its user info too
              if (!foundOrders.some(o => o.id === orderById.id)) {
                // Fetch user for this specific order
                const { data: orderUser } = await supabase
                  .from('profiles')
                  .select('email, first_name, last_name')
                  .eq('id', orderById.user_id)
                  .single();

                foundOrders.push({
                  ...orderById,
                  profiles: orderUser || { email: "Inconnu" }
                });
              }
            }
          }

          results.orders = foundOrders;
          setSearchResults(results);

        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = (pathname) => {
    switch (true) {
      case pathname === "/admin": return "Tableau de bord";
      case pathname.includes("/products"): return "Produits";
      case pathname.includes("/categories"): return "Catégories";
      case pathname.includes("/orders"): return "Commandes & Ventes";
      case pathname.includes("/returns"): return "Retours & SAV";
      case pathname.includes("/users"): return "Utilisateurs";
      case pathname.includes("/coupons"): return "Coupons & Offres";
      case pathname.includes("/settings"): return "Paramètres";
      default: return "Administration";
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  // Format date: "Mardi 14 Octobre"
  // Format date: "Mardi 14 Octobre"
  // Capitalize first letter
  const dateStr = currentDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <header className="h-16 bg-gray-50/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-all duration-300">

      {/* LEFT: Burger & Title */}
      <div className="flex items-center gap-6">
        {/* BURGER MOBILE */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
          aria-label="Ouvrir le menu latéral"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight capitalize">
            {pageTitle}
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">
            <Calendar size={12} className="text-gray-400" />
            {formattedDate}
          </div>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-3 sm:gap-6">

        {/* Search */}
        {/* Search */}
        <div className="hidden md:flex flex-col relative" ref={searchRef}>
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-gray-300 transition-all w-80 shadow-sm hover:shadow-md">
            <Search size={18} className="text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.length >= 2) setShowResults(true); }}
              placeholder="Rechercher (Ctrl+K)..."
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-gray-700 placeholder-gray-400 font-medium"
            />
            <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 border border-gray-200">
              ⌘K
            </div>
            {isSearching && <div className="ml-2 w-4 h-4 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>}
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          {showResults && searchResults && (
            <div className="absolute top-full lg:left-0 right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2 z-50 max-h-[80vh] overflow-y-auto custom-scrollbar">

              {/* Products */}
              {searchResults.products?.length > 0 && (
                <div className="mb-2">
                  <h4 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Produits</h4>
                  {searchResults.products.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { navigate(`/admin/products/${p.id}`); setShowResults(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg group text-left"
                    >
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <Package size={14} className="text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.price?.toLocaleString()} FCFA</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Users */}
              {searchResults.users?.length > 0 && (
                <div className="mb-2">
                  <h4 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Utilisateurs</h4>
                  {searchResults.users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { navigate(`/admin/users`); setShowResults(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg group text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                        <User size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">{u.first_name || ""} {u.last_name || ""}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Orders */}
              {searchResults.orders?.length > 0 && (
                <div className="mb-2">
                  <h4 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Commandes</h4>
                  {searchResults.orders.map(o => (
                    <button
                      key={o.id}
                      onClick={() => { navigate(`/admin/orders`); setShowResults(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg group text-left"
                    >
                      <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center shrink-0 text-green-600">
                        <Package size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">CMD #{o.id.substring(0, 8)}...</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {o.total_amount?.toLocaleString()} FCFA • {o.profiles?.email || "Client inconnu"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!searchResults.products?.length && !searchResults.users?.length && !searchResults.orders?.length && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Aucun résultat trouvé pour "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4" ref={notificationRef}>
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative p-2.5 text-gray-500 hover:text-gray-900 transition-all group border border-transparent hover:border-gray-100 rounded-xl ${isNotificationsOpen ? "bg-white shadow-sm" : "hover:bg-white hover:shadow-sm"}`}
              aria-label="Voir les notifications"
            >
              <Bell className={`w-5 h-5 transition-transform ${unreadCount > 0 ? 'animate-wiggle text-rose-500' : 'group-hover:scale-110'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-[0_0_8px_rgba(244,63,94,0.5)] z-10 animate-pulse"></span>
              )}
            </button>

            {/* NOTIFICATIONS DROPDOWN */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Tout lire</button>
                </div>
                <div className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notif) => {
                      const Icon = getIcon(notif.type);
                      const colorClass = getColor(notif.type);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors flex gap-4 cursor-pointer group rounded-xl mx-2 ${!notif.read ? 'bg-blue-50/20' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold leading-tight group-hover:text-blue-600 transition-colors ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{notif.message}</p>
                            <div className="flex items-center gap-1 mt-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                              <Clock size={10} />
                              {new Date(notif.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-400">Aucune notification</div>
                  )}
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <button
                    onClick={() => { navigate("/admin/notifications"); setIsNotificationsOpen(false); }}
                    className="w-full py-2.5 text-xs font-bold text-center text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Voir tout l'historique
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-gray-200"></div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 pl-2 group bg-white/50 hover:bg-white p-1.5 pr-4 rounded-full border transition-all ${isProfileOpen ? "bg-white border-gray-100 shadow-sm" : "border-transparent hover:border-gray-100 hover:shadow-sm"}`}
            aria-label="Menu utilisateur"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all overflow-hidden ${isProfileOpen ? "scale-105" : "group-hover:scale-105"} ${!adminProfile?.avatar ? "bg-black text-white" : ""}`}>
              {adminProfile?.avatar ? (
                <img src={adminProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold">{adminProfile?.firstName?.[0]}{adminProfile?.lastName?.[0]}</span>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-tight">{adminProfile?.firstName} {adminProfile?.lastName}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{adminProfile?.role}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ml-1 ${isProfileOpen ? "rotate-180 text-gray-600" : "group-hover:text-gray-600"}`} />
          </button>

          {/* DROPDOWN MENU */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-sm font-bold text-gray-900">Mon Compte</p>
                <p className="text-xs text-gray-500 truncate">{adminProfile?.email}</p>
              </div>

              <button
                onClick={() => { navigate("/admin/settings"); setIsProfileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Settings size={16} />
                Paramètres
              </button>

              <div className="h-px bg-gray-50 my-1"></div>

              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                onClick={logout}
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
