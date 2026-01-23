import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((res) => {
        const data = res.data || [];
        const filtered = data.filter((p) => {
          const productCat = p.category;

          // If category is an object
          if (typeof productCat === 'object' && productCat) {
            const catId = productCat.id || productCat._id;
            const catName = productCat.name || productCat.nom;
            const catSlug = productCat.slug;

            return String(catId) === String(slug) ||
              catName?.toLowerCase() === slug.toLowerCase() ||
              catSlug?.toLowerCase() === slug.toLowerCase();
          }

          // If category is a string/ID
          return productCat === slug ||
            productCat?.toLowerCase() === slug.toLowerCase();
        });
        setProducts(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <MainLayout>
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold capitalize mb-6">
          {slug}
        </h1>

        {loading ? (
          <p>Chargement...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">
            Aucun produit dans cette catégorie
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default CategoryPage;
