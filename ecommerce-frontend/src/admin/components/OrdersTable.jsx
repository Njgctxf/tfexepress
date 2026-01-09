import { Link } from "react-router-dom";

const orders = [
  {
    id: "#TF-1021",
    client: "Jean Kouassi",
    total: "45 000 FCFA",
    status: "Payé",
    date: "05 Jan 2026",
  },
  {
    id: "#TF-1022",
    client: "Aïcha Traoré",
    total: "28 500 FCFA",
    status: "En attente",
    date: "05 Jan 2026",
  },
  {
    id: "#TF-1023",
    client: "Marc Yao",
    total: "120 000 FCFA",
    status: "Annulé",
    date: "04 Jan 2026",
  },
];

const statusStyle = {
  Payé: "bg-green-100 text-green-700",
  "En attente": "bg-yellow-100 text-yellow-700",
  Annulé: "bg-red-100 text-red-700",
};

export default function OrdersTable() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-4">
        Dernières commandes
      </h3>

      {/* DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-3">Commande</th>
              <th>Client</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="py-3 font-medium text-blue-600 hover:underline">
                  <Link to={`/admin/orders/${order.id.replace("#", "")}`}>
                    {order.id}
                  </Link>
                </td>
                <td>{order.client}</td>
                <td>{order.total}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/admin/orders/${order.id.replace("#", "")}`}
            className="block border rounded-xl p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-600">
                {order.id}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              <p>Client : {order.client}</p>
              <p>Total : {order.total}</p>
              <p>Date : {order.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
