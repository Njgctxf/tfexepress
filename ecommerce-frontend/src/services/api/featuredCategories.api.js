import { API_URL } from "./config";

/* =====================
   FEATURED CATEGORIES
===================== */

export async function getFeaturedCategories() {
  const res = await fetch(
    `${API_URL}/featured-categories`
  );
  if (!res.ok) {
    throw new Error(
      "Erreur chargement catégories mises en avant"
    );
  }
  return res.json();
}

export async function createFeaturedCategory({
  category,
  position,
  image,
}) {
  const formData = new FormData();
  formData.append("category", category);
  formData.append("position", position);
  formData.append("image", image);

  const res = await fetch(
    `${API_URL}/featured-categories`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
        "Erreur création catégorie mise en avant"
    );
  }

  return data;
}

export async function deleteFeaturedCategory(id) {
  const res = await fetch(
    `${API_URL}/featured-categories/${id}`,
    { method: "DELETE" }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
        "Erreur suppression catégorie mise en avant"
    );
  }

  return data;
}
