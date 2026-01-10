import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  Camera,
  ChevronRight,
  Smartphone,
  Laptop,
  Tv,
  Shirt,
  Heart,
  LogOut,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";
import SearchResults from "../components/SearchResults";

/* ================= CATEGORIES ================= */

const categories = [
  { name: "Téléphones & Tablettes", icon: Smartphone, subs: ["iPhone", "Samsung"] },
  { name: "Informatique", icon: Laptop, subs: ["PC", "MacBook"] },
  { name: "Électronique", icon: Tv, subs: ["TV", "Audio"] },
  { name: "Mode", icon: Shirt, subs: ["Homme", "Femme"] },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [openUser, setOpenUser] = useState(false);

  const { cart } = useCart();
  const { favorites } = useFavorites();
  const { query, setQuery } = useSearch();

  const auth = useAuth() || {};
  const user = auth.user;
  const logout = auth.logout;

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* ================= TOP BAR ================= */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center font-extrabold text-white">
            TF
          </div>
          <span className="text-lg font-extrabold">tfexpress</span>
        </Link>

        {/* SEARCH DESKTOP */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-6 relative">
          <div className="flex w-full border rounded-full overflow-hidden bg-white">
            <Search className="mx-4 my-auto text-gray-400" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 py-2 text-sm outline-none"
              placeholder="Rechercher un produit..."
            />
            <button className="px-3 text-gray-500">
              <Camera size={18} />
            </button>
          </div>
          <SearchResults />
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4 relative">
          {/* NAV LINKS (DESKTOP) */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-gray-600">
              Accueil
            </Link>
            <Link to="/shop" className="text-sm font-medium hover:text-gray-600">
              Boutique
            </Link>
            <Link to="/category/vetements" className="text-sm font-medium hover:text-gray-600">
              Vêtements
            </Link>
          </nav>
          <Link to="/favorites" className="relative">
            <Heart size={22} />
            {favorites.length > 0 && (
              <span className="badge">{favorites.length}</span>
            )}
          </Link>

          <Link to="/cart" className="relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="badge">{cartCount}</span>
            )}
          </Link>

          {/* ===== USER DESKTOP ===== */}
          <div className="hidden md:block relative">
            {!user ? (
              <div className="flex gap-3">
                <Link to="/register" className="border px-4 py-2 rounded-full text-sm">
                  Créer un compte
                </Link>
                <Link to="/login" className="bg-blue-500 text-white px-5 py-2 rounded-full flex items-center gap-2 text-sm">
                  <User size={16} /> Connexion
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setOpenUser(!openUser)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <User size={18} />
                </button>

                {openUser && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border overflow-hidden">
                    <div className="px-4 py-3 text-sm font-medium border-b">
                      {user.email}
                    </div>

                    <Link to="/dashboard" className="menu-item">
                      Mon Tableau de bord
                    </Link>

                    <Link to="/favorites" className="menu-item">
                      Favoris
                    </Link>
                    <Link to="/cart" className="menu-item">
                      Panier
                    </Link>

                    <button
                      onClick={logout}
                      className="menu-item text-red-500 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* MOBILE MENU BTN */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-xl transition-transform
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="font-bold">Menu</span>
          <button onClick={() => setOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {categories.map((cat) => (
            <div key={cat.name} className="px-3 py-3 rounded-lg hover:bg-gray-100">
              {cat.name}
            </div>
          ))}

          <div className="border-t pt-4 mt-4">
            {!user ? (
              <>
                <Link to="/login" className="block py-2">Connexion</Link>
                <Link to="/register" className="block py-2">Créer un compte</Link>
              </>
            ) : (
              <button onClick={logout} className="py-2 text-red-500">
                Déconnexion
              </button>
            )}
          </div>
        </div>
      </aside>
    </header>
  );
};

export default Header;
