import { API_URL } from "./config";

export async function getMyOrders(email) {
  if (!email) return [];
  
  const res = await fetch(`${API_URL}/orders/my-orders?email=${encodeURIComponent(email)}`);
  
  if (!res.ok) {
    throw new Error("Erreur chargement commandes");
  }
  
  return res.json();
}
