import { ArrowLeft, Save, Tag, DollarSign, Package } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CategorySelect from "../components/CategorySelect";
import ImageUpload from "../components/ImageUpload";
import { getProductById, updateProduct } from "../../services/api";
import toast from "react-hot-toast";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    images: [],
  });

  // 1. Fetch Product Data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await getProductById(id);
        if (res.success && res.data) {
          const p = res.data;
          setForm({
            name: p.name,
            price: p.price,
            stock: p.stock,
            category: typeof p.category === 'object' ? (p.category.id || p.category._id) : p.category,
            description: p.description || "",
            // Handle legacy single image or new images array
            images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
            sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : "",
            brand: p.brand || "",
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Impossible de charger le produit");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value, // Keep generic handler (unused for images)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Send the form object directly (products.api.js will handle image conversion)
      await updateProduct(id, form);
      toast.success("Produit mis à jour avec succès !");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* HEADER */}
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
              Modifier le produit
            </h1>
            <p className="text-sm text-gray-500">
              ID: {id}
            </p>
          </div>
        </div>

        <button
          form="edit-product-form"
          type="submit"
          disabled={saving}
          className="hidden sm:inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5"
        >
          <Save size={18} />
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>

      {/* FORM */}
      <form
        id="edit-product-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* LEFT COLUMN: MAIN INFO */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Informations générales">
            <div className="space-y-4">
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
            </div>
          </Card>

          <Card title="Tarification & Stock">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field
                label="Prix"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                icon={DollarSign}
                suffix="FCFA"
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Stock"
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  icon={Package}
                />
                <Field
                  label="Marque"
                  name="brand"
                  value={form.brand || ""}
                  onChange={handleChange}
                  icon={Tag}
                />
              </div>

              <Field
                label="Tailles disponibles (séparées par des virgules)"
                name="sizes"
                placeholder="Ex: S, M, L ou 40, 41, 42"
                value={form.sizes || ""}
                onChange={handleChange}
              />
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: MEDIA & ORG */}
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

        {/* MOBILE ACTION BAR */}
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
          >
            <Save size={20} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =====================
   COMPONENTS (Shared style with AddProduct)
===================== */

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
