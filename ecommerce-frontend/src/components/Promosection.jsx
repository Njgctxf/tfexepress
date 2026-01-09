import ProductCard from "./ProductCard";
import fakeProducts from "../data/fakeProducts";

const PromoSection = () => {
  const promos = fakeProducts.filter(
    (p) => p.oldPrice && p.oldPrice > p.price
  );

  if (promos.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-14">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        🔥 Offres et promotions
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {promos.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default PromoSection;
