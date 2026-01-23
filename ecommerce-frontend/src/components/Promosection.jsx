import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "../services/api/products.api";

const PromoSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(res => {
        if (res.success) {
          const promos = res.data.filter(
            (p) => (p.old_price && p.old_price > p.price) || (p.discount && p.discount > 0)
          );
          setProducts(promos);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-14">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        🔥 Offres et promotions
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id} className="min-w-[260px] w-[260px] max-w-[260px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PromoSection;
