import { Link } from "react-router-dom";
import { Plus, Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import ProductsSalesChart from "../components/ProductsSalesChart";
import { getProducts } from "../../services/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((res) => {
        if (res.success) {
          setProducts(res.data || []);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

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
          <h2 className="text-2xl font-bold text-gray-800">Produits</h2>
          <p className="text-gray-500 text-sm">
            Gestion et analyse des produits TFExpress
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={18} />
          Ajouter un produit
        </Link>
      </div>

      {/* INDICATEURS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Stock faible" value={lowStock.length} color="yellow" />
        <StatCard title="Top ventes" value={topSales.length} color="green" />
        <StatCard title="Stock mort" value={deadStock.length} color="red" />
      </div>

      {/* GRAPHIQUE */}
      <ProductsSalesChart data={products} />

      {/* TABLE */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-6 py-4">Produit</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Ventes</th>
              <th>Stock</th>
              <th className="text-right px-6">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const stock = getStockStatus(p.stock);
              return (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="font-medium">{p.name}</span>
                  </td>

                  <td className="text-center">{p.category}</td>
                  <td className="text-center font-semibold">
                    {p.price.toLocaleString()} FCFA
                  </td>
                  <td className="text-center">{p.sold}</td>
                  <td className="text-center">
                    <span className={`px-3 py-1 rounded-full text-xs ${stock.style}`}>
                      {stock.label}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/products/edit/${p.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-red-600">
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
