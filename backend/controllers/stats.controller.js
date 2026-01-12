import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_PATH = path.join(__dirname, "../data/products.json");
const CATEGORIES_PATH = path.join(__dirname, "../data/categories.json");
const ORDERS_PATH = path.join(__dirname, "../data/orders.json");
const PROFILES_PATH = path.join(__dirname, "../data/profiles.json");

export const getDashboardStats = async (req, res) => {
  try {
    // 1. READ DATAS
    const products = fs.existsSync(PRODUCTS_PATH) ? JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8")) : [];
    const categories = fs.existsSync(CATEGORIES_PATH) ? JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf8")) : [];
    const orders = fs.existsSync(ORDERS_PATH) ? JSON.parse(fs.readFileSync(ORDERS_PATH, "utf8")) : [];
    const users = fs.existsSync(PROFILES_PATH) ? JSON.parse(fs.readFileSync(PROFILES_PATH, "utf8")) : [];

    // 2. CALCULATE STATS
    const totalRevenue = orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
    
    // 3. RECENT ORDERS (Last 5)
    // Sort usually by Date descending. Assuming 'createdAt' or 'date' exists.
    // If not, just take the last ones if appended.
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
        .slice(0, 5);

    // 4. SALES DATA FOR CHART (Last 7 days, or mock distribution)
    // We can group orders by day for the last 7 days.
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const salesData = last7Days.map(date => {
        const dayTotal = orders
            .filter(o => (o.date || o.created_at || "").startsWith(date))
            .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
        return { date, sales: dayTotal };
    });

    res.json({
      success: true,
      stats: {
        products: products.length,
        categories: categories.length,
        orders: orders.length,
        users: users.length,
        revenue: totalRevenue,
      },
      recentOrders,
      salesData
    });

  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
