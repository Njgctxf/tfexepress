import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/api";
import MainLayout from "../layout/MainLayout";
import ProductCard from "../components/ProductCard";
import { Search, Filter, X, SlidersHorizontal, Star, TrendingUp, DollarSign, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState("recent"); // recent, popular, price-asc, price-desc, rating
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData.data || []);
      setCategories(categoriesData || []);
      
      // Auto-calculate price range
      const prices = (productsData.data || []).map(p => Number(p.price));
      if (prices.length > 0) {
        setPriceRange({ min: 0, max: Math.max(...prices) + 1000 });
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtered & Sorted Products
  let filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const productCatId = typeof product.category === 'object' 
      ? (product.category?._id || product.category?.id) 
      : product.category;
    const matchesCategory = activeCategory === "all" || productCatId === activeCategory;
    
    const price = Number(product.price);
    const matchesPrice = price >= priceRange.min && price <= priceRange.max;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sorting
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case "price-asc": return Number(a.price) - Number(b.price);
      case "price-desc": return Number(b.price) - Number(a.price);
      case "popular": return (b.sold || 0) - (a.sold || 0);
      case "rating": return (b.rating || 0) - (a.rating || 0);
      case "recent":
      default: 
        return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0);
    }
  });

  const resetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    const prices = products.map(p => Number(p.price));
    setPriceRange({ min: 0, max: Math.max(...prices) + 1000 });
    setSortBy("recent");
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🛍️ Boutique</h1>
          <p className="text-gray-500">Découvrez {products.length} produits exceptionnels</p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white rounded-2xl border p-4 mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="🔍 Rechercher un produit, une marque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none font-semibold cursor-pointer"
          >
            <option value="recent">🕐 Plus récents</option>
            <option value="popular">🔥 Plus populaires</option>
            <option value="price-asc">💰 Prix croissant</option>
            <option value="price-desc">💎 Prix décroissant</option>
            <option value="rating">⭐ Meilleures notes</option>
          </select>

          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl font-bold"
          >
            <SlidersHorizontal size={18} />
            Filtres
          </button>
        </div>

        {/* CONTENT GRID */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* SIDEBAR FILTERS */}
          <aside className={`w-full lg:w-72 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Categories */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Filter size={18} />
                  Catégories
                </h3>
                {activeCategory !== "all" && (
                  <button onClick={() => setActiveCategory("all")} className="text-xs text-orange-600 hover:underline">
                    Réinitialiser
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveCategory("all")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeCategory === "all" 
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  📦 Tous les produits
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat._id || cat.id}
                    onClick={() => setActiveCategory(cat._id || cat.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeCategory === (cat._id || cat.id)
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <DollarSign size={18} />
                Prix
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Min</label>
                  <input 
                    type="number" 
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Max</label>
                  <input 
                    type="number" 
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Reset All */}
            <button 
              onClick={resetFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-all"
            >
              🔄 Réinitialiser tout
            </button>

            {/* Trust Badges */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
              <h4 className="font-bold mb-3 text-sm">✓ Garanties</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Paiement sécurisé
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Livraison rapide
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Retour gratuit 14j
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Support 24/7
                </li>
              </ul>
            </div>
          </aside>

          {/* PRODUCT LIST */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{filteredProducts.length}</span> produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
              </p>
              {(activeCategory !== "all" || searchQuery) && (
                <button onClick={resetFilters} className="text-sm text-orange-600 hover:underline font-semibold">
                  Effacer les filtres
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500"></div>
                <p className="text-gray-500 mt-4">Chargement des produits...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <p className="text-6xl mb-4">😕</p>
                <p className="text-xl font-bold text-gray-900 mb-2">Aucun produit trouvé</p>
                <p className="text-gray-500 mb-6">Essayez de modifier vos filtres</p>
                <button onClick={resetFilters} className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <Link key={product._id || product.id} to={`/product/${product.id || product._id}`}>
                    <div className="group bg-white rounded-2xl border hover:border-orange-500 overflow-hidden transition-all hover:shadow-xl">
                      {/* Image */}
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        <img 
                          src={product.images?.[0] || product.image || "/placeholder.png"} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.isFeatured && (
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                              ⭐ Top
                            </span>
                          )}
                          {product.stock <= 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                              Épuisé
                            </span>
                          )}
                          {product.stock > 0 && product.stock < 10 && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                              Stock limité
                            </span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-white p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors">
                            <Heart size={16} className="text-gray-600 hover:text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <p className="text-xs text-gray-500 mb-1">
                          {(typeof product.category === 'object' ? product.category?.name : categories.find(c => (c._id || c.id) == product.category)?.name) || "Autre"}
                        </p>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                        
                        {/* Rating */}
                        {product.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold">{product.rating}</span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-gray-900">{Number(product.price).toLocaleString()} F</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">{Number(product.originalPrice).toLocaleString()} F</span>
                          )}
                        </div>

                        {/* CTA */}
                        <button className="w-full mt-3 bg-black text-white py-2 rounded-lg font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800">
                          Voir le produit
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
