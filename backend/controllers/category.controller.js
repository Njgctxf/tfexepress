import { supabase } from "../config/supabase.js";

/* ===== SLUGIFY ===== */
function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

/* ===== GET ===== */
export async function getCategories(req, res) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("nom", { ascending: true });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
}

/* ===== POST ===== */
export async function createCategory(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Nom requis" });

  const slug = slugify(name);

  const { data: exists } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (exists) {
    return res.status(400).json({ message: "Catégorie existante" });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert([{ nom: name, slug }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(201).json(data);
}

/* ===== DELETE ===== */
export async function deleteCategory(req, res) {
  const { id } = req.params;

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json({ message: "Catégorie supprimée" });
}
