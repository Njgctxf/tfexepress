import { API_URL } from "./config";

/**
 * Initialise une session de paiement Jeko via le backend
 */
export async function initiateJekoPayment(orderId, amount, customerEmail) {
  try {
    const response = await fetch(`${API_URL}/api/payments/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        amount,
        customerEmail,
        // On peut passer des successUrl/cancelUrl personnalisées ici si besoin
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
