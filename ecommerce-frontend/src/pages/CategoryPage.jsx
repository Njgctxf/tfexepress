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
    setLoading(true);
    getProducts()
      .then((data) => {
        const filtered = data.filter(
          (p) => p.category?.slug === slug || p.category === slug
        );
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
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default CategoryPage;
