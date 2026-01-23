import React from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import MainLayout from "../layout/MainLayout";
import ProductCard from "../components/ProductCard";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";

const FavoritesPage = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const handleAddAllToCart = () => {
    favorites.forEach((product) => addToCart(product));
  };

  if (favorites.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <Heart size={48} className="text-red-500 fill-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            Votre liste d'envies est vide
          </h1>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Sauvegardez vos coups de cœur ici pour les retrouver plus tard.
            Parcourez la boutique pour commencer.
          </p>
          <Link
            to="/shop"
            className="bg-black text-white px-8 py-4 rounded-lg font-bold hover:bg-gray-900 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            Découvrir nos collections
            <ArrowRight size={20} />
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-6">
          <div>
            <Link to="/shop" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-2 transition-colors">
              <ArrowRight size={14} className="rotate-180" />
              Retour à la boutique
            </Link>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-gray-900 mb-2">
              Ma Liste d'Envies
            </h1>
            <p className="text-gray-500">
              {favorites.length} article{favorites.length > 1 ? "s" : ""} sauvegardé{favorites.length > 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={handleAddAllToCart}
            className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-900 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            Tout ajouter au panier
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default FavoritesPage;
