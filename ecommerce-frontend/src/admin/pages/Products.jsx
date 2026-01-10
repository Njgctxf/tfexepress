import { Link } from "react-router-dom";
import { Plus, Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import ProductsSalesChart from "../components/ProductsSalesChart";
import { getProducts, getCategories } from "../../services/api";

/* 🔍 HELPERS */
const getStockStatus = (stock) => {
  if (stock === 0)
    return { label: "Rupture", style: "bg-red-100 text-red-700" };
  if (stock <= 5)
    return { label: "Stock faible", style: "bg-yellow-100 text-yellow-700" };
  return { label: `${stock} en stock`, style: "bg-green-100 text-green-700" };
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      if (productsRes.success) {
        setProducts(productsRes.data || []);
      }
      setCategories(categoriesRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getCategoryName = (catId) => {
    if (!catId) return "Non catégorisé";
    if (typeof catId === "object") return catId.name; // MongoDB populate
    const cat = categories.find((c) => c._id === catId || c.id === catId);
    return cat ? cat.name : "Non catégorisé";
  };

  if (loading) {
    return <p className="text-gray-500">Chargement...</p>;
  }

  const lowStock = products.filter((p) => p.stock <= 5);
  const topSales = [...products].sort((a, b) => b.sold - a.sold).slice(0, 3);
  const deadStock = products.filter((p) => p.sold < 10);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Produits en vente</h2>
          <p className="text-gray-500 text-sm">
            Liste complète des produits affichés sur le site
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Plus size={18} />
          Ajouter un produit
        </Link>
      </div>

      {/* TABLE (MAIN SECTION) */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Produit</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium">Prix</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y text-gray-600">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Aucun produit trouvé. Ajoutez-en un !
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const stock = getStockStatus(p.stock);
                  return (
                    <tr key={p._id || p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border">
                             <img
                              src={p.images?.[0] || p.image || "/placeholder.png"}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                           {getCategoryName(p.category)}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {Number(p.price).toLocaleString()} FCFA
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stock.style}`}>
                            {stock.label}
                          </span>
                          <span className="text-xs text-gray-400">{p.sold} ventes</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/products/edit/${p._id || p.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-black transition-colors"
                          >
                            <Pencil size={18} />
                          </Link>
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
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
      </div>

      {/* STATS & CHART (SECONDARY) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t">
         {/* ... kept for bottom stats if needed, or user can ignore */}
         <div className="md:col-span-1 space-y-4">
            <h3 className="font-semibold text-gray-900">Aperçu rapide</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Total" value={products.length} color="green" />
              <StatCard title="Critique" value={lowStock.length} color="red" />
            </div>
         </div>
         <div className="md:col-span-2">
            <ProductsSalesChart data={products} />
         </div>
      </div>
    </div>
  );
}

/* STAT CARD */
function StatCard({ title, value, color }) {
  const colors = {
    green: "text-green-700",
    yellow: "text-yellow-700",
    red: "text-red-700",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${colors[color]}`}>{value}</p>
    </div>
  );
}
