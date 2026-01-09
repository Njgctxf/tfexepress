import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "../services/api";

const ProductsByCategory = () => {
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    getProducts()
      .then((products) => {
        const groupedData = products.reduce((acc, product) => {
          const name =
            product.category?.name || product.category;
          if (!acc[name]) acc[name] = [];
          acc[name].push(product);
          return acc;
        }, {});
        setGrouped(groupedData);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12 space-y-14">
      {Object.entries(grouped).map(([category, products]) => (
        <div key={category}>
          <h2 className="text-xl font-bold mb-6">
            {category}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default ProductsByCategory;
