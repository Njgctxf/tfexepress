import { supabase } from "../../lib/supabase";

const SUPABASE_BUCKET_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images`;

/**
 * Récupère tous les produits avec filtres
 */
export async function getProducts(filters = {}) {
  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .order('created_at', { ascending: false });

  // 1. Catégorie
  if (filters.category) {
    if (!isNaN(filters.category)) {
        // ID numérique (Supabase)
        query = query.eq("category_id", filters.category);
    } 
    // Si c'est un slug (vieux code), on ignore ou on gère différemment, 
    // mais pour l'instant le frontend envoie des IDs.
  }

  // 2. Recherche
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  // 3. Featured
  if (filters.featured) {
    query = query.eq("is_featured", true);
  }

  // 4. Prix
  if (filters.minPrice) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error (getProducts):", error);
    return { success: false, data: [] };
  }

  // Mapping pour compatibilité frontend
  const formattedData = data.map(p => ({
    ...p,
    // S'assurer que 'images' est un tableau
    images: Array.isArray(p.images) ? p.images : (p.images ? JSON.parse(p.images) : [])
  }));

  return { success: true, data: formattedData };
}

/**
 * Récupère un produit par ID
 */
export async function getProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  
  return { success: true, data };
}

/**
 * Crée un produit avec support upload image
 */
export async function createProduct(productData) {
  let imageUrl = null;

  // 1. Upload Image si présent (FormData)
  if (productData instanceof FormData) {
    const file = productData.get("image");
    if (file && file instanceof File) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      imageUrl = `${SUPABASE_BUCKET_URL}/${fileName}`;
    }
    
    // Convertir FormData en Objet simple pour l'insertion DB
    const name = productData.get("name");
    const price = productData.get("price");
    const stock = productData.get("stock");
    const description = productData.get("description");
    const category_id = productData.get("category");

    productData = {
      name,
      price,
      stock,
      description,
      category_id,
      images: imageUrl ? [imageUrl] : [],
    };
  }

  // 2. Insérer dans la table
  const { data, error } = await supabase
    .from("products")
    .insert([productData])
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
}

/**
 * Met à jour un produit
 */
export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
}

/**
 * Supprime un produit
 */
export async function deleteProduct(id) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { success: true, message: "Produit supprimé" };
}

// Alias pour compatibilité
export const hardDeleteProduct = deleteProduct;

