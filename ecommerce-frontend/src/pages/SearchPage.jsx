import { useSearchParams } from "react-router-dom";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const results =
    query.trim().length < 2
      ? []
      : products.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">
        Résultats pour : <span className="text-red-500">{query}</span>
      </h1>

      {results.length === 0 ? (
        <p className="text-gray-500">Aucun produit trouvé.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
