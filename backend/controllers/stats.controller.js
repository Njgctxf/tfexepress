import { supabase } from "../config/supabase.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [{ count: products }, { count: categories }] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
    ]);

    res.json({
      success: true,
      stats: {
        products,
        categories,
        orders: 0,
        users: 0,
        revenue: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
