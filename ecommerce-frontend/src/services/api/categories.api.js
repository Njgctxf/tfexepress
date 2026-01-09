import { API_URL } from "./config";

/* =====================
   CATEGORIES
===================== */

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) {
    throw new Error("Erreur chargement catégories");
  }
  return res.json();
}

export async function createCategory(name) {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Erreur création catégorie"
    );
  }

  return data;
}

export async function deleteCategory(id) {
  const res = await fetch(
    `${API_URL}/categories/${id}`,
    { method: "DELETE" }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Erreur suppression catégorie"
    );
  }

  return data;
}
