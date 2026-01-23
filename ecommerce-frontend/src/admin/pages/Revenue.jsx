import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, ShoppingBag, CreditCard, PieChart as PieIcon, BarChart2, ArrowUpRight, Package, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, Label } from 'recharts';
import { supabase } from "../../lib/supabase";
import KpiCard from "../components/KpiCard";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 text-sm">
                <p className="font-bold text-gray-900 mb-1">{label}</p>
                <p className="font-medium text-indigo-600">
                    {typeof payload[0].value === 'number'
                        ? payload[0].value.toLocaleString() + (payload[0].name === 'revenue' ? ' F' : '')
                        : payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

export default function Revenue() {
    const [timeRange, setTimeRange] = useState('week'); // 'today' | 'week' | 'month' | 'year'
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageBasket: 0,
        chartData: [],
        statusData: [],
        topProductsData: [],
        loading: true
    });

    useEffect(() => {
        fetchRevenueData();
    }, [timeRange]);

    const exportToCSV = async () => {
        try {
            setStats(prev => ({ ...prev, loading: true }));
            const now = new Date();
            let startDate = new Date();
            if (timeRange === 'today') startDate.setHours(0, 0, 0, 0);
            else if (timeRange === 'week') startDate.setDate(now.getDate() - 7);
            else if (timeRange === 'month') startDate.setDate(now.getDate() - 30);
            else if (timeRange === 'year') startDate.setMonth(now.getMonth() - 11);

            const { data: ordersToExport, error } = await supabase
                .from('orders')
                .select('id, created_at, status, total, user_email, payment_method')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!ordersToExport || ordersToExport.length === 0) {
                alert("Aucune donnée à exporter.");
                setStats(prev => ({ ...prev, loading: false }));
                return;
            }

            const headers = ["ID", "Date", "Status", "Total (FCFA)", "Email", "Paiement"];
            const rows = ordersToExport.map(o => [
                o.id,
                new Date(o.created_at).toLocaleString(),
                o.status,
                o.total,
                o.user_email,
                o.payment_method
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `revenue_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Export error:", err);
            alert("Erreur lors de l'export.");
        } finally {
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    const fetchRevenueData = async () => {
        try {
            // 1. Determine Date Range
            const now = new Date();
            let startDate = new Date();
            if (timeRange === 'today') startDate.setHours(0, 0, 0, 0);
            else if (timeRange === 'week') startDate.setDate(now.getDate() - 7);
            else if (timeRange === 'month') startDate.setDate(now.getDate() - 30);
            else if (timeRange === 'year') {
                startDate.setMonth(now.getMonth() - 11);
                startDate.setDate(1);
            }

            const { data: allOrders } = await supabase
                .from('orders')
                .select('total, status, created_at, items')
                .gte('created_at', startDate.toISOString())
                .neq('status', 'cancelled')
                .neq('status', 'Annulé');

            if (!allOrders) {
                setStats(prev => ({ ...prev, loading: false }));
                return;
            }

            // --- CALCULATIONS ---
            const validOrders = allOrders.filter(o => o.status !== 'cancelled' && o.status !== 'Annulé'); // Redundant check but safe
            const totalRevenue = validOrders.reduce((acc, order) => acc + (order.total || 0), 0);
            const totalOrdersCount = validOrders.length;
            const averageBasket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

            // --- CHART 1: PIE CHART (Status) ---
            const statusCounts = {};
            validOrders.forEach(o => {
                const s = o.status || 'Inconnu';
                statusCounts[s] = (statusCounts[s] || 0) + 1;
            });
            const statusData = Object.keys(statusCounts).map(key => ({
                name: key,
                value: statusCounts[key]
            }));

            // --- CHART 2: TOP PRODUCTS LIST (Aggregated) ---
            const productStats = {};
            validOrders.forEach(order => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const name = item.name || "Produit Inconnu";
                        if (!productStats[name]) {
                            productStats[name] = {
                                name, revenue: 0, count: 0,
                                image: item.image || (item.images && item.images[0]) || null
                            };
                        }
                        const qty = item.quantity || 1;
                        productStats[name].revenue += (item.price || 0) * qty;
                        productStats[name].count += qty;
                    });
                }
            });
            const topProductsData = Object.values(productStats)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            // --- CHART 3: AREA CHART (Dynamic Pattern) ---
            let chartData = [];

            if (timeRange === 'today') {
                const hours = {};
                for (let i = 0; i < 24; i++) hours[i] = 0;
                validOrders.forEach(o => {
                    hours[new Date(o.created_at).getHours()] += (o.total || 0);
                });
                chartData = Object.keys(hours).map(h => ({ name: `${h}h`, value: hours[h] }));

            } else if (timeRange === 'week') {
                const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
                const days = {};
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(); d.setDate(now.getDate() - i);
                    days[dayNames[d.getDay()]] = 0;
                }
                validOrders.forEach(o => {
                    days[dayNames[new Date(o.created_at).getDay()]] += (o.total || 0);
                });
                chartData = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(); d.setDate(now.getDate() - i);
                    const dh = dayNames[d.getDay()];
                    chartData.push({ name: dh, value: days[dh] });
                }

            } else if (timeRange === 'month') {
                const statsMap = {};
                for (let i = 29; i >= 0; i--) {
                    const d = new Date(); d.setDate(now.getDate() - i);
                    const key = d.getDate() + '/' + (d.getMonth() + 1);
                    statsMap[key] = 0;
                }
                validOrders.forEach(o => {
                    const d = new Date(o.created_at);
                    const key = d.getDate() + '/' + (d.getMonth() + 1);
                    if (statsMap[key] !== undefined) statsMap[key] += (o.total || 0);
                });
                chartData = [];
                for (let i = 29; i >= 0; i--) {
                    const d = new Date(); d.setDate(now.getDate() - i);
                    const key = d.getDate() + '/' + (d.getMonth() + 1);
                    chartData.push({ name: key, value: statsMap[key] });
                }

            } else if (timeRange === 'year') {
                const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
                const months = {};
                for (let i = 11; i >= 0; i--) {
                    const d = new Date(); d.setMonth(now.getMonth() - i);
                    months[monthNames[d.getMonth()]] = 0;
                }
                validOrders.forEach(o => {
                    const d = new Date(o.created_at);
                    const key = monthNames[d.getMonth()];
                    if (months[key] !== undefined) months[key] += (o.total || 0);
                });
                chartData = [];
                for (let i = 11; i >= 0; i--) {
                    const d = new Date(); d.setMonth(now.getMonth() - i);
                    const key = monthNames[d.getMonth()];
                    chartData.push({ name: key, value: months[key] });
                }
            }

            setStats({
                totalRevenue,
                totalOrders: totalOrdersCount,
                averageBasket,
                chartData,
                statusData,
                topProductsData,
                loading: false
            });

        } catch (error) {
            console.error("Error fetching revenue:", error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    if (stats.loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Modern, Premium Color Palette
    const PIE_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Revenus & Analytiques
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Suivi détaillé de votre chiffre d'affaires
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-xs font-bold shadow-sm h-9"
                    >
                        <Download size={14} />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                    title="Revenu Total"
                    value={`${stats.totalRevenue.toLocaleString()} F`}
                    icon={<DollarSign size={24} className="text-white" />}
                    gradient="from-blue-600 to-indigo-600"
                    trend="+12.5%"
                    trendUp={true}
                />
                <KpiCard
                    title="Nombre de Commandes"
                    value={`${stats.totalOrders}`}
                    icon={<ShoppingBag size={24} className="text-white" />}
                    gradient="from-emerald-500 to-teal-500"
                    trend=""
                    trendUp={true}
                />
                <KpiCard
                    title="Panier Moyen"
                    value={`${stats.averageBasket.toLocaleString(undefined, { maximumFractionDigits: 0 })} F`}
                    icon={<CreditCard size={24} className="text-white" />}
                    gradient="from-violet-600 to-purple-600"
                    trend="+2.4%"
                    trendUp={true}
                />
            </div>

            {/* MAIN CHART - AREA */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={22} className="text-indigo-600" />
                            Évolution du Chiffre d'Affaires
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Revenus ({timeRange})</p>
                    </div>
                </div>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#4F46E5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSales)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* SECONDARY GRIDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* DONUT CHART - STATUS */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                        <PieIcon size={22} className="text-indigo-600" />
                        État des Commandes
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mb-8">Répartition par statut actuel</p>

                    <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} cornerRadius={6} />
                                    ))}
                                    <Label
                                        value={stats.statusData.reduce((acc, curr) => acc + curr.value, 0)}
                                        position="center"
                                        className="text-3xl font-black fill-gray-900"
                                    />
                                    <Label
                                        value="Commandes"
                                        position="center"
                                        dy={25}
                                        className="text-xs font-bold fill-gray-400 uppercase tracking-wider"
                                    />
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-sm font-bold text-gray-600 ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* HORIZONTAL BAR CHART - PRODUCTS */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                        <BarChart2 size={22} className="text-indigo-600" />
                        Top Produits
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mb-8">Les 5 produits les plus vendus</p>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[300px]">
                        {stats.topProductsData.map((product, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                                {/* RANK */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                            'bg-white text-gray-400 border border-gray-100'
                                    }`}>
                                    {index + 1}
                                </div>

                                {/* IMAGE */}
                                <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 p-1 flex-shrink-0">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain rounded-lg" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                                            <Package size={16} className="text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* INFO */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate" title={product.name}>
                                        {product.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                                        {product.count} vente{product.count > 1 ? 's' : ''}
                                    </p>
                                </div>

                                {/* REVENUE */}
                                <div className="text-right">
                                    <p className="font-bold text-indigo-600 text-sm">
                                        {(product.revenue / 1000).toFixed(1)}k
                                    </p>
                                    <div className="w-16 bg-gray-100 rounded-full h-1.5 mt-1.5 ml-auto overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(product.revenue / stats.topProductsData[0].revenue) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
