import { useEffect, useState } from "react";
import {
  getCategories,
  getFeaturedCategories,
  createFeaturedCategory,
  deleteFeaturedCategory,
} from "../../services/api";

const AdminFeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  const [category, setCategory] = useState("");
  const [position, setPosition] = useState(1);
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cats = await getCategories();
    const feat = await getFeaturedCategories();
    setCategories(cats);
    setFeatured(feat);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (featured.length >= 4) {
    alert("Maximum 4 catégories mises en avant");
    return;
  }

  if (!category) {
    alert("Veuillez sélectionner une catégorie.");
    return;
  }

  if (!image) {
    alert("Veuillez sélectionner une image.");
    return;
  }

  try {
    await createFeaturedCategory({
      category,
      position,
      image,
    });

    setCategory("");
    setImage(null);
    setPosition(1);
    loadData();
  } catch (err) {
    alert(err.message);
  }
};


  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        Catégories vedettes
      </h1>

      {/* FORMULAIRE */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow space-y-4"
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Choisir une catégorie</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="w-full border p-2 rounded"
          required
        >
          <option value={1}>Position 1</option>
          <option value={2}>Position 2</option>
          <option value={3}>Position 3</option>
          <option value={4}>Position 4</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Mettre en avant
        </button>
      </form>

      {/* LISTE DES CATÉGORIES VEDETTES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {featured.map((item) => (
          <div key={item._id} className="border rounded-xl p-3">
            <img
              src={`http://localhost:5000${item.image}`}
              className="h-32 w-full object-cover rounded"
            />
            <p className="font-semibold mt-2">
              {item.category.name}
            </p>
            <p className="text-sm text-gray-500">
              Position {item.position}
            </p>

            <button
              onClick={() =>
                deleteFeaturedCategory(item._id).then(loadData)
              }
              className="text-red-600 text-sm mt-2"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeaturedCategories;
