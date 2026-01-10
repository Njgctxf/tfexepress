import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CategorySelect from "../components/CategorySelect";
import ImageUpload from "../components/ImageUpload";
import { createProduct } from "../../services/api";

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);
      formData.append("description", form.description);
      if (form.image) {
        formData.append("image", form.image);
      }

      await createProduct(formData);
      navigate("/admin/products");
    } catch (error) {
      alert("❌ Erreur lors de l'ajout du produit: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8">
{/* HEADER */}
<div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
  {/* LEFT */}
  <div>
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-2 p-8"
    >
      <ArrowLeft size={16} />
      Produits
    </button>

    <h1 className="text-2xl font-semibold text-gray-900">
      Ajouter un produit
    </h1>
    <p className="text-sm text-gray-500">
      Configurez les informations de votre produit
    </p>
  </div>

  {/* RIGHT (DESKTOP ACTION) */}
  <button
    form="product-form"
    type="submit"
    disabled={loading}
    className="hidden sm:inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
  >
    <Save size={16} />
    {loading ? "Enregistrement..." : "Enregistrer"}
  </button>
</div>

      {/* FORM */}
      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Field
              label="Nom du produit"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Field
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              textarea
            />
          </Card>

          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Prix (FCFA)"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
              />

              <Field
                label="Quantité en stock"
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Catégorie
              </label>
              <CategorySelect
                value={form.category}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, category: val }))
                }
              />
            </div>
          </Card>

          {/* DESKTOP SUBMIT BUTTON (BOTTOM) */}
          <div className="hidden sm:flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={18} />
              {loading ? "Enregistrement..." : "Enregistrer le produit"}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-medium mb-3">Image</h3>
            <ImageUpload
              value={form.image}
              onChange={(file) =>
                setForm((prev) => ({ ...prev, image: file }))
              }
            />
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG – max 2MB
            </p>
          </Card>
        </div>

        {/* MOBILE ACTION BAR */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer le produit"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =====================
   SHOPIFY-LIKE UI
===================== */

function Card({ children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      {children}
    </div>
  );
}

function Field({ label, textarea, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          {...props}
          rows="4"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
        />
      ) : (
        <input
          {...props}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
        />
      )}
    </div>
  );
}
