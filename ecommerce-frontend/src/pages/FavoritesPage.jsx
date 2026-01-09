import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import MainLayout from "../layout/MainLayout";
import { ShoppingCart, Trash2 } from "lucide-react";

const FavoritesPage = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            Mes favoris ({favorites.length})
          </h1>

          {favorites.length > 0 && (
            <button
              onClick={() => {
                favorites.forEach((product) => addToCart(product));
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold"
            >
              Tout ajouter au panier
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {favorites.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-4">Aucun produit en favoris</p>
            <Link
              to="/"
              className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm"
            >
              Continuer vos achats
            </Link>
          </div>
        )}

        {/* GRID */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="border rounded-xl p-4 hover:shadow-md transition"
              >
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-40 object-contain mb-4"
                  />
                </Link>

                <h3 className="text-sm font-semibold line-clamp-2">
                  {product.name}
                </h3>

                <p className="text-red-500 font-bold mt-2">
                  {product.price.toLocaleString()} FCFA
                </p>

                {/* ACTIONS */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-2 rounded-lg text-sm"
                  >
                    <ShoppingCart size={16} />
                    Panier
                  </button>

                  <button
                    onClick={() => toggleFavorite(product)}
                    className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                    title="Retirer des favoris"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FavoritesPage;
