import { supabase } from "../../lib/supabase";

// Helper: Resize and convert to Base64 (kept as is)
const resizeImage = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 800; // Limit width to keep size down
      const scale = MAX_WIDTH / img.width;

      if (scale < 1) {
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Compress to JPEG 0.7 quality
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
  };
  reader.onerror = (err) => resolve(null);
});

/**
 * Récupère tous les produits avec filtres
 */
export async function getProducts(filters = {}) {
  try {
    let selectQuery = filters.select || `*, category:categories(id, name)`;
    let query = supabase.from('products').select(selectQuery);

    // Pagination
    if (filters.page && filters.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    // Count total rows for pagination
    if (filters.count) {
      query = query.select('*', { count: 'exact', head: true });
      const { count, error } = await query;
      return { success: !error, count: count || 0 };
    }

    // 1. Recherche
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // 2. Prix
    if (filters.minPrice) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice) query = query.lte('price', filters.maxPrice);

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data || [];

    // 3. Client-side filtering for complex fields if needed (e.g. category ID match)
    if (filters.category) {
      filtered = filtered.filter(p =>
        String(p.category_id) === String(filters.category) ||
        p.category?.id === filters.category
      );
    }

    // 4. Featured
    if (filters.featured) {
      filtered = filtered.filter(p => p.is_featured);
    }

    // 5. Brand (Fuzzy)
    if (filters.brand) {
      const b = filters.brand.toLowerCase();
      filtered = filtered.filter(p =>
        (p.brand && p.brand.toLowerCase() === b) ||
        (p.name && p.name.toLowerCase().includes(b))
      );
    }

    return { success: true, data: filtered };
  } catch (error) {
    console.error("API error (getProducts):", error);
    return { success: false, data: [] };
  }
}

/**
 * Récupère un produit par ID
 */
export async function getProductById(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name)')
      .eq('id', id) // Assumes numeric ID or UUID
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("API Error", error);
    return { success: false, data: null };
  }
}

// Helper: Upload file to Supabase Storage and get URL
// Requires a public bucket named 'products'
const uploadToStorage = async (file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Failed to upload image:', error);
    return null; // Fallback or handle error
  }
};

/**
 * Crée un produit avec support Storage (URL)
 */
export async function createProduct(productData) {
  try {
    // 1. Process Images (Upload to Storage)
    const processedImages = [];
    if (Array.isArray(productData.images)) {
      for (const item of productData.images) {
        if (item instanceof File) {
          // Upload to Supabase Storage
          const url = await uploadToStorage(item);
          if (url) processedImages.push(url);
        } else if (typeof item === 'string') {
          // Keep existing URLs (or Base64 if any legacy remained, but likely URLs now)
          processedImages.push(item);
        }
      }
    }

    // 2. Prepare Payload
    const payload = {
      name: productData.name,
      description: productData.description || '',
      price: Number(productData.price),
      stock: Number(productData.stock),
      brand: productData.brand,
      category_id: typeof productData.category === 'object' ? productData.category.id : productData.category,
      images: processedImages,
      sizes: typeof productData.sizes === 'string' ? productData.sizes.split(',').map(s => s.trim()).filter(Boolean) : (productData.sizes || null),
      is_featured: productData.is_featured || false,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    throw error;
  }
}

/**
 * Met à jour un produit
 */
export async function updateProduct(id, updates) {
  try {
    // 1. Process Images
    const processedImages = [];
    if (Array.isArray(updates.images)) {
      for (const item of updates.images) {
        if (item instanceof File) {
          // Upload new file
          const url = await uploadToStorage(item);
          if (url) processedImages.push(url);
        } else if (typeof item === 'string') {
          // Keep existing URL
          processedImages.push(item);
        }
      }
    }

    // 2. Prepare Payload
    const payload = {};
    if (updates.name) payload.name = updates.name;
    if (updates.description) payload.description = updates.description;
    if (updates.price) payload.price = Number(updates.price);
    if (updates.stock) payload.stock = Number(updates.stock);
    if (updates.brand) payload.brand = updates.brand;
    if (updates.is_featured !== undefined) payload.is_featured = updates.is_featured;
    if (updates.sizes) {
      payload.sizes = typeof updates.sizes === 'string' ? updates.sizes.split(',').map(s => s.trim()).filter(Boolean) : updates.sizes;
    }

    // Update category IDs
    if (updates.category) {
      payload.category_id = typeof updates.category === 'object' ? updates.category.id : updates.category;
    }

    // Update images logic:
    // If we have processed images, replace key. 
    // If user sent empty array explicitly, clear it.
    if (processedImages.length > 0) {
      payload.images = processedImages;
    } else if (updates.images && updates.images.length === 0) {
      payload.images = [];
    }

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    throw error;
  }
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw new Error("Delete failed");
  return { success: true };
}


export async function getProductsCount(filters = {}) {
  try {
    let query = supabase.from('products').select('*', { count: 'exact', head: true });
    // Apply search filter if present
    if (filters.search) query = query.ilike('name', `%${filters.search}%`);

    const { count, error } = await query;
    if (error) throw error;
    return count;
  } catch (e) {
    return 0;
  }
}

// Aliases
export const hardDeleteProduct = deleteProduct;
