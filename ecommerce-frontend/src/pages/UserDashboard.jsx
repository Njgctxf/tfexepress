import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../services/api";
import { Package, ShoppingBag, Clock, CreditCard } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      getMyOrders(user.email)
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const stats = [
    { label: "Commandes", value: orders.length, icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
    { label: "En cours", value: orders.filter(o => o.status === "En cours").length, icon: Clock, color: "bg-orange-100 text-orange-600" },
    { label: "Livrées", value: orders.filter(o => o.status === "Livré").length, icon: Package, color: "bg-green-100 text-green-600" },
    { label: "Dépensé", value: orders.reduce((acc, o) => acc + o.total, 0).toLocaleString() + " FCFA", icon: CreditCard, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Mon Tableau de bord</h1>
        <p className="text-gray-500 mb-8">Bienvenue, {user?.email}</p>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-bold text-lg">Commandes récentes</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune commande passée pour le moment.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="px-6 py-3">N° Commande</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Articles</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-blue-600">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${order.status === 'Livré' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{order.total.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.items.map(i => `${i.qty}x ${i.name}`).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
