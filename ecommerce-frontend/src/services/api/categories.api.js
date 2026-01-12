const API_URL = "http://localhost:5000/api/categories";

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
  try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Fetch failed");
      return await res.json();
  } catch (err) {
      console.error(err);
      return [];
  }
}

export async function createCategory(name) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error("Create failed");
  return await res.json();
}

export async function deleteCategory(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return { success: true };
}
