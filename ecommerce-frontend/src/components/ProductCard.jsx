import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const hasPromo = product.oldPrice && product.oldPrice > product.price;
  const discount =
    hasPromo &&
    Math.round(
      ((product.oldPrice - product.price) / product.oldPrice) * 100
    );

  const goToDetail = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <div
      onClick={goToDetail}
      className="
        group bg-white rounded-2xl
        shadow-sm hover:shadow-lg transition
        p-5 flex flex-col
        h-[360px]
        w-[260px]
        max-w-full
        sm:shrink-0
        cursor-pointer relative
      "
    >
      {/* ❤️ FAVORITE */}
      <button
        onClick={handleFavorite}
        className={`
          absolute top-3 right-3 z-10
          w-9 h-9 rounded-full
          flex items-center justify-center
          transition
          ${
            isFavorite(product.id)
              ? "bg-red-500 text-white"
              : "bg-white text-gray-400 hover:text-red-500"
          }
        `}
      >
        <Heart
          size={18}
          fill={isFavorite(product.id) ? "currentColor" : "none"}
        />
      </button>

      {/* IMAGE */}
      <div className="h-[150px] flex items-center justify-center mb-4 overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {hasPromo && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
      </div>

      {/* TITLE */}
      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-[40px]">
        {product.name}
      </h3>

      {/* RATING */}
      <div className="flex items-center gap-1 text-yellow-400 text-sm mt-2 h-[20px]">
        {"★".repeat(product.rating)}
        {"☆".repeat(5 - product.rating)}
        <span className="text-gray-500 text-xs ml-1">
          {product.rating}.0
        </span>
      </div>

      {/* PRICE */}
      <div className="mt-auto">
        {hasPromo && (
          <div className="text-xs text-gray-400 line-through">
            {product.oldPrice.toLocaleString()} FCFA
          </div>
        )}
        <div className="text-lg font-bold text-gray-900">
          {product.price.toLocaleString()} FCFA
        </div>
      </div>

      {/* ADD TO CART – DESKTOP */}
      <button
        onClick={handleAddToCart}
        className="
          absolute bottom-5 left-5 right-5
          bg-red-500 hover:bg-red-600
          text-white text-sm font-semibold
          py-2 rounded-full
          opacity-0 translate-y-3
          group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-300
          hidden md:block
        "
      >
        Ajouter au panier
      </button>
{/* ADD TO CART – MOBILE */}
<button
  onClick={handleAddToCart}
  className="
    md:hidden
    mt-6           /* ⬅️ plus d’espace au-dessus */
    mb-2           /* ⬅️ respiration en bas */
    bg-red-500
    text-white
    py-3           /* ⬅️ bouton plus confortable au toucher */
    rounded-full
  "
>
  Ajouter au panier
</button>

    </div>
  );
};

export default ProductCard;
