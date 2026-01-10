import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/api";
import MainLayout from "../layout/MainLayout";
import { Search, Filter } from "lucide-react";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtered Products
  const filteredProducts = products.filter(product => {
    // 1. Search
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Category
    // Note: product.category can be an object (if populated) or a string (if fallback/JSON)
    const productCatId = typeof product.category === 'object' 
      ? (product.category?._id || product.category?.id) 
      : product.category;
      
    const matchesCategory = activeCategory === "all" || productCatId === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Boutique</h1>
            <p className="text-gray-500">Découvrez tous nos produits</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <input 
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR FILTERS (Categories) */}
          <aside className="w-full lg:w-64 space-y-6">
            <div className="bg-white p-6 rounded-2xl border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter size={18} /> Catégories
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === "all" ? "bg-black text-white" : "hover:bg-gray-100"
                  }`}
                >
                  Tous les produits
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat._id || cat.id}
                    onClick={() => setActiveCategory(cat._id || cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === (cat._id || cat.id) ? "bg-black text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCT LIST */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20 text-gray-500">Chargement des produits...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <p className="text-gray-500">Aucun produit trouvé.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <div key={product._id || product.id} className="group cursor-pointer">
                    <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-3 relative">
                      <img 
                        src={product.images?.[0] || product.image || "/placeholder.png"} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.stock <= 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Épuisé
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {(typeof product.category === 'object' ? product.category?.name : categories.find(c => (c._id || c.id) == product.category)?.name) || "Autre"}
                    </p>
                    <p className="font-semibold mt-1">{Number(product.price).toLocaleString()} FCFA</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
