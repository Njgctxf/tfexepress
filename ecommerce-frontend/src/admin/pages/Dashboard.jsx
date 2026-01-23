import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, ShoppingBag, Package, TrendingUp, DollarSign, Activity,
  ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Counts
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

      // 2. Recent Orders for Table
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, total, created_at, status, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      // 3. Calculate Total Revenue (Fetch all valid orders amounts)
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total')
        .neq('status', 'Annulé'); // Exclude cancelled

      const totalRevenue = allOrders ? allOrders.reduce((acc, order) => acc + (order.total || 0), 0) : 0;

      setStats({
        totalUsers: userCount || 0,
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
        totalRevenue: totalRevenue,
        recentOrders: recentOrders || [],
        loading: false
      });

    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // MOCK DATA FOR CHART (To make it look good even empty)
  const chartData = [
    { name: 'Lun', value: 4000 },
    { name: 'Mar', value: 3000 },
    { name: 'Mer', value: 2000 },
    { name: 'Jeu', value: 2780 },
    { name: 'Ven', value: 1890 },
    { name: 'Sam', value: 2390 },
    { name: 'Dim', value: 3490 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tableau de Bord</h1>
          <p className="text-gray-500 mt-1">L'état de votre boutique en temps réel.</p>
        </div>
        <div className="flex bg-white shadow-sm border border-gray-100 rounded-lg p-1">
          <button className="px-4 py-1.5 text-sm font-bold bg-black text-white rounded-md shadow-sm">Aujourd'hui</button>
          <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900">7 Jours</button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Chiffre d'Affaires"
          value={`${stats.totalRevenue.toLocaleString()} F`}
          icon={<DollarSign size={24} className="text-white" />}
          gradient="from-blue-600 to-blue-400"
          trend="+12.5%"
          trendUp={true}
        />
        <KpiCard
          title="Commandes"
          value={stats.totalOrders}
          icon={<ShoppingBag size={24} className="text-white" />}
          gradient="from-purple-600 to-purple-400"
          trend="+4"
          trendUp={true}
        />
        <KpiCard
          title="Clients"
          value={stats.totalUsers}
          icon={<Users size={24} className="text-white" />}
          gradient="from-pink-600 to-pink-400"
          trend="+2"
          trendUp={true}
        />
        <KpiCard
          title="Produits"
          value={stats.totalProducts}
          icon={<Package size={24} className="text-white" />}
          gradient="from-orange-600 to-orange-400"
          trend="Stock"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-gray-400" />
              Aperçu des Ventes
            </h3>
          </div>
          <div className="h-[300px] w-full" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ORDERS FEED */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Activity size={20} className="text-gray-400" />
            Activité Récente
          </h3>
          <div className="space-y-6">
            {stats.recentOrders.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Aucune commande récente</p>
            ) : (
              stats.recentOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors -mx-2">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'paid' ? 'bg-green-100 text-green-600' :
                      order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 line-clamp-1">{order.profiles?.full_name || "Client Invité"}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{order.total_amount?.toLocaleString()} F</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${order.status === 'paid' ? 'text-green-500' : 'text-orange-400'
                      }`}>{order.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-bold text-gray-500 hover:text-black border border-dashed border-gray-200 rounded-xl hover:border-gray-400 transition-all">
            Voir toutes les commandes
          </button>
        </div>
      </div>
    </div>
  );
};

// MINI COMPONENT FOR KPI
const KpiCard = ({ title, value, icon, gradient, trend, trendUp }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-[100px] transition-all group-hover:scale-110`} />

    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-all`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      )}
    </div>

    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h3>
  </div>
);

export default Dashboard;
