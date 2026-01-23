import crypto from "crypto";
import { supabase } from "../config/supabase.js";

const JEKO_API_URL = "https://api.jeko.africa/partner_api";

/**
 * Crée une session de paiement (Checkout) avec Jeko
 */
export async function createCheckout(req, res) {
  try {
    const { orderId, amount, customerEmail, successUrl, cancelUrl } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: "ID de commande et montant requis" });
    }

    // Préparation du payload pour Jeko
    // Note: Jeko utilise amountCents (ex: 1000 pour 10 FCFA)
    const payload = {
      amountCents: Math.round(amount), // Si vos prix sont déjà en centimes ou si Jeko veut l'unité, à vérifier. 
                                        // Ici on assume que 'amount' est la valeur finale car vous avez dit 5000 = 5000 dans votre exemple.
      currency: "XOF",
      reference: String(orderId),
      storeId: process.env.JEKO_STORE_ID,
      paymentDetails: {
        type: "redirect",
        data: {
          successUrl: successUrl || `${process.env.FRONTEND_URL}/order-success?id=${orderId}`,
          errorUrl: cancelUrl || `${process.env.FRONTEND_URL}/order-error?id=${orderId}`
        }
      }
    };

    console.log("[JEKO] Création checkout pour commande:", orderId);

    const response = await fetch(`${JEKO_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.JEKO_API_KEY,
        "X-API-KEY-ID": process.env.JEKO_API_KEY_ID
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[JEKO] Erreur API:", data);
      return res.status(response.status).json({
        message: "Erreur lors de la communication avec Jeko",
        details: data
      });
    }

    // Jeko renvoie généralement un checkoutUrl ou similaire
    res.json({
      success: true,
      checkoutUrl: data.checkoutUrl || data.url, // Vérifier le nom exact dans la réponse
      jekoData: data
    });

  } catch (error) {
    console.error("[JEKO] Exception:", error);
    res.status(500).json({ message: "Erreur serveur paiement", error: error.message });
  }
}

/**
 * Gère les notifications de paiement (Webhooks)
 */
export async function handleWebhook(req, res) {
  const signature = req.headers["jeko-signature"];
  const secret = process.env.JEKO_WEBHOOK_SECRET;

  try {
    // 1. Vérification de la signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(req.body); // req.body doit être le RAW body (Buffer)
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
      console.error("[WEBHOOK] Signature invalide");
      return res.status(401).send("Invalid signature");
    }

    // 2. Parser le payload (Buffer -> JSON)
    const payload = JSON.parse(req.body.toString());
    const { event, data } = payload;

    console.log(`[WEBHOOK] Événement reçu: ${event}`);

    // 3. Traitement de la transaction complétée
    if (event === "transaction.completed") {
      const orderId = data.transactionDetails?.reference;
      const status = data.status; // "success" ou "error"

      if (status === "success" && orderId) {
        console.log(`[WEBHOOK] Paiement réussi pour la commande: ${orderId}`);

        // Mettre à jour la commande dans Supabase
        const { error } = await supabase
          .from("orders")
          .update({ 
            status: "Payé",
            payment_id: data.id,
            metadata: { 
              ...data,
              payment_confirmed_at: new Date().toISOString()
            }
          })
          .eq("id", orderId);

        if (error) {
          console.error("[WEBHOOK] Erreur mise à jour commande:", error);
          return res.status(500).send("DB Error");
        }
      }
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error("[WEBHOOK] Erreur critique:", error);
    res.status(500).send("Internal Server Error");
  }
}
