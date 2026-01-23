import { useState, useEffect, useRef } from "react";
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
  Grid,
} from "lucide-react";

import { getCategories } from "../services/api";
import { categoryUI } from "../config/categoryUI";

import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useSearch } from "../context/SearchContext";

import { useAuth } from "../context/AuthContext";
import { useSiteSettings } from "../context/SiteSettingsContext";

import SearchResults from "../components/SearchResults";

/* ================= CATEGORIES ================= */



const Header = () => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [openUser, setOpenUser] = useState(false);

  const { cart = [] } = useCart() || {};
  const { favorites } = useFavorites();
  const { query, setQuery } = useSearch();
  const { siteName, supportPhone } = useSiteSettings();

  const auth = useAuth() || {};
  const user = auth.user;
  const logout = auth.logout;

  const cartCount = Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.qty, 0) : 0;

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Show scanning state
    setQuery("Analyse de l'image...");

    // 2. Simulate analysis (mock)
    setTimeout(() => {
      // In a real app: await uploadImage(file) -> get keywords
      // Here: We search for a generic term or the filename if useful
      // Let's act smart: if file name contains "shoes", search shoes.
      // Otherwise default to "Nouveauté" or "Robes"
      const name = file.name.toLowerCase();
      let term = "Nouveauté";
      if (name.includes("iphone")) term = "iPhone";
      else if (name.includes("shoe") || name.includes("chaussure")) term = "Chaussures";
      else if (name.includes("robe") || name.includes("dress")) term = "Robes";

      setQuery(term);
    }, 1500);
  };

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      {/* ================= TOP BAR ================= */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center font-extrabold text-black">
            {siteName ? siteName.substring(0, 2).toUpperCase() : 'TF'}
          </div>
          <span className="text-lg font-extrabold">{siteName || 'tfexpress'}</span>
        </Link>

        {/* SEARCH DESKTOP */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-6 relative">
          <div className="flex w-full border rounded-full overflow-hidden bg-white">
            <Search className="mx-4 my-auto text-gray-500" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 py-2 text-sm outline-none"
              placeholder="Rechercher un produit..."
              aria-label="Rechercher un produit"
            />
            <button
              className="px-3 text-gray-500 hover:text-red-500 transition-colors"
              onClick={handleImageClick}
              title="Recherche par image"
              aria-label="Recherche par image"
            >
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
          </nav>
          <Link to="/favorites" className="relative" aria-label="Favoris">
            <Heart size={22} />
            {favorites.length > 0 && (
              <span className="badge">{favorites.length}</span>
            )}
          </Link>

          <Link to="/cart" className="relative" aria-label="Panier">
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
                  <User size={16} /> Se connecter
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setOpenUser(!openUser)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                  aria-label="Menu utilisateur"
                >
                  <User size={18} />
                </button>

                {openUser && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenUser(false)} />
                    <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform origin-top-right transition-all animate-fadeIn z-50">

                      {/* User Header */}
                      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">Mon Compte</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link to="/dashboard" onClick={() => setOpenUser(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black rounded-xl transition-colors group">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Grid size={18} />
                          </div>
                          <span className="font-medium text-sm">Mon Tableau de bord</span>
                        </Link>

                        <Link to="/favorites" onClick={() => setOpenUser(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black rounded-xl transition-colors group">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Heart size={18} />
                          </div>
                          <span className="font-medium text-sm">Mes Favoris</span>
                        </Link>

                        <Link to="/cart" onClick={() => setOpenUser(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black rounded-xl transition-colors group">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <ShoppingCart size={18} />
                          </div>
                          <span className="font-medium text-sm">Mon Panier</span>
                        </Link>
                      </div>

                      <div className="p-2 border-t border-gray-50 mt-1">
                        <button
                          onClick={() => { logout(); setOpenUser(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                            <LogOut size={16} />
                          </div>
                          <span className="font-medium text-sm">Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* MOBILE USER AVATAR */}
          {user && (
            <Link
              to="/dashboard"
              className="md:hidden w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
              aria-label="Mon compte"
            >
              <User size={18} className="text-gray-900" />
            </Link>
          )}

          {/* MOBILE MENU BTN */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} className="text-gray-900" />
          </button>
        </div>
      </div>

      {/* SEARCH MOBILE */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex w-full border rounded-full overflow-hidden bg-gray-50 relative z-20">
          <Search className="mx-4 my-auto text-gray-500" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 py-2 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-500"
            placeholder="Rechercher..."
            aria-label="Rechercher un produit"
          />
          <button
            className="px-3 text-gray-500 hover:text-red-500 my-auto"
            onClick={handleImageClick}
            aria-label="Recherche par image"
          >
            <Camera size={18} />
          </button>
          {/* Mobile Search Results */}
          {query && query.trim().length >= 2 && (
            <div className="absolute top-full left-0 w-full z-50">
              <SearchResults />
            </div>
          )}
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 touch-none"
          onClick={() => setOpen(false)}
        />
      )}



      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-xl transition-transform overscroll-contain
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="font-bold">Menu</span>
          <button onClick={() => setOpen(false)} aria-label="Fermer le menu">
            <X size={22} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-60px)]">

          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Navigation</h3>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <span className="font-medium">Accueil</span>
            </Link>
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <span className="font-medium">Boutique</span>
            </Link>
            <Link
              to="/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <span className="font-medium">Favoris</span>
              {favorites.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{favorites.length}</span>}
            </Link>
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <span className="font-medium">Panier</span>
              {cartCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
            </Link>

          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Catégories</h3>
            {categories.map((cat) => {
              // Normalize slug to match keys
              const normalizedSlug = cat.slug
                ? cat.slug.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
                : "";

              const ui = categoryUI[normalizedSlug] || categoryUI[cat.slug];
              const Icon = ui?.icon || Grid;

              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Icon size={18} className="text-gray-500" />
                  <span className="font-medium capitalize">{cat.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t pt-4">
            {!user ? (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 border rounded-full font-medium"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 bg-black text-white rounded-full font-medium"
                >
                  Créer un compte
                </Link>
                {/* WHATSAPP LINK */}
                <a
                  href={`https://wa.me/${supportPhone?.replace(/\D/g, '') || '22501020304'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 border border-green-200 text-green-600 rounded-full font-medium hover:bg-green-50 mt-2"
                >
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2">
                    W
                  </div>
                  Service Client WhatsApp
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <User size={18} />
                  <span className="font-medium">Mon compte</span>
                </Link>
                {/* WHATSAPP LINK */}
                <a
                  href={`https://wa.me/${supportPhone?.replace(/\D/g, '') || '22501020304'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-2 py-2 text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    W
                  </div>
                  <span className="font-medium">Service Client WhatsApp</span>
                </a>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </header>
  );
};

export default Header;
