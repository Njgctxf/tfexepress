
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, ShoppingBag, Package, TrendingUp, DollarSign, Activity,
  ArrowUpRight, ArrowDownRight, Clock, Download
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/KpiCard';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('week'); // 'today' | 'week' | 'month' | 'year'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    chartData: [],
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      // Date Filter
      const now = new Date();
      let startDate = new Date();
      if (timeRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setDate(now.getDate() - 30);
      } else if (timeRange === 'year') {
        startDate.setMonth(now.getMonth() - 11); // Last 12 months including current
        startDate.setDate(1); // Start from beginning of month for cleaner year view? Or rolling year? Let's do rolling year.
      }
      const startDateIso = startDate.toISOString();

      // 1. Counts (Global for Users/Products, Filtered for Orders)
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDateIso);

      // 2. Recent Orders (Respects Time Filter)
      const { data: recentOrders, error: orderError } = await supabase
        .from('orders')
        .select('id, total, created_at, status, user_email')
        .gte('created_at', startDateIso) // Filter by date (Today/Week)
        .order('created_at', { ascending: false })
        .limit(10);

      if (orderError) console.error("Order Fetch Error:", orderError);

      // 3. True Total Revenue (Filtered by time)
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', startDateIso);

      const totalRevenue = allOrders
        ? allOrders
          .filter(o => o.status !== 'cancelled' && o.status !== 'Annulé')
          .reduce((acc, order) => acc + (order.total || 0), 0)
        : 0;

      // 4. Chart Data (Group by Day or Hour)
      const { data: chartOrders } = await supabase
        .from('orders')
        .select('created_at, total')
        .gte('created_at', startDateIso)
        .neq('status', 'cancelled')
        .neq('status', 'Annulé');

      const processChartData = () => {
        if (timeRange === 'today') {
          // Group by Hour
          const hours = {};
          for (let i = 0; i < 24; i++) hours[i] = 0;
          chartOrders.forEach(o => {
            const d = new Date(o.created_at);
            hours[d.getHours()] += (o.total || 0);
          });
          return Object.keys(hours).map(h => ({ name: `${h}h`, value: hours[h] }));

        } else if (timeRange === 'week') {
          // Group by Day (Last 7 Days)
          const days = {};
          const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            days[dayNames[d.getDay()]] = 0;
          }
          chartOrders.forEach(o => {
            const d = new Date(o.created_at);
            days[dayNames[d.getDay()]] += (o.total || 0);
          });
          const result = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dayName = dayNames[d.getDay()];
            result.push({ name: dayName, value: days[dayName] || 0 });
          }
          return result;

        } else if (timeRange === 'month') {
          // Group by Day (Last 30 Days)
          const stats = {};
          // Init 30 days
          for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const key = d.getDate() + '/' + (d.getMonth() + 1); // e.g. "22/1"
            stats[key] = 0;
          }
          chartOrders.forEach(o => {
            const d = new Date(o.created_at);
            const key = d.getDate() + '/' + (d.getMonth() + 1);
            if (stats[key] !== undefined) stats[key] += (o.total || 0);
          });
          // Return array
          const result = [];
          for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const key = d.getDate() + '/' + (d.getMonth() + 1);
            result.push({ name: key, value: stats[key] || 0 });
          }
          return result;

        } else if (timeRange === 'year') {
          // Group by Month (Last 12 Months)
          const months = {};
          const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

          // Init 12 months
          for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            const key = monthNames[d.getMonth()];
            months[key] = 0;
          }

          chartOrders.forEach(o => {
            const d = new Date(o.created_at);
            const key = monthNames[d.getMonth()];
            if (months[key] !== undefined) months[key] += (o.total || 0);
          });

          // Return array in correct order
          const result = [];
          for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            const key = monthNames[d.getMonth()];
            result.push({ name: key, value: months[key] || 0 });
          }
          return result;
        }
      };

      const realChartData = processChartData();

      setStats({
        totalUsers: userCount || 0,
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
        totalRevenue: totalRevenue,
        recentOrders: recentOrders || [],
        chartData: realChartData, // Add chart data to state
        loading: false
      });

    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleOrderClick = (orderId) => {
    navigate(`/admin/orders?highlight=${orderId}`);
  };

  const exportToCSV = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      // Calculate start date based on current timeRange
      const now = new Date();
      let startDate = new Date();
      if (timeRange === 'today') startDate.setHours(0, 0, 0, 0);
      else if (timeRange === 'week') startDate.setDate(now.getDate() - 7);
      else if (timeRange === 'month') startDate.setDate(now.getDate() - 30);
      else if (timeRange === 'year') startDate.setMonth(now.getMonth() - 11);

      const { data: ordersToExport, error } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          status, 
          total, 
          user_email,
          payment_method
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!ordersToExport || ordersToExport.length === 0) {
        alert("Aucune donnée à exporter pour cette période.");
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      // Convert to CSV
      const headers = ["ID", "Date", "Status", "Total (FCFA)", "Email", "Paiement"];
      const rows = ordersToExport.map(o => [
        o.id,
        new Date(o.created_at).toLocaleString(),
        o.status,
        o.total,
        o.user_email,
        o.payment_method
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(c => `"${c}"`).join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Export error:", err);
      alert("Erreur lors de l'export.");
    } finally {
      // Re-fetch dashboard to reset loading state (or just set loading false)
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tableau de Bord</h1>
          <p className="text-gray-500 mt-1">L'état de votre boutique en temps réel.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-xs font-bold shadow-sm h-9"
            title="Télécharger les données"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Time Filters */}
          <div className="flex bg-white shadow-sm border border-gray-100 rounded-lg p-1 gap-1 h-9 items-center">
            {[
              { id: 'today', label: "Aujourd'hui" },
              { id: 'week', label: '7 Jours' },
              { id: 'month', label: '30 Jours' },
              { id: 'year', label: 'Année' }
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all h-full ${timeRange === range.id
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {range.label}
              </button>
            ))}
          </div>
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
          onClick={() => navigate('/admin/revenue')}
        />
        <KpiCard
          title="Commandes"
          value={stats.totalOrders}
          icon={<ShoppingBag size={24} className="text-white" />}
          gradient="from-purple-600 to-purple-400"
          trend="+4"
          trendUp={true}
          onClick={() => navigate('/admin/orders')}
        />
        <KpiCard
          title="Clients"
          value={stats.totalUsers}
          icon={<Users size={24} className="text-white" />}
          gradient="from-pink-600 to-pink-400"
          trend="+2"
          trendUp={true}
          onClick={() => navigate('/admin/users')}
        />
        <KpiCard
          title="Produits"
          value={stats.totalProducts}
          icon={<Package size={24} className="text-white" />}
          gradient="from-orange-600 to-orange-400"
          trend="Stock"
          trendUp={true}
          onClick={() => navigate('/admin/products')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/revenue')}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-gray-400" />
              Aperçu des Ventes
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {!stats.loading && stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
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
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                {stats.loading ? "Chargement..." : "Aucune donnée disponible"}
              </div>
            )}
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
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order.id)}
                  className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${order.status === 'paid' ? 'bg-green-100 text-green-600' :
                      order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                      <ShoppingBag size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-gray-900 truncate" title={order.user_email}>
                        {order.user_email || "Client Invité"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                        <Clock size={10} />
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right pl-3 shrink-0">
                    <p className="font-extrabold text-sm">{order.total?.toLocaleString()} F</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                      }`}>{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="w-full mt-6 py-3 text-sm font-bold text-gray-500 hover:text-black border border-dashed border-gray-200 rounded-xl hover:border-gray-400 transition-all"
          >
            Voir toutes les commandes
          </button>
        </div>
      </div>
    </div >
  );
};

// (End of file)
export default AdminDashboard;
