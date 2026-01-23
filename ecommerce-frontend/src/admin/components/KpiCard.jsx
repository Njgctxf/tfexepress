
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const KpiCard = ({ title, value, icon, gradient, trend, trendUp, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-[100px] transition-all group-hover:scale-110`} />

        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-all`}>
                {icon}
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </div>
            )}
        </div>

        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h3>
    </div>
);

export default KpiCard;
