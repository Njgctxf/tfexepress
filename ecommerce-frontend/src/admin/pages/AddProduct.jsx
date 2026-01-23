import { ArrowLeft, Save, Tag, DollarSign, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CategorySelect from "../components/CategorySelect";
import ImageUpload from "../components/ImageUpload";
import { createProduct } from "../../services/api";
import toast from "react-hot-toast";

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    images: [],
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
      await createProduct(form);
      toast.success("Produit ajouté avec succès !");
      navigate("/admin/products");
    } catch (error) {
      toast.error("Erreur lors de l'ajout du produit: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-black transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Ajouter un produit
            </h1>
            <p className="text-sm text-gray-500">
              Nouveau produit dans le catalogue
            </p>
          </div>
        </div>

        <button
          form="product-form"
          type="submit"
          disabled={loading}
          className="hidden sm:inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5"
        >
          <Save size={18} />
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          <Card title="Informations générales">
            <div className="space-y-4">
              <Field
                label="Nom du produit"
                name="name"
                placeholder="Ex: Sneakers Nike Air Max"
                value={form.name}
                onChange={handleChange}
                required
              />

              <Field
                label="Description"
                name="description"
                placeholder="Décrivez votre produit en détail..."
                value={form.description}
                onChange={handleChange}
                textarea
              />
            </div>
          </Card>

          <Card title="Tarification & Stock">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field
                label="Prix"
                name="price"
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                required
                icon={DollarSign}
                suffix="FCFA"
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Stock initial"
                  name="stock"
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  icon={Package}
                />
                <Field
                  label="Marque"
                  name="brand"
                  placeholder="Ex: Nike"
                  value={form.brand || ""}
                  onChange={handleChange}
                  icon={Tag}
                />
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Tailles ou Pointures (séparées par des virgules)"
                  name="sizes"
                  placeholder="Ex: S, M, L ou 40, 41, 42"
                  value={form.sizes || ""}
                  onChange={handleChange}
                  icon={Tag}
                />
                <p className="text-xs text-gray-500 mt-1 ml-1">Exemple: S, M, L, XL <strong>ou</strong> 38, 39, 40</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Médias">
            <div className="p-1">
              <ImageUpload
                value={form.images}
                onChange={(files) =>
                  setForm((prev) => ({ ...prev, images: files }))
                }
                multiple
              />
            </div>
          </Card>

          <Card title="Organisation">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  Catégorie
                </label>
                <CategorySelect
                  value={form.category}
                  onChange={(val) =>
                    setForm((prev) => ({ ...prev, category: val }))
                  }
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
          >
            <Save size={20} />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form >
    </div >
  );
}

function Card({ children, title }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {title && <h3 className="text-base font-bold text-gray-900 mb-5">{title}</h3>}
      {children}
    </div>
  );
}

function Field({ label, textarea, icon: Icon, suffix, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
            <Icon size={18} />
          </div>
        )}

        {textarea ? (
          <textarea
            {...props}
            rows="5"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none resize-none"
          />
        ) : (
          <input
            {...props}
            className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none ${Icon ? 'pl-10' : 'px-4'} ${suffix ? 'pr-12' : ''}`}
          />
        )}

        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}
