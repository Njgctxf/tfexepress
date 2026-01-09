export default function CategorySelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border p-2 rounded"
      required
    >
      <option value="">Sélectionner une catégorie</option>
      <option value="electronique">Électronique</option>
      <option value="vetements">Vêtements</option>
      <option value="accessoires">Accessoires</option>
      <option value="maison">Maison</option>
    </select>
  );
}
