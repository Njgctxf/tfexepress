import { useNavigate } from "react-router-dom";
import { Heart, Plus, ShoppingBag, Trash2, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const cartContext = useCart();
  const favoritesContext = useFavorites();

  const { addToCart, removeFromCart, cart = [] } = cartContext || {};
  const { toggleFavorite, isFavorite } = favoritesContext || {};

  // Safety check
  if (!product) return null;

  const isInCart = Array.isArray(cart) && cart.some((item) => item.id === product.id);

  const hasPromo = product.oldPrice && product.oldPrice > product.price;
  const discount =
    hasPromo &&
    Math.round(
      ((product.oldPrice - product.price) / product.oldPrice) * 100
    );

  const goToDetail = () => {
    navigate(`/product/${product.id}`);
  };

  const handleCartAction = (e) => {
    e.stopPropagation();
    if (isInCart) {
      removeFromCart(product.id);
    } else {
      addToCart(product);
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  // Helper to fix image URL (same logic as Hero)
  const getImageUrl = (p) => {
    let img = p.image || (p.images && p.images[0]);
    if (img && img.startsWith("/")) {
      return `http://localhost:5000${img}`;
    }
    return img || "https://placehold.co/400x400/png?text=No+Image";
  };

  return (
    <div
      onClick={goToDetail}
      className="group cursor-pointer flex flex-col w-full max-w-[280px] mx-auto"
    >
      {/* --- IMAGE CONTAINER --- */}
      {/* --- IMAGE CONTAINER --- */}
      <div className="relative aspect-[3/4] rounded-[2rem] bg-white border border-gray-200 hover:border-gray-300 transition-colors duration-300 overflow-hidden mb-4">

        {/* Product Image */}
        <img
          src={getImageUrl(product)}
          alt={product.name}
          width="300"
          height="400"
          loading="lazy"
          className="h-full w-full object-contain p-6 bg-white transition-transform duration-700 ease-in-out group-hover:scale-110"
        />

        {/* Promo Badge - Minimalist Tag */}
        {hasPromo && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-red-600 shadow-sm">
            -{discount}%
          </span>
        )}

        {/* --- HOVER ACTIONS (Desktop) --- */}
        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          aria-label={typeof isFavorite === 'function' && isFavorite(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={`
            absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
            ${typeof isFavorite === 'function' && isFavorite(product.id)
              ? "bg-red-500 text-white"
              : "bg-white/50 backdrop-blur-md text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110"
            }
          `}
        >
          <Heart size={18} fill={typeof isFavorite === 'function' && isFavorite(product.id) ? "currentColor" : "none"} />
        </button>

        {/* Quick Add Button (Bottom Center) - Toggle State */}
        {/* Quick Add Button (Bottom Center) - Toggle State */}
        {isInCart ? (
          <button
            key="btn-remove"
            onClick={handleCartAction}
            className="
              absolute bottom-4 inset-x-4 
              h-12 rounded-xl
              backdrop-blur-md font-semibold text-sm
              flex items-center justify-center gap-2
              shadow-lg translate-y-[120%] opacity-0 
              group-hover:translate-y-0 group-hover:opacity-100 
              transition-all duration-300 ease-out
              bg-red-500/90 text-white hover:bg-red-600
            "
          >
            <Trash2 size={16} />
            Retirer du panier
          </button>
        ) : (
          <button
            key="btn-add"
            onClick={handleCartAction}
            className="
              absolute bottom-4 inset-x-4 
              h-12 rounded-xl
              backdrop-blur-md font-semibold text-sm
              flex items-center justify-center gap-2
              shadow-lg translate-y-[120%] opacity-0 
              group-hover:translate-y-0 group-hover:opacity-100 
              transition-all duration-300 ease-out
              bg-white/90 text-black hover:bg-white
            "
          >
            <ShoppingBag size={16} />
            Ajouter au panier
          </button>
        )}

        {/* Mobile Add Button (Always Visible, Bottom Right) */}
        <button
          onClick={handleCartAction}
          aria-label={isInCart ? "Retirer du panier" : "Ajouter au panier"}
          className={`
            md:hidden absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform
            ${isInCart ? "bg-red-500 text-white" : "bg-black text-white"}
          `}
        >
          {isInCart ? <Trash2 size={18} /> : <Plus size={20} />}
        </button>
      </div>

      {/* --- DETAILS --- */}
      <div className="px-1">
        {/* Brand Name */}
        {product.brand && (
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{product.brand}</p>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-base font-bold text-gray-900">
            {Number(product.price || 0).toLocaleString()} FCFA
          </span>
          {hasPromo && (
            <span className="text-xs text-gray-500 line-through decoration-red-500/30">
              {product.oldPrice.toLocaleString()} FCFA
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
