import ProductCard from "./ProductCard";
import fakeProducts from "../data/fakeProducts";

const PopularProducts = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-14">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Produits populaires
      </h2>

      <div
        className="
          flex gap-6
          overflow-x-auto
          pb-4
          scrollbar-hide
        "
        style={{ touchAction: "pan-x" }}
      >
        {fakeProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default PopularProducts;
