import { supabase } from "../config/supabase.js";

/* =========================
   SYNC ALIEXPRESS PRODUCTS
   Endpoint: POST /api/sync/aliexpress
   Header requis: X-API-Key
========================= */
export async function syncAliexpressProducts(req, res) {
  try {
    // 1. Vérifier la clé API
    const apiKey = req.headers["x-api-key"];
    const expectedKey = process.env.SYNC_API_KEY;

    if (!expectedKey) {
      console.error("❌ SYNC_API_KEY non définie dans .env");
      return res.status(500).json({
        success: false,
        message: "Configuration serveur incomplète (clé API manquante)",
      });
    }

    if (!apiKey || apiKey !== expectedKey) {
      console.warn("⚠️ Tentative de sync avec clé invalide:", apiKey?.substring(0, 8) + "...");
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé - Clé API invalide",
      });
    }

    // 2. Valider le payload
    const { products, timestamp, source } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Données manquantes ou invalides - 'products' doit être un tableau non vide",
      });
    }

    console.log(`\n🔄 Sync reçue de: ${source || "inconnu"}`);
    console.log(`📦 ${products.length} produit(s) à traiter`);
    console.log(`⏰ Timestamp: ${timestamp || "non fourni"}`);

    // 3. Récupérer les catégories existantes pour le mapping
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id, name");

    const categoryMap = {};
    if (existingCategories) {
      existingCategories.forEach((cat) => {
        categoryMap[cat.name.toLowerCase().trim()] = cat.id;
      });
    }

    // 4. Traiter et préparer les produits
    const results = {
      created: 0,
      skipped: 0,
      errors: [],
    };

    for (const product of products) {
      try {
        // Vérifier les champs obligatoires
        if (!product.title || !product.price) {
          results.skipped++;
          results.errors.push({
            id: product.id,
            reason: "Titre ou prix manquant",
          });
          continue;
        }

        // Chercher ou créer la catégorie
        let categoryId = null;
        if (product.category) {
          const catKey = product.category.toLowerCase().trim();
          if (categoryMap[catKey]) {
            categoryId = categoryMap[catKey];
          } else {
            // Créer la catégorie si elle n'existe pas
            const slug = product.category
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "-");

            const { data: newCat, error: catError } = await supabase
              .from("categories")
              .insert([{ name: product.category.trim(), slug }])
              .select()
              .single();

            if (!catError && newCat) {
              categoryId = newCat.id;
              categoryMap[catKey] = newCat.id;
              console.log(`  ✅ Catégorie créée: "${product.category}"`);
            } else {
              console.warn(`  ⚠️ Impossible de créer la catégorie "${product.category}":`, catError?.message);
            }
          }
        }

        // Vérifier si le produit existe déjà (par aliexpress_id)
        if (product.id) {
          const { data: existing } = await supabase
            .from("products")
            .select("id")
            .eq("aliexpress_id", String(product.id))
            .maybeSingle();

          if (existing) {
            // Mettre à jour le produit existant
            const updates = {
              name: product.title,
              price: Number(product.price),
              ...(categoryId && { category_id: categoryId }),
              ...(product.imageUrl && { images: [product.imageUrl] }),
            };

            await supabase
              .from("products")
              .update(updates)
              .eq("id", existing.id);

            results.created++; // Compté comme traité
            console.log(`  🔄 Produit mis à jour: "${product.title.substring(0, 50)}..."`);
            continue;
          }
        }

        // Préparer le payload d'insertion
        const payload = {
          name: product.title,
          price: Number(product.price),
          stock: 100, // Stock par défaut
          description: product.originalTitle || product.title,
          images: product.imageUrl ? [product.imageUrl] : [],
          category_id: categoryId,
          aliexpress_id: product.id ? String(product.id) : null,
          aliexpress_url: product.productUrl || null,
          is_featured: false,
        };

        const { error: insertError } = await supabase
          .from("products")
          .insert([payload]);

        if (insertError) {
          // Si les colonnes aliexpress_id/aliexpress_url n'existent pas, réessayer sans
          if (insertError.message?.includes("aliexpress_id") || insertError.message?.includes("aliexpress_url")) {
            const fallbackPayload = {
              name: payload.name,
              price: payload.price,
              stock: payload.stock,
              description: payload.description,
              images: payload.images,
              category_id: payload.category_id,
              is_featured: false,
            };

            const { error: fallbackError } = await supabase
              .from("products")
              .insert([fallbackPayload]);

            if (fallbackError) throw fallbackError;
          } else {
            throw insertError;
          }
        }

        results.created++;
        console.log(`  ✅ Produit créé: "${product.title.substring(0, 50)}..."`);
      } catch (productError) {
        results.skipped++;
        results.errors.push({
          id: product.id,
          title: product.title?.substring(0, 50),
          reason: productError.message,
        });
        console.error(`  ❌ Erreur produit "${product.title?.substring(0, 30)}":`, productError.message);
      }
    }

    // 5. Réponse
    console.log(`\n📊 Résultat sync: ${results.created} créés, ${results.skipped} ignorés`);

    res.status(200).json({
      success: true,
      message: `Synchronisation terminée`,
      results: {
        total: products.length,
        created: results.created,
        skipped: results.skipped,
        errors: results.errors.length > 0 ? results.errors : undefined,
      },
    });
  } catch (error) {
    console.error("❌ Erreur sync globale:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la synchronisation",
      error: error.message,
    });
  }
}

/* =========================
   GET SYNC STATUS / TEST
   Endpoint: GET /api/sync/status
========================= */
export async function getSyncStatus(req, res) {
  res.json({
    success: true,
    message: "🟢 Endpoint de synchronisation AliExpress actif",
    endpoint: "POST /api/sync/aliexpress",
    auth: "Header X-API-Key requis",
    timestamp: new Date().toISOString(),
  });
}
