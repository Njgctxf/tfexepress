import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProducts } from "../services/api/products.api";
import MainLayout from "../layout/MainLayout";
import ProductCard from "../components/ProductCard";
import Hero from "../components/Hero";

// Helper to map URL slugs to Hero keys
// Helper to map URL slugs to Hero keys
const getHeroCategory = (slug) => {
  if (!slug) return "Téléphones";
  const s = slug.toLowerCase();

  // Fuzzy matching for Hero Slots
  if (s.includes("téléphone") || s.includes("telephone") || s.includes("smartphone") || s.includes("mobile") || s.includes("androïde") || s.includes("iphone")) return "Téléphones";
  if (s.includes("vêtement") || s.includes("vetement") || s.includes("mode") || s.includes("habit") || s.includes("chaussure") || s.includes("t-shirt")) return "Vêtements";
  if (s.includes("ordinateur") || s.includes("informatique") || s.includes("pc") || s.includes("macbook") || s.includes("laptop")) return "Ordinateurs";
  if (s.includes("montre") || s.includes("watch") || s.includes("connectée")) return "Montres";
  if (s.includes("audio") || s.includes("son") || s.includes("casque") || s.includes("ecouteur") || s.includes("enceinte")) return "Audio";
  if (s.includes("gaming") || s.includes("jeu") || s.includes("console") || s.includes("gamer")) return "Gaming";
  if (s.includes("electronique") || s.includes("électronique") || s.includes("camera") || s.includes("photo")) return "Electronique";

  // Fallback: Try to capitalize, otherwise Default
  return (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Téléphones");
};

import CategoryBar from "../components/CategoryBar";

const CategoryProducts = () => {
  const { category } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch All Products ONCE on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await getProducts();
        if (res.success) {
          setAllProducts(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // 2. Filter instantly when category or products change
  useEffect(() => {
    if (allProducts.length > 0) {
      const filtered = allProducts.filter(p => {
        const productCat = p.category;
        if (typeof productCat === 'object' && productCat) {
          const catId = productCat.id || productCat._id;
          const catName = productCat.name || productCat.nom;
          const catSlug = productCat.slug;
          return catId === category || catName?.toLowerCase() === category.toLowerCase() || catSlug?.toLowerCase() === category.toLowerCase();
        }

        // Handle direct ID string or category_id field
        const directMatch = productCat === category || productCat?.toLowerCase() === category.toLowerCase();
        const idMatch = p.category_id === category || p.categoryId === category;
        return directMatch || idMatch;
      });
      setProducts(filtered);
    }
  }, [category, allProducts]);

  return (
    <MainLayout>
      <CategoryBar active={category} />
      <Hero category={getHeroCategory(category)} />
      <section className="max-w-7xl mx-auto px-4 sm:px-4 py-4 sm:py-8">

        {/* TITLE */}
        <h1 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 capitalize">
          {category}
        </h1>

        {loading ? (
          <p className="text-gray-500 text-sm">Chargement...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Aucun produit dans cette catégorie
          </p>
        ) : (
          <div
            className="
    grid
    grid-cols-1         /* ⬅️ 1 COLONNE SUR MOBILE (Plus large) */
    gap-4
    sm:grid-cols-2 sm:gap-5 /* ⬅️ 2 COLONNES À PARTIR DE TABLETTE (sm) */
    md:grid-cols-3
    lg:grid-cols-4
    justify-items-center
  "
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="
        w-full
        md:max-w-[260px]
        px-1              /* ⬅️ MICRO ESPACE LATÉRAL MOBILE */
      "
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </section>
    </MainLayout>
  );
};

export default CategoryProducts;
