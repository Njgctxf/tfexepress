import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import FeaturedCategory from "../models/FeaturedCategory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =====================
   GET FEATURED CATEGORIES
===================== */
export const getFeaturedCategories = async (req, res) => {
  try {
    let data = [];
    try {
      data = await FeaturedCategory.find({ active: true })
        .populate("category")
        .sort({ position: 1 });
    } catch (e) {
      console.warn("MongoDB unavailable, using JSON fallback for featured categories");
      data = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/featuredCategories.json"), "utf8"));
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Erreur chargement catégories vedettes",
    });
  }
};

/* =====================
   CREATE FEATURED CATEGORY
===================== */
export const createFeaturedCategory = async (req, res) => {
  try {
    const { category, position: positionStr } = req.body;
    const position = parseInt(positionStr, 10);

    if (!category || !positionStr || !req.file) {
      return res.status(400).json({
        message: "Catégorie, position et image obligatoires",
      });
    }

    if (isNaN(position) || position < 1 || position > 4) {
      return res.status(400).json({
        message: "La position doit être un nombre entre 1 et 4",
      });
    }

    const positionExists = await FeaturedCategory.findOne({ position });
    if (positionExists) {
      return res.status(400).json({
        message: "Cette position est déjà utilisée",
      });
    }

    const featured = await FeaturedCategory.create({
      category,
      position,
      image: `/uploads/${req.file.filename}`,
    });

    res.status(201).json(featured);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) { // Duplicate key error
      return res.status(400).json({
        message: "Cette catégorie ou position est déjà utilisée",
      });
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* =====================
   DELETE FEATURED CATEGORY
===================== */
export const deleteFeaturedCategory = async (req, res) => {
  try {
    await FeaturedCategory.findByIdAndUpdate(req.params.id, {
      active: false,
    });

    res.json({ message: "Catégorie supprimée" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur suppression catégorie",
    });
  }
};
