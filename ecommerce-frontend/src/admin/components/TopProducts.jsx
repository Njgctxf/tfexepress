const products = [
  { name: "Casque Bluetooth", sales: 320 },
  { name: "Power Bank", sales: 280 },
  { name: "Smart Watch", sales: 190 },
  { name: "Écouteurs AirPods", sales: 150 },
];

export default function TopProducts() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        Top produits
      </h3>

      <div className="space-y-3">
        {products.map((p, i) => (
          <div
            key={i}
            className="flex justify-between text-sm"
          >
            <span>{p.name}</span>
            <span className="font-semibold">
              {p.sales} ventes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
