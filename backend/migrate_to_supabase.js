import { supabase } from "./config/supabase.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES_PATH = path.join(__dirname, "data/categories.json");
const PRODUCTS_PATH = path.join(__dirname, "data/products.json");

function cleanId(id) {
    if (!id) return null;
    const str = String(id);
    if (str.startsWith("cat_")) return Number(str.replace("cat_", ""));
    // If numeric or other string, try casting
    const num = Number(str);
    return isNaN(num) ? null : num; // Fallback
}

async function migrate() {
    console.log("Starting migration...");

    // 1. Categories
    if (fs.existsSync(CATEGORIES_PATH)) {
        const rawCats = JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf8"));
        const catsToInsert = rawCats.map(c => ({
            id: cleanId(c.id || c._id),
            name: c.name || c.nom,
            slug: c.slug || (c.name || "").toLowerCase().replace(/\s+/g, '-')
        })).filter(c => c.id !== null); // Remove invalid/legacy IDs

        console.log(`Migrating ${catsToInsert.length} categories...`);

        // Upsert to avoid dupes, or delete all first? Upsert is safer.
        const { error: catError } = await supabase.from("categories").upsert(catsToInsert);
        if (catError) console.error("Error migrating categories:", catError);
        else console.log("Categories migrated successfully.");
    }

    // 2. Products
    if (fs.existsSync(PRODUCTS_PATH)) {
        const rawProds = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
        const prodsToInsert = rawProds.map(p => ({
            id: Number(p.id), // timestamp IDs
            name: p.name,
            description: p.description || "",
            price: Number(p.price),
            stock: Number(p.stock || 0),
            category_id: cleanId(p.category || p.category_id), // Map string 'cat_...' to bigint
            images: p.images || [],
            // is_featured: false (default DB)
        })).filter(p => !isNaN(p.id));

        console.log(`Migrating ${prodsToInsert.length} products...`);

        const { error: prodError } = await supabase.from("products").upsert(prodsToInsert);
        if (prodError) console.error("Error migrating products:", prodError);
        else console.log("Products migrated successfully.");
    }

    console.log("Migration complete.");
}

migrate();
