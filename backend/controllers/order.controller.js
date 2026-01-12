import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// import Order from "../models/Order.js"; // Pas de modèle Order encore défini mais on prépare

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/orders.json");

/* ===== GET ALL ORDERS (ADMIN) ===== */
export async function getAllOrders(req, res) {
  try {
    const orders = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    // Sort by date/id descending
    orders.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

/* ===== GET MY ORDERS ===== */
export async function getMyOrders(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
       return res.status(400).json({ message: "Email requis" });
    }

    const allOrders = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    const userOrders = allOrders.filter(order => order.user_email === email);
    
    // Sort descending
    userOrders.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));

    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

/* ===== CREATE ORDER ===== */
export async function createOrder(req, res) {
  try {
    const { user_email, items, total, shipping_address, payment_method } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Panier vide" });
    }

    const allOrders = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

    const newOrder = {
      id: `ord_${Date.now()}`,
      user_email: user_email || "guest@example.com",
      items,
      total,
      shipping_address,
      payment_method,
      status: "En cours",
      created_at: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0], // Compatible with old format
      tracking_number: "",
      tracking_url: ""
    };

    allOrders.push(newOrder);
    fs.writeFileSync(DATA_PATH, JSON.stringify(allOrders, null, 2));

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Erreur lors de la création de la commande" });
  }
}

/* ===== UPDATE ORDER (ADMIN) ===== */
export async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allOrders = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    const orderIndex = allOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const updatedOrder = { ...allOrders[orderIndex], ...updates };
    allOrders[orderIndex] = updatedOrder;

    fs.writeFileSync(DATA_PATH, JSON.stringify(allOrders, null, 2));

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
}
