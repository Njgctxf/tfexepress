import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

import categoryRoutes from "./routes/category.routes.js";
import featuredCategoryRoutes from "./routes/featuredCategory.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import statsRoutes from "./routes/stats.routes.js";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tfexpress";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/* ===== __dirname ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===== MIDDLEWARES ===== */
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===== ROUTES ===== */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API TFExpress OK",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      categories: "/api/categories",
      featuredCategories: "/api/featured-categories",
    },
  });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/featured-categories", featuredCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);

/* ===== MONGODB ===== */
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connecté à:", MONGODB_URI))
  .catch((err) => console.error("❌ MongoDB erreur:", err));

app.listen(PORT, () => {
  console.log(`✅ Backend lancé sur http://localhost:${PORT}`);
  console.log(`🌍 CORS activé pour: ${FRONTEND_URL}`);
});
