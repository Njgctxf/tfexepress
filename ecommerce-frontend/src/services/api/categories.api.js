import { supabase } from "../../lib/supabase";

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function createCategory(category) {
  try {
    // Generate slug from name if not provided
    const slug = category.slug || category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');

    const payload = {
      name: category.name,
      slug,
      icon_key: category.icon_key || 'Grid',
      is_active: category.is_active !== undefined ? category.is_active : true
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Create category error:", err);
    throw new Error("Create failed");
  }
}

export async function updateCategory(id, updates) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Update category error:", err);
    throw err;
  }
}

export async function deleteCategory(id) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Delete category error:", err);
    throw new Error("Delete failed");
  }
}
