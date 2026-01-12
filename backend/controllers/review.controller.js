import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REVIEWS_PATH = path.join(__dirname, "../data/reviews.json");

/* ===== GET REVIEWS BY PRODUCT ID ===== */
export async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;
    if (!fs.existsSync(REVIEWS_PATH)) {
        return res.json([]);
    }
    const reviews = JSON.parse(fs.readFileSync(REVIEWS_PATH, "utf8"));
    const productReviews = reviews.filter(r => r.product_id == productId);
    res.json(productReviews);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

/* ===== ADD REVIEW ===== */
export async function addReview(req, res) {
  try {
    const { product_id, user_name, rating, comment } = req.body;
    
    if (!product_id || !rating) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    if (!fs.existsSync(REVIEWS_PATH)) {
        fs.writeFileSync(REVIEWS_PATH, JSON.stringify([]));
    }

    const reviews = JSON.parse(fs.readFileSync(REVIEWS_PATH, "utf8"));
    
    const newReview = {
        id: `rev_${Date.now()}`,
        product_id: Number(product_id), // Ensure number
        user_name: user_name || "Anonyme",
        rating: Number(rating),
        comment,
        date: new Date().toISOString().split('T')[0]
    };

    reviews.unshift(newReview); // Add to top
    fs.writeFileSync(REVIEWS_PATH, JSON.stringify(reviews, null, 2));

    res.json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}
