import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Package, AlertTriangle, User, CheckCircle, Trash2, Clock, Filter, Check, Info } from "lucide-react";
import { useAdminNotifications } from "../context/AdminNotificationsContext";

export default function Notifications() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("all");
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useAdminNotifications();

    const filteredNotifications = notifications.filter(n => {
        if (filter === "all") return true;
        return n.type === filter;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'order': return Package;
            case 'user': return User;
            case 'alert': return AlertTriangle;
            default: return Info;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'order': return "bg-blue-50 text-blue-600";
            case 'user': return "bg-green-50 text-green-600";
            case 'alert': return "bg-orange-50 text-orange-600";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    const getFilterClass = (key) => {
        return `px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === key ? "bg-black text-white shadow-md" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
            }`;
    };

    const handleNotificationClick = (notif) => {
        if (!notif.read) markAsRead(notif.id);
        if (notif.link) {
            navigate(notif.link);
        } else {
            switch (notif.type) {
                case "order": navigate("/admin/orders"); break;
                case "user": navigate("/admin/users"); break;
                case "alert": navigate("/admin/products"); break;
                default: break;
            }
        }
    };

    return (
        <div className="space-y-6 pt-2 pb-10 max-w-[1000px] w-full mx-auto">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        Notifications
                        <span className="text-sm font-bold bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full">
                            {notifications.filter(n => !n.read).length} nouvelles
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-1">Historique de vos alertes et activités</p>
                </div>
                <button
                    onClick={markAllAsRead}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 text-sm"
                >
                    <Check size={16} />
                    Tout marquer comme lu
                </button>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilter("all")} className={getFilterClass("all")}>Tout</button>
                <button onClick={() => setFilter("order")} className={getFilterClass("order")}>Commandes</button>
                <button onClick={() => setFilter("user")} className={getFilterClass("user")}>Clients</button>
                <button onClick={() => setFilter("alert")} className={getFilterClass("alert")}>Alertes</button>
            </div>

            {/* LIST */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((notif) => {
                            const Icon = getIcon(notif.type);
                            const colorClass = getColor(notif.type);

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-5 flex gap-5 group transition-colors hover:bg-gray-50/80 cursor-pointer ${!notif.read ? "bg-blue-50/30" : ""}`}
                                >
                                    {/* ICON */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${colorClass}`}>
                                        <Icon size={22} />
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className={`text-base font-bold leading-tight ${!notif.read ? "text-gray-900" : "text-gray-700"}`}>
                                                    {notif.title}
                                                    {!notif.read && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2 align-middle"></span>}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">{notif.message || notif.desc}</p>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                                                <Clock size={12} />
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notif.read && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Marquer comme lu"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Aucune notification</h3>
                        <p className="text-gray-500 mt-1">Vous êtes à jour !</p>
                    </div>
                )}
            </div>
        </div>
    );
}
