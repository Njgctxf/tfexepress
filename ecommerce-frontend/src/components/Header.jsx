import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  Camera,
  Heart,
  LogOut,
  Grid,
  Globe,
  Coins
} from "lucide-react";

import { getCategories } from "../services/api";
import { categoryUI } from "../config/categoryUI";

import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useSearch } from "../context/SearchContext";
import { useLocalization } from "../context/LocalizationContext";

import { useAuth } from "../context/AuthContext";
import { useSiteSettings } from "../context/SiteSettingsContext";

import SearchResults from "../components/SearchResults";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openUser, setOpenUser] = useState(false);

  const { cart = [] } = useCart() || {};
  const { favorites } = useFavorites();
  const { query, setQuery } = useSearch();
  const { siteName } = useSiteSettings();
  const { language, setLanguage, currency, setCurrency, t } = useLocalization();

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
    setQuery(t('analyzing'));
    setTimeout(() => {
      const name = file.name.toLowerCase();
      let term = t('shop');
      if (name.includes("iphone")) term = "iPhone";
      else if (name.includes("shoe") || name.includes("chaussure")) term = t('shoes_label');
      else if (name.includes("robe") || name.includes("dress")) term = t('dresses_label');
      setQuery(term);
    }, 1500);
  };

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      
      {/* ================= TOP BAR (LOCALE & CURRENCY) ================= */}
      <div className="bg-gray-50 border-b hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-end gap-6 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Globe size={12} />
            <select 
              value={language} 
              onChange={(e) => {
                console.log("Language changed to:", e.target.value);
                setLanguage(e.target.value);
              }}
              className="bg-transparent outline-none cursor-pointer hover:text-black relative z-[60]"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Coins size={12} />
            <select 
              value={currency} 
              onChange={(e) => {
                console.log("Currency changed to:", e.target.value);
                setCurrency(e.target.value);
              }}
              className="bg-transparent outline-none cursor-pointer hover:text-black relative z-[60]"
            >
              <option value="FCFA">FCFA</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center font-extrabold text-black">
            {siteName ? siteName.substring(0, 2).toUpperCase() : 'TF'}
          </div>
          <span className="text-lg font-extrabold">{siteName || 'tfexpress'}</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-2xl mx-6 relative">
          <div className="flex w-full border rounded-full overflow-hidden bg-white">
            <Search className="mx-4 my-auto text-gray-500" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 py-2 text-sm outline-none"
              placeholder={t('search')}
            />
            <button className="px-3 text-gray-500 hover:text-red-500 transition-colors" onClick={handleImageClick}>
              <Camera size={18} />
            </button>
          </div>
          <SearchResults />
        </div>

        <div className="flex items-center gap-4 relative">
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-gray-600">{t('home')}</Link>
            <Link to="/shop" className="text-sm font-medium hover:text-gray-600">{t('shop')}</Link>
          </nav>
          
          <Link to="/favorites" className="relative group" aria-label={t('favorites')}>
            <Heart size={22} className="group-hover:text-red-500 transition-colors" />
            {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
          </Link>

          <Link to="/cart" className="relative group" aria-label={t('cart')}>
            <ShoppingCart size={22} className="group-hover:text-blue-500 transition-colors" />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          <div className="hidden md:block relative">
            {!user ? (
              <div className="flex gap-3">
                <Link to="/register" className="border px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                  {t('register')}
                </Link>
                <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
                  <User size={16} /> {t('login')}
                </Link>
              </div>
            ) : (
              <>
                <button onClick={() => setOpenUser(!openUser)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <User size={18} />
                </button>
                {openUser && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenUser(false)} />
                    <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                      <div className="p-4 border-b border-gray-50 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">{user.email.charAt(0).toUpperCase()}</div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{t('profile')}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link to="/dashboard" onClick={() => setOpenUser(false)} className="menu-item"><Grid size={18} /> {t('dashboard')}</Link>
                        <Link to="/favorites" onClick={() => setOpenUser(false)} className="menu-item"><Heart size={18} /> {t('favorites')}</Link>
                        <Link to="/cart" onClick={() => setOpenUser(false)} className="menu-item"><ShoppingCart size={18} /> {t('cart')}</Link>
                      </div>
                      <div className="p-2 border-t border-gray-50">
                        <button onClick={() => { logout(); setOpenUser(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                          <LogOut size={16} /> {t('logout')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {user && (
            <Link to="/dashboard" className="md:hidden w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={18} />
            </Link>
          )}
          <button onClick={() => setOpen(true)} className="md:hidden w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Menu size={22} />
          </button>
        </div>
      </div>

      <div className="md:hidden px-4 pb-3">
        <div className="flex w-full border rounded-full overflow-hidden bg-gray-50 relative z-20">
          <Search className="mx-4 my-auto text-gray-500" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 py-2 text-sm bg-transparent outline-none"
            placeholder={t('search')}
          />
          <button className="px-3 text-gray-500" onClick={handleImageClick}><Camera size={18} /></button>
          {query && query.trim().length >= 2 && <div className="absolute top-full left-0 w-full z-50"><SearchResults /></div>}
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="font-bold">{t('menu')}</span>
          <button onClick={() => setOpen(false)}><X size={22} /></button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-60px)]">
          {/* MOBILE LOCALE & CURRENCY */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">{t('language_label')}</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent text-sm font-medium outline-none">
                <option value="fr">FR</option>
                <option value="en">EN</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 border-l pl-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase">{t('currency_label')}</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-transparent text-sm font-medium outline-none">
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="section-title">{t('home')}</h3>
            <Link to="/" onClick={() => setOpen(false)} className="mobile-link">{t('home')}</Link>
            <Link to="/shop" onClick={() => setOpen(false)} className="mobile-link">{t('shop')}</Link>
            <Link to="/favorites" onClick={() => setOpen(false)} className="mobile-link">{t('favorites')}</Link>
            <Link to="/cart" onClick={() => setOpen(false)} className="mobile-link">{t('cart')}</Link>
          </div>

          <div className="space-y-1">
            <h3 className="section-title">{t('categories')}</h3>
            {categories.map((cat) => {
              const normalizedSlug = cat.slug?.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || "";
              const ui = categoryUI[normalizedSlug] || categoryUI[cat.slug];
              const Icon = ui?.icon || Grid;
              return (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} onClick={() => setOpen(false)} className="mobile-link">
                  <Icon size={18} className="text-gray-400" />
                  <span className="capitalize">{cat.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t pt-4">
            {!user ? (
              <div className="space-y-3">
                <Link to="/login" onClick={() => setOpen(false)} className="w-full block py-3 text-center border rounded-full font-bold">{t('login')}</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="w-full block py-3 text-center bg-black text-white rounded-full font-bold">{t('register')}</Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/dashboard" onClick={() => setOpen(false)} className="mobile-link"><User size={18} /> {t('dashboard')}</Link>
                <button onClick={() => { logout(); setOpen(false); }} className="w-full flex items-center gap-3 px-2 py-2 text-red-500 font-medium">
                  <LogOut size={18} /> {t('logout')}
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
