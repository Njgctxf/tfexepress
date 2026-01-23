import { useState, useEffect } from "react";
import { getProductById, getProducts } from "../services/api/products.api";
import { getProductReviews, addReview } from "../services/api/reviews.api";
import MainLayout from "../layout/MainLayout";
import ProductCard from "../components/ProductCard";
import Breadcrumb from "../components/Breadcrumb";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star, Truck, Shield, RotateCcw, Package,
  CreditCard, ChevronDown, ChevronUp, Plus, Minus,
  Heart, Share2, AlertCircle
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, cart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", user_name: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Accordions State
  const [openSection, setOpenSection] = useState('description'); // 'description', 'delivery', 'reviews', or null

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const images = product?.images?.length > 0 ? product.images : ["/placeholder.png"];

  // Calculate specific cartID for the currently selected variant
  const currentCartId = product ? `${product.id}-${images[activeImage]}-${selectedSize || 'default'}` : null;

  // Check if THIS specific variant is in the cart
  const isInCart = Array.isArray(cart) && cart.some(item => item.cartId === currentCartId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (res.success) {
          setProduct(res.data);
          getProductReviews(res.data.id).then(setReviews);
          getProducts().then(productsRes => {
            if (productsRes.success) {
              const currentCat = (res.data.category && typeof res.data.category === 'object') ? res.data.category.id : res.data.category_id;

              // 1. Strict Filter (Same Category)
              let filtered = productsRes.data.filter(p => {
                const pCat = (p.category && typeof p.category === 'object') ? p.category.id : p.category_id;
                // Loose comparison for IDs (string vs number)
                return String(pCat) === String(currentCat) && String(p.id) !== String(res.data.id);
              });

              // 2. Fallback: If no similar products in category, pick random others
              if (filtered.length === 0 && productsRes.data.length > 0) {
                filtered = productsRes.data
                  .filter(p => String(p.id) !== String(res.data.id))
                  .sort(() => 0.5 - Math.random()); // Simple shuffle
              }

              setSimilarProducts(filtered.slice(0, 8)); // Take up to 8
            }
          });
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBuyNow = () => {
    if (product) {
      if (!isInCart) {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
          alert("Veuillez sélectionner une taille.");
          return;
        }
        // Pass selected image as 'image' prop to override default logic
        addToCart({ ...product, image: images[activeImage], quantity, size: selectedSize, cartId: currentCartId });
      }
      navigate("/checkout");
    }
  };

  const handleAddToCart = () => {
    if (product) {
      if (isInCart) {
        // Remove strictly this variant
        removeFromCart(currentCartId);
      } else {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
          alert("Veuillez sélectionner une taille.");
          return;
        }
        // Pass selected image as 'image' prop
        addToCart({ ...product, image: images[activeImage], quantity, size: selectedSize, cartId: currentCartId });
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!product) return;

    setSubmittingReview(true);
    try {
      const addedReview = await addReview({ ...newReview, product_id: product.id });
      setReviews([addedReview, ...reviews]);
      setNewReview({ rating: 5, comment: "", user_name: "" });
      setShowReviewForm(false);
    } catch (err) {
      alert("Impossible d'ajouter l'avis.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return <div className="h-screen flex items-center justify-center font-bold">Produit introuvable</div>;

  const stock = product.stock || 0;
  const isOutOfStock = stock === 0;
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;
  // images constant moved to top for cart logic

  return (
    <MainLayout>
      <div className="bg-white min-h-screen pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-6 mb-8">
          <Breadcrumb category={product.category} productName={product.name} />
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* LEFT: IMAGES */}
          <div className="space-y-6">
            {/* Mobile Slider / Desktop Main Image */}
            {/* Mobile Slider / Desktop Main Image */}
            <div className="aspect-square bg-white border border-gray-100 rounded-none lg:rounded-3xl overflow-hidden relative group">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain bg-white p-8 transition-transform duration-500 group-hover:scale-105"
              />
              {/* Mobile Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 lg:hidden">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${activeImage === idx ? 'bg-black w-4' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden lg:grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: DETAILS (Sticky) */}
          <div className="lg:sticky lg:top-24 h-fit space-y-8">

            {/* Header */}
            <div className="space-y-4">
              {product.brand && <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">{product.brand}</p>}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">{product.name}</h1>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex text-black">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(avgRating) ? "fill-black" : "text-gray-200"} />
                  ))}
                </div>
                <span className="underline underline-offset-4 decoration-gray-300 hover:decoration-black cursor-pointer transition-all" onClick={() => {
                  setOpenSection('reviews');
                  document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  {reviews.length} avis
                </span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <span className="text-3xl font-medium text-gray-900">{product.price.toLocaleString()} F</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through decoration-1">{product.originalPrice.toLocaleString()} F</span>
                )}
                {product.originalPrice && (
                  <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">Promo</span>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Actions */}
            <div className="space-y-6">
              {/* Sizes Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Taille</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 min-w-[40px] px-3 flex items-center justify-center border rounded-lg text-sm font-medium transition-all
                          ${selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-gray-200 text-gray-900 hover:border-black"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quantité</span>
                <div className="flex items-center border border-gray-300 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-l-full transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-r-full transition-colors disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {stock < 10 && !isOutOfStock && (
                  <span className="text-red-600 text-xs font-medium animate-pulse">Plus que {stock} articles !</span>
                )}
              </div>

              {/* Buttons Desktop */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-4 rounded-none uppercase font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 ${isInCart
                    ? "bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
                    : "bg-white border-black text-black hover:bg-black hover:text-white"
                    }`}
                >
                  {isOutOfStock ? "Rupture de Stock" : isInCart ? "Retirer du Panier" : "Ajouter au Panier"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full bg-red-600 text-white py-4 rounded-none uppercase font-bold tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
                >
                  Acheter Maintenant
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <button onClick={() => toggleFavorite(product)} className="flex items-center gap-2 hover:text-black transition-colors">
                  <Heart size={18} className={isFavorite(product.id) ? "fill-red-500 text-red-500" : ""} />
                  {isFavorite(product.id) ? "Dans vos favoris" : "Ajouter aux favoris"}
                </button>
                <button className="flex items-center gap-2 hover:text-black transition-colors">
                  <Share2 size={18} /> Partager
                </button>
              </div>

              {/* Trust Block */}
              <div className="bg-gray-50 p-4 space-y-3 text-sm rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Livraison gratuite à partir de 50.000 F</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Expédié sous 24h ouvrées</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Garantie Satisfait ou Remboursé (14 jours)</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Accordions */}
            <div className="divide-y divide-gray-100">
              {/* Description */}
              <div className="py-4">
                <button
                  onClick={() => toggleSection('description')}
                  className="flex items-center justify-between w-full text-left font-bold text-sm uppercase tracking-wider py-2"
                >
                  Description
                  {openSection === 'description' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === 'description' ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {product.description || "Aucune description détaillée."}
                  </p>
                </div>
              </div>

              {/* Delivery */}
              <div className="py-4">
                <button
                  onClick={() => toggleSection('delivery')}
                  className="flex items-center justify-between w-full text-left font-bold text-sm uppercase tracking-wider py-2"
                >
                  Livraison & Retours
                  {openSection === 'delivery' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === 'delivery' ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <div className="text-gray-600 space-y-2 text-sm">
                    <p><strong className="text-black">Abidjan:</strong> Livraison 24h (1500 FCFA)</p>
                    <p><strong className="text-black">Intérieur:</strong> Livraison 48-72h (3000 FCFA)</p>
                    <p>Retours gratuits sous 14 jours si le produit n'a pas été ouvert.</p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="py-4" id="reviews-section">
                <button
                  onClick={() => toggleSection('reviews')}
                  className="flex items-center justify-between w-full text-left font-bold text-sm uppercase tracking-wider py-2"
                >
                  Avis ({reviews.length})
                  {openSection === 'reviews' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === 'reviews' ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>

                  <div className="space-y-6">
                    {reviews.length === 0 && (
                      <div className="text-center py-6 bg-gray-50 text-sm text-gray-500">
                        Soyez le premier à donner votre avis.
                        <button onClick={() => setShowReviewForm(true)} className="block mx-auto mt-2 font-bold underline text-black">Rédiger un avis</button>
                      </div>
                    )}

                    {reviews.map((rev, idx) => (
                      <div key={idx} className="border-b last:border-0 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm">{rev.user_name}</p>
                            <div className="flex text-black text-xs my-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} className={i < rev.rating ? "fill-black" : "text-gray-200"} />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{rev.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{rev.comment}</p>
                      </div>
                    ))}

                    {reviews.length > 0 && !showReviewForm && (
                      <button onClick={() => setShowReviewForm(true)} className="text-sm font-bold border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600">
                        Écrire un avis
                      </button>
                    )}

                    {showReviewForm && (
                      <form onSubmit={handleSubmitReview} className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <h5 className="font-bold text-sm">Nouvel avis</h5>
                        <input
                          placeholder="Nom"
                          className="w-full text-sm p-3 border rounded"
                          value={newReview.user_name}
                          onChange={e => setNewReview({ ...newReview, user_name: e.target.value })}
                          required
                        />
                        <textarea
                          placeholder="Votre avis..."
                          className="w-full text-sm p-3 border rounded resize-none"
                          rows={3}
                          value={newReview.comment}
                          onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                          required
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase">Note:</span>
                          {[1, 2, 3, 4, 5].map(s => (
                            <button type="button" key={s} onClick={() => setNewReview({ ...newReview, rating: s })}>
                              <Star size={16} className={newReview.rating >= s ? "fill-black text-black" : "text-gray-300"} />
                            </button>
                          ))}
                        </div>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="w-full bg-black text-white text-sm font-bold py-3 uppercase tracking-wider"
                        >
                          Publier
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-20 border-t mt-20">
            <h3 className="text-2xl font-bold mb-8">Vous aimerez aussi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* MOBILE STICKY BAR */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50 flex gap-3 pb-safe">
          <div className="flex flex-col flex-1 justify-center">
            <span className="text-gray-500 text-xs truncate">{product.name}</span>
            <span className="font-bold">{product.price.toLocaleString()} F</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 px-6 py-3 font-bold uppercase tracking-wider text-sm disabled:bg-gray-300 ${isInCart ? "bg-red-500 text-white" : "bg-black text-white"
              }`}
          >
            {isOutOfStock ? 'Épuisé' : isInCart ? 'Retirer' : 'Ajouter'}
          </button>
        </div>

      </div>
    </MainLayout>
  );
};

export default ProductDetails;
