import { useEffect, useState } from "react";
import { getCategories } from "../../services/api";

export default function CategorySelect({ value, onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border p-2 rounded"
      required
    >
      <option value="">Sélectionner une catégorie</option>
      {categories.map((cat) => (
        <option key={cat._id || cat.id} value={cat._id || cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
