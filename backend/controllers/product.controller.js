import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_PATH = path.join(__dirname, "../data/products.json");
const CATEGORIES_PATH = path.join(__dirname, "../data/categories.json");

/* =========================
   GET ALL PRODUCTS
========================= */
export async function getAllProducts(req, res) {
  try {
    if (!fs.existsSync(PRODUCTS_PATH)) return res.json({ success: true, data: [] });
    
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
    const categories = fs.existsSync(CATEGORIES_PATH) ? JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf8")) : [];
    
    // Map categories to products
    const enrichedProducts = products.map(p => {
        // Find category by ID (check both id and _id fields)
        const cat = categories.find(c => (c.id == p.category || c._id == p.category || c.id == p.category_id));
        return {
            ...p,
            category: cat ? { id: cat.id || cat._id, nom: cat.name || cat.nom } : null,
            // Ensure numeric price for frontend
            price: Number(p.price)
        };
    });

    res.json({ success: true, data: enrichedProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/* =========================
   GET PRODUCT BY ID
========================= */
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
    const product = products.find(p => p.id == id);
    
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    // Enrich category
    const categories = fs.existsSync(CATEGORIES_PATH) ? JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf8")) : [];
    const cat = categories.find(c => (c.id == product.category || c._id == product.category || c.id == product.category_id));
    
    res.json({ 
        success: true, 
        data: {
            ...product,
            category: cat ? { id: cat.id || cat._id, nom: cat.name || cat.nom } : null,
            price: Number(product.price)
        }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/* =========================
   CREATE PRODUCT
========================= */
export async function createProduct(req, res) {
  try {
    const { name, description, price, stock, category_id, images = [] } = req.body;
    
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
    const newProduct = {
        id: Date.now(),
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category: category_id, // Store ID directly
        images,
        created_at: new Date().toISOString()
    };
    
    products.unshift(newProduct);
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
    
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/* =========================
   UPDATE PRODUCT
========================= */
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    let products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
    const index = products.findIndex(p => p.id == id);
    
    if (index === -1) return res.status(404).json({ message: "Introuvable" });
    
    products[index] = { ...products[index], ...updates };
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
    
    res.json({ success: true, data: products[index] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/* =========================
   DELETE PRODUCT
========================= */
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    let products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
    products = products.filter(p => p.id != id);
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
    
    res.json({ message: "Produit supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
