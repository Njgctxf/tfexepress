import { useState, useEffect } from "react";
import { getProductById, getProducts } from "../services/api/products.api";
import MainLayout from "../layout/MainLayout";
import ProductImageSlider from "../components/ProductImageSlider";
import ProductCard from "../components/ProductCard";
import Breadcrumb from "../components/Breadcrumb";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Truck, Shield, RotateCcw, Headphones, Package, CreditCard, CheckCircle2 } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleBuyNow = () => {
    addToCart(product);
    navigate("/checkout");
  };

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", user_name: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (res.success) {
          setProduct(res.data);
          
          fetch(`http://localhost:5000/api/reviews/${res.data.id}`)
            .then(r => r.json())
            .then(data => setReviews(data))
            .catch(err => console.error("Err reviews", err));

          const productsRes = await getProducts();
          if (productsRes.success) {
            const currentCat = typeof res.data.category === 'object' ? res.data.category.id : res.data.category_id;
            const filtered = productsRes.data.filter(p => {
               const pCat = typeof p.category === 'object' ? p.category.id : p.category_id;
               return pCat === currentCat && p.id !== res.data.id;
            });
            setSimilarProducts(filtered);
          }
        }
      } catch (err) {
        console.error("Erreur ProductDetails:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-10 text-center text-gray-500">Chargement...</div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="p-10 text-center text-gray-500">Produit introuvable</div>
      </MainLayout>
    );
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const stock = product.stock || 0;
  const stockStatus = stock === 0 ? "Rupture de stock" : stock < 10 ? `Plus que ${stock} en stock` : "En stock";
  const stockColor = stock === 0 ? "text-red-600" : stock < 10 ? "text-orange-600" : "text-green-600";

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Breadcrumb category={product.category} productName={product.name} />
      </div>

      <section className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-12">
        {/* LEFT: Images */}
        <div className="space-y-4">
          <ProductImageSlider images={product.images} />
          
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {product.isFeatured && (
              <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">
                ⭐ Meilleure vente
              </span>
            )}
            {stock < 10 && stock > 0 && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                🔥 Stock limité
              </span>
            )}
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              ✓ Produit vérifié
            </span>
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            {product.brand && (
              <p className="text-gray-500 mt-1">Par <span className="font-semibold">{product.brand}</span></p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className={i < Math.floor(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
              ))}
            </div>
            <span className="font-bold text-gray-900">{avgRating}</span>
            <span className="text-gray-500">({reviews.length} avis)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-gray-900">{product.price.toLocaleString()} FCFA</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through">{product.originalPrice.toLocaleString()} FCFA</span>
            )}
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-2 ${stockColor} font-semibold`}>
            <Package size={18} />
            <span>{stockStatus}</span>
          </div>

          {/* Short Description */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed border-l-4 border-orange-500 pl-4 italic">
              {product.description.substring(0, 150)}...
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => addToCart(product)}
              disabled={stock === 0}
              className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg disabled:cursor-not-allowed"
            >
              {stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={stock === 0}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-300 text-white px-8 py-4 rounded-xl font-bold shadow-xl transition-all disabled:cursor-not-allowed"
            >
              Acheter maintenant
            </button>

            <button
              onClick={() => toggleFavorite(product)}
              className={`p-4 rounded-xl font-semibold border-2 transition-all ${
                isFavorite(product.id)
                  ? "bg-red-50 text-red-600 border-red-500"
                  : "hover:bg-gray-50 border-gray-300"
              }`}
            >
              {isFavorite(product.id) ? "❤️" : "🤍"}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <Truck className="text-blue-600" size={24} />
              <div>
                <p className="font-bold text-sm text-gray-900">Livraison rapide</p>
                <p className="text-xs text-gray-500">2-5 jours ouvrés</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <Shield className="text-green-600" size={24} />
              <div>
                <p className="font-bold text-sm text-gray-900">Garantie 1 an</p>
                <p className="text-xs text-gray-500">Protection complète</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <RotateCcw className="text-purple-600" size={24} />
              <div>
                <p className="font-bold text-sm text-gray-900">Retour gratuit</p>
                <p className="text-xs text-gray-500">Sous 14 jours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
              <Headphones className="text-orange-600" size={24} />
              <div>
                <p className="font-bold text-sm text-gray-900">Support 24/7</p>
                <p className="text-xs text-gray-500">Assistance dédiée</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={18} className="text-gray-600" />
              <span className="font-bold text-sm text-gray-900">Modes de paiement acceptés</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-white border rounded-lg text-xs font-semibold">💳 Carte bancaire</span>
              <span className="px-3 py-1 bg-white border rounded-lg text-xs font-semibold">📱 Mobile Money</span>
              <span className="px-3 py-1 bg-white border rounded-lg text-xs font-semibold">💰 Espèces</span>
            </div>
          </div>
        </div>
      </section>

      {/* TABS SECTION */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('description')}
                className={`px-8 py-4 font-bold text-lg transition-all relative whitespace-nowrap ${activeTab === 'description' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
                📋 Description
                {activeTab === 'description' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-600 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('specs')}
                className={`px-8 py-4 font-bold text-lg transition-all relative whitespace-nowrap ${activeTab === 'specs' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
                ⚙️ Caractéristiques
                {activeTab === 'specs' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-600 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-8 py-4 font-bold text-lg transition-all relative whitespace-nowrap ${activeTab === 'reviews' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
                ⭐ Avis ({reviews.length})
                {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-600 rounded-t-full"></div>}
            </button>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[300px]">
            {activeTab === 'description' && (
                <div className="prose max-w-none">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">À propos de ce produit</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description || "Aucune description détaillée disponible pour ce produit."}</p>
                    
                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                        <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="font-bold text-sm">Qualité Premium</p>
                          <p className="text-xs text-gray-600">Matériaux de haute qualité</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                        <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="font-bold text-sm">Livraison Sécurisée</p>
                          <p className="text-xs text-gray-600">Emballage soigné</p>
                        </div>
                      </div>
                    </div>
                </div>
            )}

            {activeTab === 'specs' && (
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Caractéristiques techniques</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Catégorie</p>
                        <p className="font-semibold">{product.category?.nom || product.category?.name || "Non spécifié"}</p>
                      </div>
                      {product.brand && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Marque</p>
                          <p className="font-semibold">{product.brand}</p>
                        </div>
                      )}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Stock disponible</p>
                        <p className="font-semibold">{stock} unités</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Référence</p>
                        <p className="font-semibold">#{product.id}</p>
                      </div>
                    </div>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold text-gray-900">Avis clients</h3>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">{avgRating}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className={i < Math.floor(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{reviews.length} avis</p>
                          </div>
                        </div>

                        {reviews.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-2xl">
                                <p className="text-gray-500 text-lg">Soyez le premier à donner votre avis !</p>
                            </div>
                        ) : (
                            reviews.map((rev, idx) => (
                                <div key={idx} className="pb-6 border-b last:border-0">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                          <div className="font-bold text-gray-900">{rev.user_name}</div>
                                          <div className="flex text-yellow-400 text-sm mt-1">
                                              {[...Array(5)].map((_, i) => (
                                                  <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                                              ))}
                                          </div>
                                        </div>
                                        <div className="text-sm text-gray-400">{rev.date}</div>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">{rev.comment}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="lg:col-span-5 bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-3xl h-fit sticky top-24 border border-orange-100">
                        <h4 className="font-bold text-xl mb-2">Partagez votre expérience</h4>
                        <p className="text-sm text-gray-600 mb-6">Votre avis compte pour nous !</p>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setSubmittingReview(true);
                            fetch("http://localhost:5000/api/reviews", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ ...newReview, product_id: product.id })
                            })
                            .then(res => res.json())
                            .then(data => {
                                setReviews([data, ...reviews]);
                                setNewReview({ rating: 5, comment: "", user_name: "" });
                            })
                            .catch(err => alert("Erreur ajout avis"))
                            .finally(() => setSubmittingReview(false));
                        }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">Votre Nom</label>
                                <input 
                                    required 
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all" 
                                    placeholder="Ex: Jean Dupont"
                                    value={newReview.user_name}
                                    onChange={e => setNewReview({...newReview, user_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">Votre Note</label>
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map(star => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({...newReview, rating: star})}
                                            className={`text-3xl transition-all hover:scale-125 ${newReview.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">Votre Commentaire</label>
                                <textarea 
                                    required 
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all resize-none" 
                                    rows="4"
                                    placeholder="Partagez votre expérience avec ce produit..."
                                    value={newReview.comment}
                                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                                ></textarea>
                            </div>
                            <button 
                                disabled={submittingReview}
                                type="submit" 
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-xl active:scale-95"
                            >
                                {submittingReview ? "Envoi en cours..." : "✓ Publier mon avis"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mb-20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🔥</span> Produits similaires
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {similarProducts.slice(0, 6).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  );
};

export default ProductDetails;
