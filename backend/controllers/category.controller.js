import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Category from "../models/Category.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/categories.json");

/* ===== SLUGIFY ===== */
function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

/* ===== GET ===== */
export async function getCategories(req, res) {
  try {
    if (mongoose.connection.readyState === 1) {
      const categories = await Category.find().sort("name");
      return res.json(categories);
    }
    throw new Error("MongoDB not detected");
  } catch (e) {
    console.warn("Using JSON fallback for getCategories");
    try {
      if (!fs.existsSync(DATA_PATH)) {
        throw new Error(`File not found at ${DATA_PATH}`);
      }
      const fileContent = fs.readFileSync(DATA_PATH, "utf8");
      const categories = JSON.parse(fileContent);
      res.json(categories);
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
      res.status(500).json({
        message: "Erreur lors du chargement des catégories (mode secours)",
        error: fallbackError.message,
        path: DATA_PATH // Debug info
      });
    }
  }
} // End getCategories

/* ===== POST ===== */
export async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Nom requis" });
    const slug = slugify(name);

    if (mongoose.connection.readyState === 1) {
      const exists = await Category.findOne({ slug });
      if (exists) return res.status(400).json({ message: "Catégorie existante" });
      const category = await Category.create({ name, slug });
      return res.status(201).json(category);
    }
    throw new Error("MongoDB not detected");

  } catch (error) {
    console.warn("Using JSON fallback for createCategory");
    try {
      const { name } = req.body;
      const slug = slugify(name);
      
      let categories = [];
      if (fs.existsSync(DATA_PATH)) {
         categories = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      }

      if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({ message: "Catégorie déjà existante" });
      }

      const newCategory = { _id: Date.now().toString(), name, slug };
      categories.push(newCategory);
      fs.writeFileSync(DATA_PATH, JSON.stringify(categories, null, 2));
      res.status(201).json(newCategory);
    } catch (fsError) {
      res.status(500).json({ message: "Erreur serveur (FS)", error: fsError.message });
    }
  }
}

/* ===== DELETE ===== */
export async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    if (mongoose.connection.readyState === 1) {
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ message: "Introuvable" });
      await category.deleteOne();
      return res.json({ message: "Supprimée" });
    }
    throw new Error("MongoDB not detected");
  } catch (e) {
    console.warn("Using JSON fallback for deleteCategory");
    let categories = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    const newCategories = categories.filter(c => c._id !== id && c.id !== id);
    if (categories.length === newCategories.length) {
      return res.status(404).json({ message: "Introuvable" });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(newCategories, null, 2));
    res.json({ message: "Catégorie supprimée" });
  }
}
