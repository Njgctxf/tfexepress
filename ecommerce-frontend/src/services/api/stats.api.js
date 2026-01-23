import { supabase } from "../../lib/supabase";

export const getDashboardStats = async () => {
  try {
    // 1. FETCH COUNTS & DATA IN PARALLEL
    const [
      { count: productsCount, error: productsError },
      { count: categoriesCount, error: categoriesError },
      { count: usersCount, error: usersError },
      { data: orders, error: ordersError }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*').order('created_at', { ascending: false })
    ]);

    if (productsError) throw productsError;
    if (categoriesError) throw categoriesError;
    if (usersError) throw usersError;
    if (ordersError) throw ordersError;

    // 2. CALCULATE STATS FROM ORDERS
    const validOrders = orders.filter(o =>
      !['Annulé', 'Remboursé', 'Cancelled', 'Refunded'].includes(o.status)
    );

    const totalRevenue = validOrders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);

    // 3. RECENT ORDERS (Top 5)
    const recentOrders = orders.slice(0, 5);

    // 4. SALES DATA FOR CHART (Last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const salesData = last7Days.map(date => {
      const dayTotal = validOrders
        .filter(o => (o.created_at || "").startsWith(date))
        .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
      return { date, sales: dayTotal };
    });

    return {
      success: true,
      stats: {
        products: productsCount || 0,
        categories: categoriesCount || 0,
        orders: orders.length || 0,
        users: usersCount || 0,
        revenue: totalRevenue,
      },
      recentOrders,
      salesData
    };
  } catch (error) {
    console.error("Error calculating dashboard stats:", error);
    throw error;
  }
};
