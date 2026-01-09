import { useParams } from "react-router-dom";
import fakeProducts from "../data/fakeProducts";
import MainLayout from "../layout/MainLayout";
import ProductCard from "../components/ProductCard";

const CategoryProducts = () => {
  const { category } = useParams();

  const products = fakeProducts.filter(
    (product) => product.category === category
  );

  return (
    <MainLayout>
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">

        {/* TITLE */}
        <h1 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 capitalize">
          {category}
        </h1>

        {products.length === 0 ? (
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
