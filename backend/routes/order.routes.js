import express from "express";
import { 
  getMyOrders, 
  getAllOrders, 
  createOrder, 
  updateOrder 
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder); // Créer une commande
router.get("/", getAllOrders); // Admin: Voir toutes les commandes
router.patch("/:id", updateOrder); // Admin: Mettre à jour une commande
router.get("/my-orders", getMyOrders); // Obtenir mes commandes

export default router;
