import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

const statusStyle = {
  Payé: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "En attente": "bg-amber-100 text-amber-700 border border-amber-200",
  Annulé: "bg-red-100 text-red-700 border border-red-200",
};

export default function OrdersTable({ orders = [], simple = false }) {
  // Limit orders if simplified view
  const displayOrders = simple ? orders.slice(0, 5) : orders;

  if (simple) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Commande</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-indigo-600">
                  <Link to={`/admin/orders/${String(order.id).replace("#", "")}`}>
                    {order.id}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-600">{order.client}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{order.total}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">
            Aucune commande récente
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 container mx-auto">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">
          Toutes les commandes
        </h3>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Commande</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50/80 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-indigo-600">
                  {order.id}
                </td>
                <td className="px-6 py-4 text-gray-700 font-medium">{order.client}</td>
                <td className="px-6 py-4 text-gray-900 font-bold">{order.total}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{order.date}</td>
                <td className="px-6 py-4 text-center">
                  <Link to={`/admin/orders/${String(order.id).replace("#", "")}`} className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" aria-label={`Voir les détails de la commande ${order.id}`}>
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="md:hidden p-4 space-y-4">
        {displayOrders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-100 rounded-xl p-4 shadow-sm bg-white"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-bold text-indigo-600 block mb-1">
                  {order.id}
                </span>
                <span className="text-xs text-gray-400">{order.date}</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Client:</span>
                <span className="font-medium text-gray-800">{order.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total:</span>
                <span className="font-bold text-gray-900">{order.total}</span>
              </div>
            </div>

            <Link
              to={`/admin/orders/${String(order.id).replace("#", "")}`}
              className="mt-4 flex items-center justify-center w-full py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Voir détails
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
