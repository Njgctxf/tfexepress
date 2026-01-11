import { supabase } from "../config/supabase.js";

/* =========================
   GET ALL PRODUCTS
========================= */
export async function getAllProducts(req, res) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        nom
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json({
    success: true,
    data,
  });
}

/* =========================
   GET PRODUCT BY ID
========================= */
export async function getProductById(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        nom
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ message: "Produit introuvable" });
  }

  res.json({ success: true, data });
}

/* =========================
   CREATE PRODUCT
========================= */
export async function createProduct(req, res) {
  const {
    name,
    description,
    price,
    stock,
    category_id,
    images = [],
  } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name,
        description,
        price,
        stock,
        category_id,
        images,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(201).json({ success: true, data });
}

/* =========================
   UPDATE PRODUCT
========================= */
export async function updateProduct(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .update(req.body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json({ success: true, data });
}

/* =========================
   DELETE PRODUCT (SOFT)
========================= */
export async function deleteProduct(req, res) {
  const { id } = req.params;

  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json({ message: "Produit supprimé" });
}
