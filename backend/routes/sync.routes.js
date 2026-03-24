import express from "express";
import {
  syncAliexpressProducts,
  getSyncStatus,
} from "../controllers/sync.controller.js";

const router = express.Router();

// GET /api/sync/status — vérifier que l'endpoint est actif
router.get("/status", getSyncStatus);

// POST /api/sync/aliexpress — recevoir les produits
router.post("/aliexpress", syncAliexpressProducts);

export default router;
