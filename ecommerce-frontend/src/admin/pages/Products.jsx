import { Link } from "react-router-dom";
import { Plus, Pencil, Trash, Search, Filter, AlertCircle, Package, TrendingUp, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ProductsSalesChart from "../components/ProductsSalesChart";
import { getProducts, getCategories, deleteProduct, bulkCreateProducts } from "../../services/api";
import { getProxiedImageUrl } from "../../utils/imageProxy";

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

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal State
  const [deleteEntity, setDeleteEntity] = useState(null); // id (string) or array of ids

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
    if (!deleteEntity) return;
    
    const idsToDelete = Array.isArray(deleteEntity) ? deleteEntity : [deleteEntity];
    const isBulk = Array.isArray(deleteEntity);

    try {
      if (isBulk) {
        const { bulkDeleteProducts: apiBulkDelete } = await import("../../services/api");
        await apiBulkDelete(idsToDelete);
      } else {
        await deleteProduct(idsToDelete[0]);
      }
      
      // Optimistic UI update
      setProducts(prev => prev.filter(p => !idsToDelete.includes(p._id || p.id)));
      
      if (isBulk) setSelectedIds([]);
      setDeleteEntity(null);
      toast.success(isBulk ? `${idsToDelete.length} produits supprimés` : "Produit supprimé avec succès");
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
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const topSalesCount = products.filter(p => p.sold > 0).length;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "all" ||
      (typeof product.category === 'object' && product.category !== null
        ? (String(product.category._id) === String(categoryFilter) || String(product.category.id) === String(categoryFilter))
        : String(product.category) === String(categoryFilter));

    // KPI Filter Logic
    let matchesKpi = true;
    if (activeFilter === "out_of_stock") {
      matchesKpi = product.stock === 0;
    } else if (activeFilter === "low_stock") {
      matchesKpi = product.stock > 0 && product.stock <= 5;
    } else if (activeFilter === "top_sales") {
      matchesKpi = product.sold > 0;
    }

    return matchesSearch && matchesCategory && matchesKpi;
  });

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      
      if (lines.length < 2) {
        toast.error("Le fichier CSV est vide ou invalide.");
        return;
      }

      const delimiter = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const productsToInsert = [];

      for (let i = 1; i < lines.length; i++) {
        // Gérer les guillemets.
        const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
        const currentline = lines[i].split(regex);
        
        // S'il n'y a pas assez de colonnes sur cette ligne, on l'ignore
        if (currentline.length < 2) continue;

        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let val = (currentline[j] || "").trim();
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
          }
          obj[headers[j]] = val;
        }

        // Reconnaître plusieurs variantes pour le Nom
        const name = obj.name || obj.nom || obj.titre || obj.title;
        if (!name) continue; 

        let catId = obj.category_id || obj.categorie || obj.category || null;
        if (catId === "") catId = null;

        // Gérer les virgules dans les nombres depuis Excel (ex: 10,50 -> 10.50)
        let rawPrice = String(obj.price || obj.prix || "0").replace(',', '.');

        productsToInsert.push({
          name: name,
          description: obj.description || obj.desc || "",
          price: parseFloat(rawPrice) || 0,
          stock: parseInt(obj.stock || obj.quantite || obj.qty, 10) || 0,
          category_id: catId,
          images: (obj.image || obj.images || obj.imageurl) ? [obj.image || obj.images || obj.imageurl] : [],
          brand: obj.brand || obj.marque || null,
          is_featured: obj.is_featured === 'true' || obj.is_featured === '1' || obj.is_featured === 'VRAI'
        });
      }

      if (productsToInsert.length === 0) {
        toast.error("Aucun produit valide trouvé dans le CSV.");
        return;
      }

      const toastId = toast.loading("Importation en cours...");
      try {
        const res = await bulkCreateProducts(productsToInsert);
        if (res.success) {
          toast.success(`${productsToInsert.length} produits importés !`, { id: toastId });
          fetchData();
        } else {
          toast.error("Erreur lors de l'importation: " + res.error, { id: toastId });
        }
      } catch (err) {
        toast.error("Erreur API lors de l'importation.", { id: toastId });
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

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
          <div className="flex flex-col sm:flex-row gap-3">
             <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleCSVUpload} />
             <button
                onClick={() => fileInputRef.current.click()}
                className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm w-full sm:w-auto"
              >
                <Upload size={20} className="text-gray-500" />
                Importer CSV
              </button>
            <Link
              to="/admin/products/add"
              className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto whitespace-nowrap"
            >
              <Plus size={20} className="flex-shrink-0" />
              Nouveau produit
            </Link>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            title="Rupture Stock"
            value={outOfStockCount}
            icon={<AlertCircle size={24} className="text-white" />}
            gradient="from-red-600 to-rose-500"
            trend={activeFilter === "out_of_stock" ? "Filtre actif" : "Stock = 0"}
            trendUp={false}
            onClick={() => setActiveFilter(prev => prev === "out_of_stock" ? "all" : "out_of_stock")}
          />
          <KpiCard
            title="Stock Faible"
            value={lowStockCount}
            icon={<AlertCircle size={24} className="text-white" />}
            gradient="from-amber-500 to-orange-400"
            trend={activeFilter === "low_stock" ? "Filtre actif" : "1 à 5 articles"}
            trendUp={false}
            onClick={() => setActiveFilter(prev => prev === "low_stock" ? "all" : "low_stock")}
          />
          <KpiCard
            title="Top Ventes"
            value={topSalesCount}
            icon={<TrendingUp size={24} className="text-white" />}
            gradient="from-emerald-500 to-teal-400"
            trend={activeFilter === "top_sales" ? "Filtre actif" : "Best-sellers"}
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

      {/* ⚡ BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl">
              <Package size={20} />
            </div>
            <div>
              <p className="font-bold">{selectedIds.length} produits sélectionnés</p>
              <p className="text-xs text-indigo-100">Actions groupées disponibles</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={() => setDeleteEntity(selectedIds)}
              className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all shadow-sm"
            >
              <Trash size={18} />
              Supprimer la sélection
            </button>
          </div>
        </div>
      )}

      {/* 📦 TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredProducts.map(p => p._id || p.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
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
                  <td colSpan="6" className="px-6 py-12 text-center">
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
                  const isSelected = selectedIds.includes(p._id || p.id);
                  return (
                    <tr key={p._id || p.id} className={`group hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, p._id || p.id]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== (p._id || p.id)));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm relative group-hover:scale-105 transition-transform duration-300">
                            <img
                              referrerPolicy="no-referrer"
                              src={getProxiedImageUrl(p.images?.[0] || p.image)}
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
                            onClick={() => setDeleteEntity(p._id || p.id)}
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
                      src={getProxiedImageUrl(p.images?.[0] || p.image)}
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
                          onClick={() => setDeleteEntity(p._id || p.id)}
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
        isOpen={!!deleteEntity}
        onClose={() => setDeleteEntity(null)}
        onConfirm={confirmDelete}
        title={Array.isArray(deleteEntity) ? `Supprimer ${deleteEntity.length} produits ?` : "Supprimer le produit ?"}
        message={Array.isArray(deleteEntity) 
          ? `Êtes-vous sûr de vouloir supprimer ces ${deleteEntity.length} produits ? Cette action est irréversible.`
          : "Cette action est irréversible. Le produit sera retiré de la vente immédiatement."}
        confirmText="Supprimer"
        isDestructive={true}
      />
    </div>
  );
}


