import { AlertTriangle, TrendingUp, PackageX } from "lucide-react";

function StatCard({ title, value, subtitle, color }) {
  const config = {
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: <TrendingUp size={22} />,
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: <AlertTriangle size={22} />,
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: <PackageX size={22} />,
    },
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${config[color].text}`}>
            {value}
          </p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${config[color].bg} ${config[color].text}`}
        >
          {config[color].icon}
        </div>
      </div>
    </div>
  );
}
