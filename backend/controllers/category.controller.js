import { supabase } from "../config/supabase.js";

/* ===== GET ===== */
export async function getCategories(req, res) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

/* ===== POST ===== */
export async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Nom requis" });

    const slug = name.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, '-');

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, slug }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Erreur création", error: error.message });
  }
}

/* ===== DELETE ===== */
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Catégorie supprimée" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Erreur suppression", error: error.message });
  }
}
