import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCategories, createCategory, deleteCategory } from "../../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================
     LOAD CATEGORIES
  ===================== */
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError("Impossible de charger les catégories");
    }
  }

  /* =====================
     ADD CATEGORY
  ===================== */
  async function handleAddCategory() {
    if (!newCategory.trim()) return;

    setLoading(true);
    setError("");

    try {
      const created = await createCategory(newCategory.trim());
      setCategories((prev) => [...prev, created]);
      setNewCategory("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* =====================
     DELETE CATEGORY
  ===================== */
  async function handleDeleteCategory(id) {
    const confirmed = window.confirm("Supprimer cette catégorie ?");
    if (!confirmed) return;

    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Catégories
        </h1>
        <p className="text-sm text-gray-500">
          Gérez les catégories de vos produits
        </p>
      </header>

      {/* ADD CATEGORY */}
      <section className="bg-white border rounded-xl p-4 space-y-3">
        <label className="block text-sm font-medium">
          Nouvelle catégorie
        </label>

        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Ex : Électronique"
            className="flex-1 border rounded-lg px-3 py-2 text-sm
                       focus:ring-2 focus:ring-black focus:outline-none"
          />

          <button
            onClick={handleAddCategory}
            disabled={loading}
            className="bg-black text-white px-4 rounded-lg
                       flex items-center gap-2 text-sm
                       hover:bg-gray-800 disabled:opacity-50"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </section>

      {/* LIST */}
      <section className="bg-white border rounded-xl divide-y">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            Aucune catégorie pour le moment
          </p>
        ) : (
categories.map((cat) => (
  <div
    key={cat._id || cat.id}
    className="flex items-center justify-between px-4 py-3"
  >
    <span className="text-sm font-medium">{cat.name}</span>

    <button
      onClick={() => handleDeleteCategory(cat._id || cat.id)}
      className="text-gray-400 hover:text-red-600"
    >
      <Trash2 size={18} />
    </button>
  </div>
))

        )}
      </section>
    </div>
  );
}
