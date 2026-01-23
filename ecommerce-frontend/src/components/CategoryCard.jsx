import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFeaturedCategories } from "../services/api";

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <p className="text-gray-500">Chargement des catégories...</p>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-14">
      <h2 className="text-2xl font-bold mb-6">
        Catégories populaires
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((item) => (
          <div
            key={item._id}
            className="bg-gray-800 rounded-2xl p-6 text-white"
          >
            <img
              src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
              alt={item.category.name}
              width="400"
              height="160"
              loading="lazy"
              className="h-40 w-full object-cover rounded-xl"
            />

            <h3 className="text-lg font-bold mt-4">
              {item.category.name}
            </h3>

            <button
              onClick={() => {
                const catId = item.category?.id || item.category?._id || item.category?.slug;
                navigate(`/shop?category=${catId}`);
              }}
              className="mt-4 bg-white text-gray-900 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Voir plus →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
