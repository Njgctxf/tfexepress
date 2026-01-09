import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Lun", sales: 120000 },
  { day: "Mar", sales: 98000 },
  { day: "Mer", sales: 150000 },
  { day: "Jeu", sales: 80000 },
  { day: "Ven", sales: 200000 },
  { day: "Sam", sales: 175000 },
  { day: "Dim", sales: 220000 },
];

export default function SalesChart() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        Ventes hebdomadaires
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sales"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
