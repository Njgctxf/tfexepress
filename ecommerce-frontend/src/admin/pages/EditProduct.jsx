import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import CategorySelect from "../components/CategorySelect";
import ImageUploader from "../components/ImageUploader";
import ImageUpload from "../components/ImageUpload";

export default function EditProduct() {
  const navigate = useNavigate();
  const { productId } = useParams();

  // 🔧 MOCK DATA
  const [form, setForm] = useState({
    name: "Casque Bluetooth",
    price: 25000,
    stock: 12,
    category: "Électronique",
    description: "Casque sans fil haute qualité",
    images: [], // ✅ MULTI IMAGES
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log("Produit modifié :", form);
    console.log("Images :", form.images);

    // 🔥 Supabase update plus tard
  }

function handleSubmit(e) {
  e.preventDefault();
  console.log("Produit modifié :", form);
  alert("Produit modifié avec succès");
  navigate("/admin/products");
}
  function handleDelete() {
    const confirm = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce produit ?"
    );
    if (confirm) {
      // 🔥 Supabase delete plus tard
      alert("Produit supprimé avec succès");
      navigate("/admin/products");
    }
  };
  return (
    <div className="max-w-4xl space-y-6">
      {/* 🔙 RETOUR */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
      >
        <ArrowLeft size={18} />
        Retour aux produits
      </button>

      {/* 🧾 HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Modifier le produit
          </h2>
          <p className="text-gray-500 text-sm">
            ID : {productId}
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          <Trash2 size={16} />
          Supprimer
        </button>
      </div>

      {/* 📦 FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-6"
      >
        {/* NOM */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom du produit
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
          />
        </div>

        {/* PRIX + STOCK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Prix (FCFA)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* CATÉGORIE */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Catégorie
          </label>
          <CategorySelect
            value={form.category}
            onChange={(val) =>
              setForm({ ...form, category: val })
            }
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            rows="4"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        {/* 🖼️ IMAGES (PRO) */}
<div>
  <label className="block text-sm font-medium mb-2">
    Image du produit
  </label>

  <ImageUpload
    value={form.image}
    onChange={(file) =>
      setForm({ ...form, image: file })
    }
  />
</div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            <Save size={18} />
            Enregistrer
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
