import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import categoryRoutes from "./routes/category.routes.js";
import featuredCategoryRoutes from "./routes/featuredCategory.routes.js";

const app = express();
const PORT = 5000;

/* ===== __dirname ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===== MIDDLEWARES ===== */
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/featured-categories", featuredCategoryRoutes);
/* ===== ROUTES ===== */
app.get("/", (req, res) => {
  res.send("🚀 API TFExpress OK");
});

app.use("/api/categories", categoryRoutes);

/* ===== MONGODB ===== */
mongoose
  .connect("mongodb://127.0.0.1:27017/tfexpress")
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ MongoDB erreur", err));

app.listen(PORT, () => {
  console.log(`✅ Backend lancé sur http://localhost:${PORT}`);
});
