import { supabase } from "../../lib/supabase";

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

/* =====================
   CATEGORIES (Supabase)
===================== */

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Supabase error (getCategories):", error);
    return [];
  }
  return data;
}

export async function createCategory(name) {
  const slug = slugify(name);
  
  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, slug }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { success: true };
}
