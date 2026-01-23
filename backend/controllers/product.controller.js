import { supabase } from "../config/supabase.js";

/* =========================
   GET ALL PRODUCTS
========================= */
/* =========================
   GET ALL PRODUCTS
========================= */
export async function getAllProducts(req, res) {
  try {
    // 1. Fetch Products & Orders in parallel
    const [productsRes, ordersRes] = await Promise.all([
      supabase.from("products").select("*, category:categories(*)").order("created_at", { ascending: false }),
      supabase.from("orders").select("items, status") // We only need items and status
    ]);

    if (productsRes.error) throw productsRes.error;
    if (ordersRes.error) throw ordersRes.error;

    const products = productsRes.data;
    const orders = ordersRes.data;

    // 2. Aggregate Sales (count 'sold' items)
    const salesMap = {};

    orders.forEach(order => {
      // Exclude cancelled/refunded orders
      if (['Annulé', 'Remboursé', 'Cancelled', 'Refunded'].includes(order.status)) return;

      let items = order.items;
      // Safety check if items is a string (double encoded)
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch (e) { }
      }

      if (Array.isArray(items)) {
        items.forEach(item => {
          const pId = item.id || item._id || item.productId;
          const qty = Number(item.qty || item.quantity || 0);

          if (pId && qty > 0) {
            const key = String(pId);
            salesMap[key] = (salesMap[key] || 0) + qty;
          }
        });
      }
    });

    // 3. Attach 'sold' count to products
    const productsWithStats = products.map(p => ({
      ...p,
      sold: salesMap[String(p.id)] || salesMap[String(p._id)] || 0
    }));

    res.json({ success: true, data: productsWithStats });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
}

/* =========================
   GET PRODUCT BY ID
========================= */
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("id", id)
      .single();

    if (error || !product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/* =========================
   CREATE PRODUCT
========================= */
export async function createProduct(req, res) {
  try {
    const { name, description, price, stock, category_id, images = [] } = req.body;

    const { data, error } = await supabase
      .from("products")
      .insert([{
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category_id,
        images
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: error.message });
  }
}

/* =========================
   UPDATE PRODUCT
========================= */
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;

    // Whitelist allowed fields to prevent "unknown column" errors
    // (e.g. frontend sends 'category' object which is not a column)
    const { name, description, price, stock, category_id, images, brand } = req.body;

    const updates = {
      name,
      description,
      price,
      stock,
      category_id,
      images,
      brand
    };

    // Remove undefined keys (if some fields are not sent)
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.message });
  }
}

/* =========================
   DELETE PRODUCT
========================= */
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Produit supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
