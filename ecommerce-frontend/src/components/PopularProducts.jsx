import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "../services/api/products.api";

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optimization: In a real scenario, use .limit(8) in the API
    // Here we simulate it or rely on client-slice, but we ADD SKELETON
    getProducts()
      .then(res => {
        if (res.success) {
          setProducts(res.data.slice(0, 8));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-[350px] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-14">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Produits populaires
      </h2>

      <div
        className="
          grid
          grid-cols-1 md:grid-cols-2 lg:grid-cols-4
          gap-6
        "
      >
        {products.map((product) => (
          <div key={product.id} className="w-full md:max-w-[260px] mx-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularProducts;
