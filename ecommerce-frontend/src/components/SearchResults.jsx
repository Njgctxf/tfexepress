import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { getProducts } from "../services/api/products.api";
import { useLocalization } from "../context/LocalizationContext";

const SearchResults = () => {
  const { query, setQuery } = useSearch();
  const navigate = useNavigate();
  const { t, formatPrice } = useLocalization();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true; // Prevents race conditions

    const timeoutId = setTimeout(async () => {
      if (!query || query.trim().length < 2) {
        if (active) setResults([]);
        return;
      }

      if (active) setLoading(true);
      try {
        const res = await getProducts({ search: query });
        if (active) {
          setResults(res.success && Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error("Search error:", error);
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false; // Cancel updates on cleanup
      clearTimeout(timeoutId);
    };
  }, [query]);

  if (!query || query.trim().length < 2) return null;

  return (
    <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5">
      {loading ? (
        <div className="p-6 text-center text-gray-500 text-sm">
          <div className="animate-spin w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          {t('analyzing')}
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-sm text-gray-500 text-center">
          {t('no_results_for') || 'Aucun résultat pour'} <span className="font-bold text-gray-900">"{query}"</span>
        </div>
      ) : (
        <>
          <ul className="max-h-[380px] overflow-y-auto">
            {results
              .filter(p => p && p.id && p.name) // Extra safety filter
              .slice(0, 6)
              .map((product) => (
                <li
                  key={product.id}
                  onClick={() => {
                    navigate(`/product/${product.id}`);
                    setQuery("");
                  }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition border-b last:border-0"
                >
                  <img
                    src={product.image || (product.images && product.images[0]) || ""}
                    alt={product.name}
                    width="48"
                    height="48"
                    loading="lazy"
                    className="w-12 h-12 object-contain bg-white rounded-lg border p-1"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs font-bold text-red-500 mt-0.5">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </li>
              ))}
          </ul>

          <button
            onClick={() => {
              navigate(`/shop?search=${query}`); // Navigate to shop with search param
              setQuery("");
            }}
            className="w-full text-center text-xs font-bold uppercase tracking-wider text-red-500 py-3 hover:bg-red-50 transition border-t"
          >
            {t('see_all_results') || 'Voir tous les résultats'}
          </button>
        </>
      )}
    </div>
  );
};

export default SearchResults;
