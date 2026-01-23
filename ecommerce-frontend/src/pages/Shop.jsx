import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/api";
import MainLayout from "../layout/MainLayout";
import ProductCard from "../components/ProductCard";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Check,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [sortBy, setSortBy] = useState("recent");

  // Mobile Drawer State
  const [showFilters, setShowFilters] = useState(false);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const foundCat = categories.find(c => c.slug === categoryParam || c._id === categoryParam || c.id === categoryParam);
      if (foundCat) {
        setActiveCategory(foundCat._id || foundCat.id);
      }
    } else if (!categoryParam) {
      setActiveCategory("all");
    }
  }, [categoryParam, categories]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      const data = productsRes.data || [];
      setProducts(data);
      setCategories(categoriesRes || []);

      const prices = data.map(p => Number(p.price));
      const maxPrice = prices.length ? Math.max(...prices) + 5000 : 100000;
      setPriceRange({ min: 0, max: maxPrice });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- LOGIC ---------------- */
  const resetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setSortBy("recent");
    const prices = products.map(p => Number(p.price));
    setPriceRange({
      min: 0,
      max: prices.length ? Math.max(...prices) + 5000 : 100000
    });
  };

  let filtered = products.filter(p => {
    const nameMatch = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    // Safety check for category
    let catId = p.category;
    if (p.category && typeof p.category === "object") {
      catId = p.category._id || p.category.id;
    }

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

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => document.body.style.overflow = 'auto';
  }, [showFilters]);

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">

        {/* HERO SECTION */}
        {/* HERO SECTION */}
        <div className="relative bg-red-600 text-white overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 opacity-90"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
                <ShoppingBag size={14} /> Offres Spéciales
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Ventes Flash & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-red-100">
                  Promotions
                </span>
              </h1>
              <p className="text-red-100 text-lg md:text-xl max-w-lg mx-auto md:mx-0">
                Profitez de réductions incroyables sur nos meilleures collections. Livraison rapide partout en Côte d'Ivoire.
              </p>
            </div>
            {/* Decoration */}
            <div className="hidden md:block relative animate-in fade-in slide-in-from-right-10 duration-1000">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-white to-red-200 rounded-full blur-3xl opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <ShoppingBag size={200} className="text-white relative z-10 drop-shadow-2xl opacity-90" strokeWidth={1} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-20">

          {/* TOP BAR: Search & Mobile Filter Toggle */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 sticky top-0 z-30 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 md:static md:bg-transparent md:p-0">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden w-full md:w-auto bg-black text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-95"
            >
              <SlidersHorizontal size={18} />
              Filtres & Tri
            </button>

            <div className="w-full md:max-w-md relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-full focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all shadow-sm font-medium"
              />
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none cursor-pointer hover:bg-white transition-colors"
              >
                <option value="recent">Nouveautés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Popularité</option>
              </select>
            </div>
          </div>

          {/* L-SHAPE LAYOUT */}

          {/* 1. TOP SECTION: Sidebar + First Batch of Products */}
          <div className="flex gap-8 items-start mb-8">

            {/* SIDEBAR (Desktop) - Removed sticky */}
            <aside className="hidden lg:block w-72 shrink-0 space-y-8">
              {/* Categories */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2">
                  Catégories
                </h3>
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                ${activeCategory === "all"
                        ? "bg-black text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <span>Tout voir</span>
                    {activeCategory === "all" && <Check size={14} />}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat._id || cat.id}
                      onClick={() => setActiveCategory(cat._id || cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                    ${activeCategory === (cat._id || cat.id)
                          ? "bg-black text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      <span className="capitalize">{cat.name}</span>
                      {activeCategory === (cat._id || cat.id) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">Budget</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                    <span>{priceRange.min} F</span>
                    <span>{priceRange.max.toLocaleString()} F</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-100 rounded-xl font-bold hover:border-black hover:bg-black hover:text-white transition-all duration-300"
              >
                <RotateCcw size={16} /> Réinitialiser
              </button>

              {/* Trust Banner */}
              <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
                <h4 className="font-bold text-yellow-800 mb-2">Pourquoi nous choisir ?</h4>
                <ul className="text-sm space-y-2 text-yellow-900/70">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div> Service Client 24/7</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div> Retours Gratuits</li>
                </ul>
              </div>
            </aside>

            {/* TOP PRODUCT GRID */}
            <main className="flex-1 min-w-0">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {activeCategory === 'all' ? 'Tous les produits' :
                    categories.find(c => (c._id || c.id) === activeCategory)?.name || 'Catégorie'
                  }
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {filtered.length} article{filtered.length > 1 ? 's' : ''}
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl h-[320px] animate-pulse"></div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center px-4">
                  <Search size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                  <p className="text-gray-500 max-w-sm mb-6">Essayez de modifier vos filtres ou effectuez une nouvelle recherche.</p>
                  <button onClick={resetFilters} className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                    Tout effacer
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Show first 6 items next to sidebar (2 rows) */}
                  {filtered.slice(0, 6).map(product => (
                    <div key={product._id || product.id} className="min-w-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>

          {/* 2. BOTTOM SECTION: Full Width Grid (Remaining Products) */}
          {!loading && filtered.length > 6 && (
            <div className="border-t border-gray-100 pt-8 animate-fadeIn">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filtered.slice(6).map(product => (
                  <div key={product._id || product.id} className="min-w-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MOBILE FILTERS DRAWER */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowFilters(false)}
            ></div>

            <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-5 border-b flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal size={20} /> Filtres
                </h2>
                <button onClick={() => setShowFilters(false)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-8">
                {/* Sort Options Mobile */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Trier par</h3>
                  <div className="space-y-2">
                    {[
                      { v: 'recent', l: 'Nouveautés' },
                      { v: 'price-asc', l: 'Prix croissant' },
                      { v: 'price-desc', l: 'Prix décroissant' },
                      { v: 'rating', l: 'Meilleures notes' }
                    ].map(opt => (
                      <label key={opt.v} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="sort"
                          checked={sortBy === opt.v}
                          onChange={() => setSortBy(opt.v)}
                          className="accent-black w-4 h-4"
                        />
                        <span className="font-medium text-sm">{opt.l}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Categories Mobile */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Catégories</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveCategory("all")}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all
                                     ${activeCategory === "all" ? "bg-black text-white border-black" : "bg-white border-gray-200 text-gray-600"}`}
                    >
                      Tout
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat._id || cat.id}
                        onClick={() => setActiveCategory(cat._id || cat.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all capitalize
                                        ${activeCategory === (cat._id || cat.id) ? "bg-black text-white border-black" : "bg-white border-gray-200 text-gray-600"}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Mobile */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Budget Max ({priceRange.max.toLocaleString()} F)</h3>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>
              </div>

              <div className="p-5 border-t bg-gray-50 grid grid-cols-2 gap-4">
                <button
                  onClick={resetFilters}
                  className="py-3 px-4 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="py-3 px-4 bg-yellow-400 text-black rounded-xl font-bold shadow-sm hover:bg-yellow-500"
                >
                  Voir {filtered.length} produits
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
