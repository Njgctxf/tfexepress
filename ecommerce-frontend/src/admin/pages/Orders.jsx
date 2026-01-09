// src/admin/pages/Orders.jsx
import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const orders = [
  {
    id: "TF-1021",
    client: "Jean Kouassi",
    total: 45000,
    status: "Payé",
    date: "05 Jan 2026",
  },
  {
    id: "TF-1022",
    client: "Aïcha Traoré",
    total: 28500,
    status: "En attente",
    date: "05 Jan 2026",
  },
  {
    id: "TF-1023",
    client: "Marc Yao",
    total: 120000,
    status: "Annulé",
    date: "04 Jan 2026",
  },
];

const statusStyle = {
  "Payé": "bg-green-100 text-green-700",
  "En attente": "bg-yellow-100 text-yellow-700",
  "Annulé": "bg-red-100 text-red-700",
};

export default function Orders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.client.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      status === "Tous" || order.status === status;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Commandes
        </h1>
        <p className="text-sm text-gray-500">
          Gérer et suivre toutes les commandes TFExpress
        </p>
      </div>

      {/* FILTRES */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher une commande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* STATUS */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full md:w-48 px-3 py-2 border rounded-xl text-sm focus:outline-none"
        >
          <option value="Tous">Tous les statuts</option>
          <option value="Payé">Payé</option>
          <option value="En attente">En attente</option>
          <option value="Annulé">Annulé</option>
        </select>
      </div>

      {/* TABLE DESKTOP */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-4">Commande</th>
              <th>Client</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                onClick={() =>
                  navigate(`/admin/orders/${order.id}`)
                }
                className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 font-medium">
                  #{order.id}
                </td>
                <td>{order.client}</td>
                <td>{order.total.toLocaleString()} FCFA</td>
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

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            onClick={() =>
              navigate(`/admin/orders/${order.id}`)
            }
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">
                #{order.id}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              Client : {order.client}
            </p>
            <p className="text-sm text-gray-600">
              Total : {order.total.toLocaleString()} FCFA
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {order.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
