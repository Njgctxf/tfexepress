import { API_URL } from "./config";

/**
 * Initialise une session de paiement Jeko via le backend
 */
export async function initiateJekoPayment(orderId, amount, customerEmail) {
  try {
    console.log("💳 Initialisation du paiement via start-payment (V2)...");
    
    // Appel vers la nouvelle Supabase Edge Function (V2 pour éviter le cache)
    const response = await fetch(`${API_URL}/start-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pas de token d'auth
      },
      body: JSON.stringify({
        orderId,
        amount,
        customerEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'initialisation du paiement");
    }

    return data; // { success: true, checkoutUrl: '...' }
  } catch (error) {
    console.error("Payment API Error:", error);
    throw error;
  }
}
