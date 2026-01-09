import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { products } from "../data/products"; // ✅ BON IMPORT

const SearchResults = () => {
  const { query, setQuery } = useSearch();
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query || query.trim().length < 2) return [];

    return products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  if (!query || query.trim().length < 2) return null;

  return (
    <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl z-50 overflow-hidden">
      {results.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">
          Aucun résultat pour <b>{query}</b>
        </div>
      ) : (
        <ul className="max-h-[380px] overflow-y-auto">
          {results.slice(0, 6).map((product) => (
            <li
              key={product.id}
              onClick={() => {
                navigate(`/product/${product.id}`);
                setQuery("");
              }}
              className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 cursor-pointer transition"
            >
              <img
                src={product.image} // ✅ BON CHAMP
                alt={product.name}
                className="w-12 h-12 object-contain bg-gray-50 rounded-lg"
              />

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {product.name}
                </p>
                <p className="text-xs font-semibold text-red-500">
                  {product.price.toLocaleString()} FCFA
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {results.length > 0 && (
        <button
          onClick={() => {
            navigate(`/search?q=${query}`);
            setQuery("");
          }}
          className="w-full text-center text-sm font-semibold text-red-500 py-3 hover:bg-gray-50"
        >
          Voir tous les résultats
        </button>
      )}
    </div>
  );
};

export default SearchResults;
