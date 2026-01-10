import { API_URL } from "./config.js";

/**
 * Récupère tous les produits avec filtres optionnels
 * @param {Object} filters - Filtres de recherche
 * @returns {Promise<Object>} Liste des produits
 */
export async function getProducts(filters = {}) {
  const queryParams = new URLSearchParams();

  if (filters.category) queryParams.append("category", filters.category);
  if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
  if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.featured) queryParams.append("featured", filters.featured);
  if (filters.sort) queryParams.append("sort", filters.sort);
  if (filters.page) queryParams.append("page", filters.page);
  if (filters.limit) queryParams.append("limit", filters.limit);

  const url = `${API_URL}/products${queryParams.toString() ? `?${queryParams}` : ""}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erreur lors du chargement des produits");
  
  const data = await res.json();
  return data;
}

/**
 * Récupère un produit par son ID
 * @param {string} id - ID du produit
 * @returns {Promise<Object>} Produit
 */
export async function getProductById(id) {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) throw new Error("Produit non trouvé");
  
  const data = await res.json();
  return data;
}

/**
 * Crée un nouveau produit
 * @param {Object} product - Données du produit
 * @returns {Promise<Object>} Produit créé
 */
export async function createProduct(product) {
  const isFormData = product instanceof FormData;
  
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: isFormData ? {} : {
      "Content-Type": "application/json",
    },
    body: isFormData ? product : JSON.stringify(product),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de la création du produit");

  return data;
}

/**
 * Met à jour un produit existant
 * @param {string} id - ID du produit
 * @param {Object} product - Nouvelles données
 * @returns {Promise<Object>} Produit mis à jour
 */
export async function updateProduct(id, product) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour");

  return data;
}

/**
 * Supprime un produit (soft delete)
 * @param {string} id - ID du produit
 * @returns {Promise<Object>} Confirmation
 */
export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");

  return data;
}

/**
 * Supprime définitivement un produit (hard delete)
 * @param {string} id - ID du produit
 * @returns {Promise<Object>} Confirmation
 */
export async function hardDeleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}/hard`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");

  return data;
}

