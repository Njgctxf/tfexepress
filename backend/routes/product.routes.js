import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
} from "../controllers/product.controller.js";

import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Routes publiques
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Routes admin (à protéger plus tard avec middleware auth)
router.post("/", upload.single("image"), createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.delete("/:id/hard", hardDeleteProduct);

export default router;
