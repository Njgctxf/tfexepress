import { useRef, useMemo, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { getProducts } from "../services/api";

const DiscountedGoods = ({ category = "all", brand = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRefs = useRef({});

  // Optimization: Render categories progressively to avoid UI freeze
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(2);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Optimize: Select only needed fields, exclude heavy description
        // Limit to 500 products to prevent crash if DB has 26k items
        const res = await getProducts({
          select: 'id, name, price, images, stock, category:categories(id, name, slug), brand',
          limit: 500
        });
        if (res.success) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Erreur fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Progressively show more categories after initial load
  useEffect(() => {
    if (!loading && products.length > 0) {
      const timer = setTimeout(() => {
        setVisibleCategoriesCount(prev => prev + 5);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, products, visibleCategoriesCount]);

  // Helper to normalize strings for comparison
  const normalize = (str) => {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  };

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    // Return all products, only filter by brand if needed
    // We DON'T filter by category here anymore, because we want to show all categories
    return products.filter((product) => {
      // 1. Check Brand if needed
      if (brand && product.brand !== brand) return false;
      return true;
    });
  }, [products, brand]);

  /* ================= GROUP BY CATEGORY ================= */
  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      // Robust category extraction to prevent crashes
      let categoryName = "Autres";

      if (product && product.category) {
        if (product.category && typeof product.category === 'object') {
          categoryName = product.category.name || "Autres";
        } else {
          categoryName = String(product.category);
        }
      }

      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(product);
      return acc;
    }, {});
  }, [filteredProducts]);

  const orderedCategories = useMemo(() => {
    const categories = Object.keys(groupedProducts);

    // If no specific category selected or "all", just sort alphabetically or keep default
    if (!category || category === "all") {
      return categories.sort();
    }

    const targetSlug = category; // 'category' prop IS the slug

    return categories.sort((a, b) => {
      // Find a representative product for category 'a' (Name)
      const productA = groupedProducts[a]?.[0];
      const slugA = productA?.category?.slug;

      // Find a representative product for category 'b'
      const productB = groupedProducts[b]?.[0];
      const slugB = productB?.category?.slug;

      // Exact slug match gets priority
      if (slugA === targetSlug) return -1;
      if (slugB === targetSlug) return 1;

      // Fallback: Fuzzy name match (if slug missing)
      const targetNameNorm = normalize(category);
      const matchA = normalize(a).includes(targetNameNorm);
      const matchB = normalize(b).includes(targetNameNorm);

      if (matchA && !matchB) return -1;
      if (!matchA && matchB) return 1;

      return a.localeCompare(b); // Otherwise alphabetical
    });
  }, [groupedProducts, category]);

  const scrollLeft = (cat) => {
    scrollRefs.current[cat]?.scrollBy({ left: -250, behavior: "smooth" });
  };

  const scrollRight = (cat) => {
    scrollRefs.current[cat]?.scrollBy({ left: 250, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-12 text-center text-gray-500">
        Chargement des produits...
      </div>
    );
  }

  if (orderedCategories.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <p className="text-center text-gray-500">
          Aucun produit trouvé pour cette sélection.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 mt-14">

      {/* CATEGORY SECTIONS */}
      {orderedCategories.slice(0, visibleCategoriesCount).map((cat) => (
        <div key={cat} className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {cat}
          </h2>

          <div className="relative">
            {/* LEFT */}
            <button
              onClick={() => scrollLeft(cat)}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10
              bg-white border rounded-full p-2 shadow hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
            </button>

            {/* PRODUCTS */}
            <div
              ref={(el) => (scrollRefs.current[cat] = el)}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide mx-0 md:mx-12"
              style={{ touchAction: "pan-x" }}
            >
              {groupedProducts[cat].map((product) => (
                <div key={product.id} className="min-w-[260px] w-[260px] max-w-[260px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* RIGHT */}
            <button
              onClick={() => scrollRight(cat)}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10
              bg-white border rounded-full p-2 shadow hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
};

export default DiscountedGoods;
