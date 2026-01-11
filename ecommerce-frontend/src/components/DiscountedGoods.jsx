import { useRef, useMemo, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { getProducts } from "../services/api";

const DiscountedGoods = ({ category = "all", brand = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRefs = useRef({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
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

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (brand && product.brand !== brand) return false;
      return true;
    });
  }, [products, category, brand]);

  /* ================= GROUP BY CATEGORY ================= */
  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const categoryName = typeof product.category === 'object' 
        ? product.category.name 
        : product.category;
      
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(product);
      return acc;
    }, {});
  }, [filteredProducts]);

  const orderedCategories = Object.keys(groupedProducts);

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
      {orderedCategories.map((cat) => (
        <div key={cat} className="mb-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {cat}
          </h3>

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
                <ProductCard key={product.id} product={product} />
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
