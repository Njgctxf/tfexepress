import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/categories.json");

/* ===== GET ===== */
export async function getCategories(req, res) {
  try {
    if (!fs.existsSync(DATA_PATH)) {
        return res.json([]);
    }
    const categories = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    // Normalize IDs (some have _id, some id)
    const normalized = categories.map(c => ({
        id: c.id || c._id,
        name: c.name || c.nom,
        slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-')
    }));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/* ===== POST ===== */
export async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Nom requis" });

    const categories = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    const newCat = {
        id: `cat_${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-')
    };
    
    categories.push(newCat);
    fs.writeFileSync(DATA_PATH, JSON.stringify(categories, null, 2));
    
    res.status(201).json(newCat);
  } catch (error) {
    res.status(500).json({ message: "Erreur création" });
  }
}

/* ===== DELETE ===== */
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    let categories = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    categories = categories.filter(c => (c.id != id && c._id != id));
    fs.writeFileSync(DATA_PATH, JSON.stringify(categories, null, 2));
    res.json({ message: "Catégorie supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur suppression" });
  }
}
