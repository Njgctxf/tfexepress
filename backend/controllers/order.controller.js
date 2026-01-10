import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// import Order from "../models/Order.js"; // Pas de modèle Order encore défini mais on prépare

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/orders.json");

/* ===== GET MY ORDERS ===== */
export async function getMyOrders(req, res) {
  try {
    const { email } = req.query; // On passe l'email en query param pour simplifier (mock auth)

    if (!email) {
       return res.status(400).json({ message: "Email requis" });
    }

    // JSON Fallback direct car pas de Mongo
    console.warn("Using JSON fallback for getMyOrders");
    const allOrders = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    
    const userOrders = allOrders.filter(order => order.user_email === email);
    
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}
