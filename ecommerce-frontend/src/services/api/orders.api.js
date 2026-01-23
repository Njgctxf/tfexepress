import { API_URL } from "./config";

export async function getMyOrders(email) {
  if (!email) return [];

  const res = await fetch(`${API_URL}/orders/my-orders?email=${encodeURIComponent(email)}`);

  if (!res.ok) {
    throw new Error("Erreur chargement commandes");
  }

  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la création de la commande");
  }

  return res.json();
}

export async function updateOrder(id, updates) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la mise à jour de la commande");
  }

  return res.json();
}


