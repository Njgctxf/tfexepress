import Category from "../models/Category.js";

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
    const categories = await Category.find().sort("name");
    res.json(categories);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/* ===== POST ===== */
export async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Nom requis" });
    }

    const slug = slugify(name);

    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: "Catégorie déjà existante" });
    }

    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/* ===== DELETE ===== */
export async function deleteCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie introuvable" });
    }

    await category.deleteOne();
    res.json({ message: "Catégorie supprimée" });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
}
