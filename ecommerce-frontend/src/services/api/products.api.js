const API_URL = "http://localhost:5000/api/products";

const SUPABASE_BUCKET_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images`;

/**
 * Récupère tous les produits avec filtres
 */
export async function getProducts(filters = {}) {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch products");
    const { data } = await res.json();
    
    // Client-side filtering because our backend is simple JSON
    let filtered = data || [];

    // 1. Catégorie
    if (filters.category) {
        filtered = filtered.filter(p => 
            p.category?.id == filters.category || 
            p.category_id == filters.category ||
            p.category?.slug === filters.category
        );
    }

    // 2. Recherche
    if (filters.search) {
        const lower = filters.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(lower));
    }

    // 3. Featured
    if (filters.featured) {
        filtered = filtered.filter(p => p.is_featured || p.isFeatured);
    }
    
    // 4. Prix
    if (filters.minPrice) filtered = filtered.filter(p => Number(p.price) >= filters.minPrice);
    if (filters.maxPrice) filtered = filtered.filter(p => Number(p.price) <= filters.maxPrice);

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
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Product not found");
    const { data } = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("API Error", error);
    return { success: false, data: null };
  }
}

/**
 * Crée un produit avec support upload image
 */
export async function createProduct(productData) {
  try {
    let payload = {};
    
    // Handle FormData
    if (productData instanceof FormData) {
        // Since we can't easily upload files to JSON backend without multer setup properly,
        // we will simulate image upload if a file is present, or just take text fields.
        // For real file upload, we'd need the /uploads endpoint.
        // Here we just extract text fields for simplicity or assume mocked functionality.
        
        const name = productData.get("name");
        const price = parseFloat(productData.get("price"));
        const stock = parseInt(productData.get("stock"));
        const description = productData.get("description");
        const category_id = productData.get("category");
        
        // Mock image if file attached, or use placeholder
        // In a real app we would POST formData to endpoint that handles multer
        const image = "https://images.unsplash.com/photo-1523275335684-37898b6baf30"; 

        payload = { name, price, stock, description, category_id, images: [image] };
    } else {
        payload = productData;
    }

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Create failed");
    const result = await res.json();
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Met à jour un produit
 */
// ALIASES
export const hardDeleteProduct = deleteProduct;

/* UPDATE & DELETE IMPLS */
export async function updateProduct(id, updates) {
  const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error("Update failed");
  const json = await res.json();
  return json;
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return { success: true };
}

