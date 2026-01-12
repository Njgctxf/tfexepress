import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProducts } from "../services/api/products.api";
import MainLayout from "../layout/MainLayout";
import ProductCard from "../components/ProductCard";

const CategoryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await getProducts();
        if (res.success) {
          const filtered = res.data.filter(p => {
             // Handle different category formats
             const productCat = p.category;
             
             // If category is an object
             if (typeof productCat === 'object' && productCat) {
               const catId = productCat.id || productCat._id;
               const catName = productCat.name || productCat.nom;
               const catSlug = productCat.slug;
               
               return catId === category || 
                      catName?.toLowerCase() === category.toLowerCase() ||
                      catSlug?.toLowerCase() === category.toLowerCase();
             }
             
             // If category is a string/ID
             return productCat === category || 
                    productCat?.toLowerCase() === category.toLowerCase();
          });
          setProducts(filtered);
        }
      } catch (err) {
        console.error("Erreur CategoryProducts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  return (
    <MainLayout>
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">

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
    grid-cols-2
    gap-4               /* ⬅️ PLUS D’AIR SUR MOBILE */
    sm:grid-cols-3 sm:gap-5
    lg:grid-cols-4
    justify-items-center
  "
>
  {products.map((product) => (
    <div
      key={product.id}
      className="
        w-full
        max-w-[260px]
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
