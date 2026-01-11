import express from "express";
import { getMyOrders } from "../controllers/order.controller.js";

const router = express.Router();

// Route protégée (en théorie, on devrait ajouter un middleware d'auth ici)
router.get("/my-orders", getMyOrders);

export default router;
