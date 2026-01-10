import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDashboardStats = async (req, res) => {
  try {
    let productCount = 0;
    let categoryCount = 0;

    try {
      productCount = await Product.countDocuments();
      categoryCount = await Category.countDocuments();
    } catch (e) {
      console.warn("MongoDB unavailable, using JSON fallback for stats");
      const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/products.json"), "utf8"));
      const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/categories.json"), "utf8"));
      productCount = productsData.length;
      categoryCount = categoriesData.length;
    }
    
    // Données simulées pour le reste
    const orderCount = 54; 
    const userCount = 312;
    const totalRevenue = 1250000;

    res.json({
      success: true,
      stats: {
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
        users: userCount,
        revenue: totalRevenue
      },
      recentOrders: [
        { id: "#TF-1021", client: "Jean Kouassi", total: "45 000 FCFA", status: "Payé", date: "05 Jan 2026" },
        { id: "#TF-1022", client: "Aïcha Traoré", total: "28 500 FCFA", status: "En attente", date: "05 Jan 2026" },
        { id: "#TF-1023", client: "Marc Yao", total: "120 000 FCFA", status: "Annulé", date: "04 Jan 2026" }
      ],
      salesData: [
        { day: "Lun", sales: 120000 },
        { day: "Mar", sales: 98000 },
        { day: "Mer", sales: 150000 },
        { day: "Jeu", sales: 80000 },
        { day: "Ven", sales: 200000 },
        { day: "Sam", sales: 175000 },
        { day: "Dim", sales: 220000 }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
