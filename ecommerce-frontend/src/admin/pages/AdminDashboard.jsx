// src/admin/pages/AdminDashboard.jsx

import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import SalesChart from "../components/SalesChart";
import OrdersTable from "../components/OrdersTable";

const stats = [
  {
    title: "Produits",
    value: 128,
    icon: Package,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Commandes",
    value: 54,
    icon: ShoppingCart,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Utilisateurs",
    value: 312,
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Revenus",
    value: "1 250 000 FCFA",
    icon: DollarSign,
    color: "bg-yellow-100 text-yellow-600",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* 🧭 HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tableau de bord
          </h1>
          <p className="text-gray-500 text-sm">
            Vue générale de votre activité TFExpress
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <TrendingUp size={18} />
          Activité en hausse
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {stat.title}
                </p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {stat.value}
                </p>
              </div>

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <stat.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📈 GRAPHIQUE + COMMANDES */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* GRAPH */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold mb-4">
            Évolution des ventes
          </h3>
          <SalesChart />
        </div>

        {/* COMMANDES RÉCENTES */}
        <div className="xl:col-span-1">
          <OrdersTable />
        </div>
      </div>
    </div>
  );
}
