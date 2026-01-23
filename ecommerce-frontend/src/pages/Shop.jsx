import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/api";
import MainLayout from "../layout/MainLayout";
import ProductCard from "../components/ProductCard";
import { useLocalization } from "../context/LocalizationContext";
import {
  Search, SlidersHorizontal, ChevronDown, RotateCcw, Check, ShoppingBag, X
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const { formatPrice, t } = useLocalization();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const foundCat = categories.find(c => c.slug === categoryParam || c._id === categoryParam || c.id === categoryParam);
      if (foundCat) setActiveCategory(foundCat._id || foundCat.id);
    } else if (!categoryParam) setActiveCategory("all");
  }, [categoryParam, categories]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([getProducts(), getCategories()]);
      const data = productsRes.data || [];
      setProducts(data);
      setCategories(categoriesRes || []);
      const prices = data.map(p => Number(p.price));
      setPriceRange({ min: 0, max: prices.length ? Math.max(...prices) + 5000 : 200000 });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const resetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setSortBy("recent");
    const prices = products.map(p => Number(p.price));
    setPriceRange({ min: 0, max: prices.length ? Math.max(...prices) + 5000 : 200000 });
  };

  let filtered = products.filter(p => {
    const nameMatch = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    let catId = p.category;
    if (p.category && typeof p.category === "object") catId = p.category._id || p.category.id;
    const catMatch = activeCategory === "all" || catId === activeCategory;
    const price = Number(p.price);
    return nameMatch && catMatch && price >= priceRange.min && price <= priceRange.max;
  });

  filtered.sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  useEffect(() => {
    document.body.style.overflow = showFilters ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [showFilters]);

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        <div className="relative bg-red-600 text-white overflow-hidden mb-8">
          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-bold uppercase tracking-wider">
                <ShoppingBag size={14} /> {t('promo')}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">{t('shop')}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 sticky top-0 z-30 bg-white/80 backdrop-blur-md py-4">
            <button onClick={() => setShowFilters(true)} className="lg:hidden w-full bg-black text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 font-bold shadow-lg">
              <SlidersHorizontal size={18} /> {t('filters')}
            </button>
            <div className="w-full md:max-w-md relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500" size={20} />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('search_placeholder')} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-full focus:bg-white outline-none shadow-sm font-medium" />
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">{t('sort_by')}:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none cursor-pointer">
                <option value="recent">{t('new_arrivals')}</option>
                <option value="price-asc">{t('price_asc')}</option>
                <option value="price-desc">{t('price_desc')}</option>
                <option value="rating">{t('popularity')}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-8 items-start mb-8">
            <aside className="hidden lg:block w-72 shrink-0 space-y-8">
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">{t('categories')}</h3>
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                  <button onClick={() => setActiveCategory("all")} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === "all" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                    <span>{t('see_all')}</span>
                    {activeCategory === "all" && <Check size={14} />}
                  </button>
                  {categories.map(cat => (
                    <button key={cat._id || cat.id} onClick={() => setActiveCategory(cat._id || cat.id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === (cat._id || cat.id) ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                      <span className="capitalize">{cat.name}</span>
                      {activeCategory === (cat._id || cat.id) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">{t('budget')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                    <span>{formatPrice(0)}</span>
                    <span>{formatPrice(priceRange.max)}</span>
                  </div>
                  <input type="range" min="0" max="200000" step="5000" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                </div>
              </div>
              <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-100 rounded-xl font-bold hover:bg-black hover:text-white transition-all"><RotateCcw size={16} /> {t('reset')}</button>
            </aside>

            <main className="flex-1 min-w-0">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">{activeCategory === 'all' ? t('all_products') : categories.find(c => (c._id || c.id) === activeCategory)?.name || t('categories')}</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filtered.length} {t('items')}{filtered.length > 1 ? 's' : ''}</span>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-50 rounded-2xl h-[320px] animate-pulse"></div>)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed text-center px-4">
                  <Search size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('no_products')}</h3>
                  <button onClick={resetFilters} className="bg-black text-white px-6 py-3 rounded-full font-bold mt-4">{t('clear_all')}</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map(product => <ProductCard key={product._id || product.id} product={product} />)}
                </div>
              )}
            </main>
          </div>
        </div>

        {/* MOBILE FILTERS DRAWER */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
            <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col">
              <div className="p-5 border-b flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-bold flex items-center gap-2"><SlidersHorizontal size={20} /> {t('filters')}</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 bg-white rounded-full shadow-sm"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-8">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">{t('sort_by')}</h3>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold">
                    <option value="recent">{t('new_arrivals')}</option>
                    <option value="price-asc">{t('price_asc')}</option>
                    <option value="price-desc">{t('price_desc')}</option>
                    <option value="rating">{t('popularity')}</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">{t('categories')}</h3>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setActiveCategory("all")} className={`px-4 py-2 rounded-lg text-sm font-bold border ${activeCategory === "all" ? "bg-black text-white" : "bg-white text-gray-600"}`}>{t('see_all')}</button>
                    {categories.map(cat => (
                      <button key={cat._id || cat.id} onClick={() => setActiveCategory(cat._id || cat.id)} className={`px-4 py-2 rounded-lg text-sm font-bold border capitalize ${activeCategory === (cat._id || cat.id) ? "bg-black text-white" : "bg-white text-gray-600"}`}>{cat.name}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">{t('budget')} ({formatPrice(priceRange.max)})</h3>
                  <input type="range" min="0" max="200000" step="5000" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                </div>
              </div>
              <div className="p-5 border-t bg-gray-50 grid grid-cols-2 gap-4">
                <button onClick={resetFilters} className="py-3 px-4 border border-gray-300 rounded-xl font-bold">{t('reset')}</button>
                <button onClick={() => setShowFilters(false)} className="py-3 px-4 bg-black text-white rounded-xl font-bold">{t('see_all')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
