import { API_URL } from "./config";

/**
 * Initialise une session de paiement Jeko via le backend
 */
export async function initiateJekoPayment(orderId, amount, customerEmail) {
  try {
    // Appel vers la Supabase Edge Function
    const response = await fetch(`${API_URL}/jeko-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${supabaseKey}` // Si besoin d'auth
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
