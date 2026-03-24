import { useNavigate } from "react-router-dom";
import { Zap, Star, Clock, Gift, Grid, Flame, Truck, ShieldCheck, Tag, ThumbsUp } from "lucide-react";


const QuickActions = () => {
    const navigate = useNavigate();


    const actions = [
        {
            id: 1,
            label: "Promos", // Falsh Deals
            icon: Zap,
            color: "bg-red-500",
            link: "/shop?sort=price-asc"
        },
        {
            id: 2,
            label: "Nouveautés", // New
            icon: Clock,
            color: "bg-blue-500",
            link: "/shop?sort=recent"
        },
        {
            id: 3,
            label: "Populaire", // Best Sellers
            icon: Flame,
            color: "bg-orange-500",
            link: "/shop?sort=rating"
        },
        {
            id: 4,
            label: "Marques", // Brands
            icon: Tag,
            color: "bg-purple-500",
            link: "/shop" // Could be brands page if exists
        },
        {
            id: 5,
            label: "Cadeaux", // Gifts
            icon: Gift,
            color: "bg-pink-500",
            link: "/shop"
        },
        {
            id: 6,
            label: "Livraison", // Delivery info
            icon: Truck,
            color: "bg-green-500",
            link: "/help"
        },
        {
            id: 7,
            label: "Garantie", // Warranty
            icon: ShieldCheck,
            color: "bg-indigo-500",
            link: "/help"
        },
        {
            id: 8,
            label: "Tout voir", // See all
            icon: Grid,
            color: "bg-black",
            link: "/shop"
        }
    ];

    return (
        <section className="md:hidden px-4 mt-4">
            <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => navigate(action.link)}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${action.color} text-white flex items-center justify-center shadow-md shadow-gray-200 group-active:scale-95 transition-transform`}>
                            <action.icon size={22} fill="currentColor" className="text-white/90" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 leading-tight text-center">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default QuickActions;
