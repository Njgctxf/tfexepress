import { Link } from "react-router-dom";
import { Plus, Pencil, Trash, Search, Filter, AlertCircle, Package, TrendingUp, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import ProductsSalesChart from "../components/ProductsSalesChart";
import { getProducts, getCategories, deleteProduct } from "../../services/api";

import KpiCard from "../components/KpiCard";
import ConfirmModal from "../../components/ConfirmModal";
import toast from "react-hot-toast";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  // Filter state: 'all' | 'low_stock' | 'top_sales'
  const [activeFilter, setActiveFilter] = useState("all");

  // Modal State
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [search, categoryFilter]);

  async function fetchData() {
    setLoading(true);
    try {
      // Run independent queries in parallel to reduce load time
      const [categoriesRes, productsRes] = await Promise.all([
        getCategories(),
        getProducts({ search: search, category: categoryFilter !== 'all' ? categoryFilter : null })
      ]);

      setCategories(categoriesRes || []);

      if (productsRes.success) {
        setProducts(productsRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      // Optimistic UI update
      setProducts(prev => prev.filter(p => (p.id !== deleteId && p._id !== deleteId)));
      setDeleteId(null);
      toast.success("Produit supprimé avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression : " + error.message);
    }
  };

  const getCategoryName = (catId) => {
    if (!catId) return "Non catégorisé";
    if (typeof catId === "object") return catId.name || catId.nom || "Indéfini";
    const cat = categories.find((c) => c._id === catId || c.id === catId);
    return cat ? (cat.name || cat.nom) : "Non catégorisé";
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return { label: "Rupture", color: "bg-red-100 text-red-700 border-red-200" };
    if (stock <= 5)
      return { label: "Faible", color: "bg-amber-100 text-amber-700 border-amber-200" };
    return { label: "En stock", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  };

  // derived state
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const topSalesCount = products.filter(p => p.sold > 0).length;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "all" ||
      (typeof product.category === 'object' && product.category !== null
        ? (String(product.category._id) === String(categoryFilter) || String(product.category.id) === String(categoryFilter))
        : String(product.category) === String(categoryFilter));

    // KPI Filter Logic
    let matchesKpi = true;
    if (activeFilter === "low_stock") {
      matchesKpi = product.stock <= 5;
    } else if (activeFilter === "top_sales") {
      matchesKpi = product.sold > 0;
    }

    return matchesSearch && matchesCategory && matchesKpi;
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">

      {/* 🧭 HEADER & STATS */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight truncate">Produits</h2>
            <p className="text-gray-500 mt-1 truncate">Gérez votre catalogue et vos stocks</p>
          </div>
          <Link
            to="/admin/products/add"
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto whitespace-nowrap"
          >
            <Plus size={20} className="flex-shrink-0" />
            Nouveau produit
          </Link>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            title="Total Produits"
            value={products.length}
            icon={<Package size={24} className="text-white" />}
            gradient="from-indigo-600 to-blue-500"
            trend={`${categories.length} Catégories`}
            trendUp={true}
            onClick={() => setActiveFilter("all")}
          />
          <KpiCard
            title="Stock Faible"
            value={lowStockCount}
            icon={<AlertCircle size={24} className="text-white" />}
            gradient="from-amber-500 to-orange-400"
            trend={activeFilter === "low_stock" ? "Filtre actif (Cliquez pour retirer)" : "Cliquez pour filtrer"}
            trendUp={false}
            onClick={() => setActiveFilter(prev => prev === "low_stock" ? "all" : "low_stock")}
          />
          <KpiCard
            title="Top Ventes"
            value={topSalesCount}
            icon={<TrendingUp size={24} className="text-white" />}
            gradient="from-emerald-500 to-teal-400"
            trend={activeFilter === "top_sales" ? "Filtre actif (Cliquez pour retirer)" : "Cliquez pour filtrer les best-sellers"}
            trendUp={true}
            onClick={() => setActiveFilter(prev => prev === "top_sales" ? "all" : "top_sales")}
          />
        </div>

        {/* CHART SECTION (Optional - keeping if useful, or moving) */}
        {/* <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-gray-900 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">Ventes par Produit</h3>
          <div className="h-32">
            <ProductsSalesChart data={products} simple={true} />
          </div>
        </div> */}
      </div>


      {/* 🛠️ FILTERS & SEARCH */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Filter size={16} />
            <span>Filtres:</span>
          </div>
          <select
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 📦 TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Stock & Ventes</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-600">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Package size={48} strokeWidth={1} className="mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">Aucun produit trouvé</p>
                      <p className="text-sm mt-1">Essayez de modifier votre recherche.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = getStockStatus(p.stock);
                  return (
                    <tr key={p._id || p.id} className="group hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm relative group-hover:scale-105 transition-transform duration-300">
                            <img
                              src={p.images?.[0] || p.image || "/placeholder.png"}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            {p.stock === 0 && (
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                                <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded">EPUISÉ</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base">{p.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px] mt-0.5">{p.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          {getCategoryName(p.category)}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900 text-base">
                        {Number(p.price).toLocaleString()} <span className="text-xs text-gray-500 font-normal">FCFA</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${stock.color}`}>
                            {stock.label} ({p.stock})
                          </span>
                          <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                            <TrendingUp size={12} /> {p.sold} ventes
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/admin/products/edit/${p._id || p.id}`}
                            className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Pencil size={18} />
                          </Link>
                          <button
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                            title="Supprimer"
                            onClick={() => setDeleteId(p._id || p.id)}
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Aucun produit trouvé</p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const stock = getStockStatus(p.stock);
              return (
                <div key={p._id || p.id} className="p-4 flex gap-4 bg-white hover:bg-gray-50 transition-colors relative">
                  {/* IMAGE */}
                  <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 relative">
                    <img
                      src={p.images?.[0] || p.image || "/placeholder.png"}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded font-bold">EPUISÉ</span>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{p.name}</h3>
                        <button className="text-gray-400 p-1">
                          {/* Option menu */}
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{Number(p.price).toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500 mt-1">{getCategoryName(p.category)}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stock.color}`}>
                        {stock.label}
                      </span>

                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/products/edit/${p._id || p.id}`}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                          onClick={() => setDeleteId(p._id || p.id)}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer le produit ?"
        message="Cette action est irréversible. Le produit sera retiré de la vente immédiatement."
        confirmText="Supprimer"
        isDestructive={true}
      />
    </div>
  );
}


