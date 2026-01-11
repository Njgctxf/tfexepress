import { useState, useEffect } from "react";
import { getProductById, getProducts } from "../services/api/products.api";
import MainLayout from "../layout/MainLayout";
import ProductImageSlider from "../components/ProductImageSlider";
import ProductCard from "../components/ProductCard";
import Breadcrumb from "../components/Breadcrumb";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useParams } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (res.success) {
          setProduct(res.data);
          
          // Fetch similar products
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

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Breadcrumb
          category={product.category}
          productName={product.name}
        />
      </div>

      <section className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
        <ProductImageSlider images={product.images} />

        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>

          <div className="text-3xl font-bold text-red-500 mt-6">
            {product.price.toLocaleString()} FCFA
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => addToCart(product)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold"
            >
              Ajouter au panier
            </button>

            <button
              onClick={() => toggleFavorite(product)}
              className={`
                px-6 py-3 rounded-full font-semibold border
                flex items-center gap-2
                ${
                  isFavorite(product.id)
                    ? "bg-red-50 text-red-600 border-red-500"
                    : "hover:bg-gray-100"
                }
              `}
            >
              {isFavorite(product.id) ? "❤️ Ajouté" : "🤍 Favoris"}
            </button>
          </div>
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-16 mb-20">
          <h2 className="text-xl font-bold mb-6">
            Produits similaires
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-4">
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
