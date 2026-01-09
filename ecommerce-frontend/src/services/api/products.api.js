const API_URL = "http://localhost:5000/api";

export async function getProducts() {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error("Erreur chargement produits");
  return res.json();
}

export async function createProduct(product) {
  const formData = new FormData();

  formData.append("name", product.name);
  formData.append("price", product.price);
  formData.append("stock", product.stock);
  formData.append("category", product.category);
  formData.append("description", product.description || "");

  if (product.image) {
    formData.append("image", product.image);
  }

  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur création produit");

  return data;
}
