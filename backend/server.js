import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

/* ===== ROUTES ===== */
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import returnRoutes from "./routes/return.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import syncRoutes from "./routes/sync.routes.js";


/* ===== ENV ===== */
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/* ===== __dirname ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===== MIDDLEWARES ===== */
app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser le frontend + les requêtes sans origin (apps desktop, Postman, etc.)
      if (!origin || origin === FRONTEND_URL) {
        callback(null, true);
      } else {
        // Autoriser aussi les requêtes vers /api/sync (vérification API key côté controller)
        callback(null, true);
      }
    },
    credentials: true,
  })
);
  
// Middleware spécial pour le Webhook Jeko (doit être AVANT express.json)
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===== HEALTH CHECK ===== */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API TFExpress OK (Supabase)",
    version: "1.0.0",
    endpoints: {
      categories: "/api/categories",
      products: "/api/products",
      orders: "/api/orders",
      stats: "/api/stats",
      sync: "/api/sync",
    },
  });
});

/* ===== API ROUTES ===== */
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sync", syncRoutes);


/* ===== SERVER ===== */
app.listen(PORT, () => {
  console.log(`✅ Backend lancé sur http://localhost:${PORT}`);
  console.log(`🌍 CORS autorisé pour ${FRONTEND_URL}`);
  console.log("🔄 Server reloaded via Antigravity - " + new Date().toISOString());
});

