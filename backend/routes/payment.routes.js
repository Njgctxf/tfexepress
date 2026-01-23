import express from "express";
import { createCheckout, handleWebhook } from "../controllers/payment.controller.js";

const router = express.Router();

// Route pour initier un paiement
router.post("/checkout", createCheckout);

// Route pour le webhook (Jeko nous envoie les confirmations ici)
// Note: Le "raw body" est géré dans server.js pour cette route spécifique
router.post("/webhook", handleWebhook);

export default router;
