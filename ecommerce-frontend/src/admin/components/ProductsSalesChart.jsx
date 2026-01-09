import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#ef4444"];

export default function ProductsSalesChart({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-[380px]">
      <h3 className="text-base font-semibold mb-1">
        Ventes par produit
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Comparaison des performances de vente
      </p>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={10}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sold" radius={[10, 10, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
 