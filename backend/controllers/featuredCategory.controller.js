import { supabase } from "../config/supabase.js";

/* =====================
   GET FEATURED CATEGORIES
===================== */
export const getFeaturedCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("featured_categories")
      .select(`
        *,
        categories ( id, name )
      `)
      .eq("active", true)
      .order("position");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================
   CREATE FEATURED CATEGORY
===================== */
export const createFeaturedCategory = async (req, res) => {
  try {
    const { category_id, position, image } = req.body;

    const { error } = await supabase
      .from("featured_categories")
      .insert([{ category_id, position, image, active: true }]);

    if (error) throw error;

    res.status(201).json({ message: "Catégorie vedette ajoutée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================
   DELETE FEATURED CATEGORY
===================== */
export const deleteFeaturedCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("featured_categories")
      .update({ active: false })
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Catégorie supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
