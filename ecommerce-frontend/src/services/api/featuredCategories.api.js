import { supabase } from "../../lib/supabase";

/* =====================
   FEATURED CATEGORIES
===================== */

const uploadToStorage = async (file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `featured/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products') // Using the same bucket for simplicity
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Failed to upload featured image:', error);
    return null;
  }
};

export async function getFeaturedCategories() {
  const { data, error } = await supabase
    .from('featured_categories')
    .select('*, category:categories(id, name)')
    .order('position');

  if (error) {
    console.error("Erreur chargement catégories mises en avant:", error);
    throw new Error("Erreur chargement catégories mises en avant");
  }
  return data;
}

export async function createFeaturedCategory({
  category,
  position,
  image,
}) {
  try {
    let imageUrl = image;
    if (image instanceof File) {
      imageUrl = await uploadToStorage(image);
    }

    const payload = {
       category_id: typeof category === 'object' ? category.id : category,
       position: Number(position),
       image_url: imageUrl
    };

    const { data, error } = await supabase
      .from('featured_categories')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur création catégorie mise en avant:", error);
    throw error;
  }
}

export async function deleteFeaturedCategory(id) {
  const { error } = await supabase
    .from('featured_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Erreur suppression catégorie mise en avant:", error);
    throw new Error("Erreur suppression catégorie mise en avant");
  }

  return { success: true };
}
