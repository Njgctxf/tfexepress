import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import {
    Package, MapPin, Heart, Save, Trash, User, Truck, RotateCcw,
    Award, Ticket, CheckCircle, Plus, X, ChevronRight, LogOut,
    CreditCard, Bell, Settings, Search, Calendar, ChevronDown,
    Shield, Key, Lock, Menu, Eye, EyeOff, Medal, Crown, Trophy, ShoppingBag, UserPlus
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";

export default function UserDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("orders");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Data
    const [orders, setOrders] = useState([]);
    const [profile, setProfile] = useState({});
    const [favorites, setFavorites] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [addresses, setAddresses] = useState([]);

    // Password visibility state
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // Form states for profile
    const [formData, setFormData] = useState({
        full_name: "",
        address: "",
        city: "",
        zip: "",
        phone: ""
    });
    const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // New Address Modal State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({ title: "", address: "", city: "", phone: "" });

    // Confirmation Modal State
    const [pendingAction, setPendingAction] = useState(null);

    useEffect(() => {
        if (!user && !authLoading) {
            navigate("/login");
            return;
        }
        if (user) {
            fetchDashboardData();
        }
    }, [user, authLoading]);

    async function fetchDashboardData() {
        try {
            setLoading(true);

            // 1. Fetch Profile
            try {
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', user.email)
                    .maybeSingle(); // Changed from single() to maybeSingle() to avoid 406 on empty

                if (error) console.error("Profile fetch error:", error);

                if (profileData) {
                    setProfile(profileData);
                    setFormData({
                        first_name: profileData.first_name || "",
                        last_name: profileData.last_name || "",
                        phone: profileData.phone || "",
                        address: profileData.address || "",
                        city: profileData.city || "",
                        zip: profileData.zip || ""
                    });
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
            }

            // 2. Fetch Orders
            try {
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('*, items:order_items(*)')
                    .eq('user_email', user.email)
                    .order('created_at', { ascending: false });

                if (ordersError) throw ordersError;

                if (ordersData) {
                    // Normalize items
                    const formattedOrders = ordersData.map(o => ({
                        ...o,
                        items: o.items || o.order_items || []
                    }));
                    setOrders(formattedOrders);
                }
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            }

            // 3. Fetch Favorites
            const { data: favData } = await supabase
                .from("favorites")
                .select(`id, product:products (*)`)
                .eq("user_id", user.id);
            if (favData) {
                setFavorites(favData.filter(f => f.product).map(f => ({ ...f.product, fav_id: f.id })));
            }

            // 4. Fetch Extra Addresses
            const { data: addrData } = await supabase
                .from("user_addresses")
                .select("*")
                .eq("user_id", user.id);
            if (addrData) setAddresses(addrData);

            // 5. Fetch Coupons
            try {
                // Removing explicit ordering to check if it resolves 400 error.
                // Assuming coupons might not have created_at transparently visible or some other issue.
                const { data: couponsData, error: couponsError } = await supabase
                    .from("coupons")
                    .select("*");
                // .order("created_at", { ascending: false }); 

                if (couponsError) {
                    console.error("Coupons fetch error:", couponsError);
                } else if (couponsData) {
                    // Client-side filtering
                    const now = new Date();
                    const validCoupons = couponsData.filter(c => new Date(c.expires_at) >= now);

                    // Client-side sort if needed
                    validCoupons.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                    setCoupons(validCoupons.map(c => ({
                        code: c.code,
                        description: c.description,
                        expires: c.expires_at,
                        discount: `-${c.discount_percent}%`
                    })));
                } else {
                    setCoupons([]);
                }
            } catch (err) {
                console.error("Coupons error:", err);
            }

        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    }

    // UPDATE PROFILE
    async function handleUpdateProfile(e) {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    zip: formData.zip
                })
                .eq('email', user.email) // secure enough for now, ideally user_id
                .select()
                .single();

            if (error) throw error;

            toast.success("Informations mises à jour avec succès !", {
                position: "top-right",
                icon: "✅"
            });

            setMessage(""); // Clear message as we use toast now
            setProfile({ ...profile, ...data });
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Erreur lors de la mise à jour", {
                position: "top-right"
            });
            setMessage("");
        } finally {
            setSaving(false);
        }
    }

    // UPDATE PASSWORD (REAL BACKEND)
    async function handleUpdatePassword(e) {
        e.preventDefault();
        setMessage(""); // Clear global message if any

        if (passData.new !== passData.confirm) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }
        if (passData.new.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passData.new
            });

            if (error) throw error;

            toast.success("Mot de passe mis à jour avec succès");
            setPassData({ current: "", new: "", confirm: "" });
        } catch (error) {
            console.error("Password update error:", error);
            toast.error("Erreur lors de la mise à jour : " + error.message);
        } finally {
            setSaving(false);
        }
    }

    // CONFIRM ACTIONS HANDLER
    const handleConfirmAction = async () => {
        if (!pendingAction) return;

        if (pendingAction.type === 'deleteAccount') {
            await performDeleteAccount();
        } else if (pendingAction.type === 'deleteAddress') {
            await performDeleteAddress(pendingAction.payload);
        }
    };

    // DELETE ACCOUNT LOGIC
    async function performDeleteAccount() {
        const toastId = toast.loading("Suppression du compte en cours...");

        try {
            // Delete profile (public data)
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id);

            if (error) throw error;

            toast.success("Votre compte a été supprimé.", { id: toastId });

            // Sign out locally
            await supabase.auth.signOut();
            window.location.href = "/"; // Redirect home
        } catch (error) {
            console.error("Delete Account Error:", error);
            toast.error("Erreur suppression: " + error.message, { id: toastId });
        }
    }

    // DELETE ADDRESS LOGIC
    async function performDeleteAddress(id) {
        try {
            await supabase.from("user_addresses").delete().eq("id", id);
            setAddresses(addresses.filter(a => a.id !== id));
            toast.success("Adresse supprimée");
        } catch (error) {
            toast.error("Erreur suppression adresse");
        }
    }

    // ADD NEW ADDRESS
    async function handleAddAddress(e) {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from("user_addresses")
                .insert([{ ...newAddress, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;

            setAddresses([...addresses, data]);
            setShowAddressModal(false);
            setNewAddress({ title: "", address: "", city: "", phone: "" });
        } catch (error) {
            alert("Erreur ajout adresse: " + error.message);
        }
    }

    async function handleDeleteAddress(id) {
        setPendingAction({ type: 'deleteAddress', payload: id });
    }

    // REMOVE FAVORITE
    async function removeFavorite(favId) {
        const { error } = await supabase.from("favorites").delete().eq("id", favId);
        if (!error) {
            setFavorites(prev => prev.filter(f => f.fav_id !== favId));
        }
    }

    // IMAGE HELPER
    const getImageUrl = (item) => {
        let img = item.image || (item.images && item.images[0]);
        if (img && img.startsWith("/")) {
            return `http://localhost:5000${img}`;
        }
        return img || "/placeholder.png";
    };

    const OrderDetailsModal = ({ order, onClose }) => {
        if (!order) return null;

        // Calculate Subtotals
        const subtotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
        const shipping = 0; // Free shipping logic for now

        return (
            <div className="fixed inset-0 z-[100] flex justify-end bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-300 print:bg-white print:static print:block" onClick={onClose}>

                {/* DRAWER CANVAS - Slide Over */}
                <div
                    className="bg-white w-full max-w-md h-full overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.2)] animate-in slide-in-from-right duration-300 relative flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print:overflow-visible"
                    onClick={e => e.stopPropagation()}
                >

                    {/* --- PRINT HEADER (LOGO) --- */}
                    <div className="hidden print:block mb-8 text-center pt-8 border-b border-gray-100 pb-4">
                        <h1 className="text-4xl font-black text-black tracking-tighter">TF EXPRESS</h1>
                        <p className="text-gray-500 text-sm mt-1">Votre partenaire shopping en ligne</p>
                    </div>

                    {/* --- HEADER ACTIONS (SCREEN ONLY) --- */}
                    <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between z-10 print:hidden">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-mono">#{order.id.toString().slice(-3)}</span>
                            Détails de la commande
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={() => window.print()} className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all" title="Imprimer">
                                <span className="sr-only">Imprimer</span> 🖨️
                            </button>
                            <button onClick={onClose} className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* --- INVOICE CONTENT --- */}
                    <div className="p-8 md:p-12 space-y-8 flex-1 print:p-0 print:space-y-6">

                        {/* 1. Header Info */}
                        <div className="flex flex-col gap-6 border-b border-gray-100 pb-8 print:flex-row print:justify-between print:gap-8 print:items-start print:pb-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Facturé à</p>
                                <h3 className="text-xl font-bold text-gray-900">{profile.full_name || order.user_email}</h3>
                                <div className="text-sm text-gray-500 mt-2 space-y-0.5">
                                    <p>{profile.address}</p>
                                    <p>{profile.city} {profile.zip && `, ${profile.zip}`}</p>
                                    <p>{profile.phone}</p>
                                    <p className="text-gray-400 print:text-black">{user.email}</p>
                                </div>
                            </div>
                            <div className="text-left print:text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Réf. Commande</p>
                                <h3 className="text-2xl font-mono font-black text-gray-900">#{order.id}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Du {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-3 border print:border-black print:text-black
                                    ${order.status === 'Livré' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                    {order.status}
                                </div>
                            </div>
                        </div>

                        {/* 2. Items Table */}
                        <div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-900 text-xs font-black uppercase text-gray-900 tracking-wider">
                                        <th className="py-4 font-black">Article</th>
                                        <th className="py-4 text-center">Qté</th>
                                        <th className="py-4 text-right">Prix Unit.</th>
                                        <th className="py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {order.items?.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 print:hover:bg-transparent">
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-4">
                                                    {/* Hide image on print generally better, or keep small */}
                                                    <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0 print:hidden">
                                                        <img src={getImageUrl(item)} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{item.name}</p>
                                                        {item.size && <p className="text-[10px] text-black font-bold mt-0.5">Taille: {item.size}</p>}
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.brand}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center font-medium text-gray-600">x{item.quantity}</td>
                                            <td className="py-4 text-right font-medium text-gray-600">{(item.price || 0).toLocaleString()}</td>
                                            <td className="py-4 text-right font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 3. Totals */}
                        <div className="flex justify-end pt-4">
                            <div className="w-full md:w-1/2 space-y-3">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Sous-total</span>
                                    <span>{subtotal.toLocaleString()} FCFA</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Livraison</span>
                                    <span>Gratuit / Inclus</span>
                                </div>
                                <div className="border-t border-gray-900 pt-4 mt-4 flex justify-between items-end">
                                    <div>
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Total Payé</span>
                                        <div className="text-xs text-gray-400 font-normal mt-1">{order.payment_method || "Espèces"}</div>
                                    </div>
                                    <span className="text-3xl font-black text-gray-900 tracking-tight">{(Number(order.total) || 0).toLocaleString()} <span className="text-sm font-bold text-gray-500">FCFA</span></span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Footer Note */}
                        <div className="border-t border-gray-100 pt-8 mt-4 text-center print:mt-12">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Merci de votre confiance</p>
                            <p className="text-xs text-gray-400 max-w-md mx-auto">
                                Si vous avez des questions concernant cette facture, contactez-nous à support@tfexpress.com ou au +225 01 02 03 04.
                            </p>
                        </div>
                    </div>

                    {/* --- ACTIONS FOOTER (SCREEN ONLY) --- */}
                    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-6 flex justify-between items-center z-10 print:hidden">
                        <p className="text-xs font-bold text-gray-400 uppercase">TF Express Inc.</p>
                        <button onClick={() => window.print()} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition-all shadow-lg hover:shadow-yellow-200 flex items-center gap-2">
                            Télécharger PDF / Imprimer
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const getStatusStep = (status) => {
        switch (status?.toLowerCase()) {
            case 'en attente': return 1;
            case 'en cours': return 1;
            case 'expédié': return 2;
            case 'livré': return 3;
            default: return 0;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Livré': return 'bg-green-100 text-green-700';
            case 'Expédié': return 'bg-yellow-100 text-yellow-800';
            case 'En cours': return 'bg-blue-50 text-blue-700';
            case 'Annulé': return 'bg-red-50 text-red-700';
            case 'Remboursé': return 'bg-purple-50 text-purple-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (authLoading) return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin"></div>
                <p className="font-medium text-gray-500 animate-pulse">Chargement...</p>
            </div>
        </div>
    );

    if (!user) return null;

    // --- UI HELPERS ---
    const TabButton = ({ id, label, icon: Icon, active, mobile }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`
                group relative flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 whitespace-nowrap
                ${mobile
                    ? `flex-none border ${active ? "bg-gray-900 text-white border-gray-900 shadow-md transform scale-105" : "bg-white text-gray-500 border-gray-200"}`
                    : `w-full ${active ? "bg-gray-900 text-white shadow-lg shadow-gray-200 translate-x-1" : "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm hover:translate-x-1"}`
                }
            `}
        >
            <Icon size={20} className={`transition-colors duration-300 ${active ? "text-yellow-400" : "text-gray-400 group-hover:text-yellow-500"}`} />
            <span className={mobile ? "" : "flex-1 text-left"}>{label}</span>
            {active && !mobile && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-400 rounded-r-full" />}
        </button>
    );

    const TABS = [
        { id: "orders", label: "Commandes", icon: Package },
        { id: "profile", label: "Mon Profil", icon: User },
        { id: "security", label: "Sécurité", icon: Shield },
        { id: "addresses", label: "Adresses", icon: MapPin },
        { id: "wishlist", label: "Favoris", icon: Heart },
        { id: "loyalty", label: "Fidélité", icon: Ticket },
    ];

    return (
        <MainLayout>
            {/* Modal Portal (can be here or via createPortal, keeping it simple) */}
            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

            <div className="min-h-screen bg-[#F8F9FB] pt-8 md:pt-12 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- HEADER PROFILE SECTION --- */}
                    <div className="relative mb-8 md:mb-12">
                        {/* Decorative Background Blur */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-50 to-orange-50 rounded-[40px] -z-10 blur-xl opacity-60 transform -translate-y-4"></div>

                        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[40px] p-6 md:p-10 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 transition-all">
                            {/* User Info */}
                            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full md:w-auto text-center md:text-left">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                                    <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gray-900 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold text-yellow-400 border-4 border-white shadow-lg">
                                        {profile.full_name?.[0] || user.email[0].toUpperCase()}
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 border-4 border-white rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
                                        {profile.full_name || "Bonjour, Client"}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-800 text-xs font-bold uppercase tracking-wide">
                                            <Award size={14} /> {profile.loyalty_tier || "Membre Bronze"}
                                        </span>
                                        <span className="text-gray-400 text-sm font-medium">{user.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto bg-gray-50/50 p-2 md:p-3 rounded-3xl border border-gray-100">
                                <div className="flex-1 min-w-[120px] md:min-w-[160px] bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 text-center group hover:border-yellow-200 transition-all cursor-default">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 group-hover:text-yellow-600 transition-colors">Mes Points</p>
                                    <p className="text-2xl md:text-3xl font-black text-gray-900">{profile.loyalty_points || 0}</p>
                                </div>
                                <div className="flex-1 min-w-[120px] md:min-w-[160px] bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 text-center group hover:border-blue-200 transition-all cursor-default">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 group-hover:text-blue-600 transition-colors">Commandes</p>
                                    <p className="text-2xl md:text-3xl font-black text-gray-900">{orders.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                        {/* --- MOBILE NAVIGATION (Horizontal Scroll) --- */}
                        <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-4 scrollbar-hide">
                            <div className="flex gap-3">
                                {TABS.map(tab => (
                                    <TabButton key={tab.id} {...tab} active={activeTab === tab.id} mobile />
                                ))}
                            </div>
                        </div>

                        {/* --- DESKTOP SIDEBAR NAVIGATION --- */}
                        <aside className="hidden lg:block lg:w-72 shrink-0">
                            <div className="sticky top-32 space-y-8">
                                <nav className="bg-white/50 backdrop-blur-md rounded-3xl p-3 shadow-lg shadow-gray-100/50 border border-white/60 space-y-1">
                                    {TABS.map(tab => (
                                        <TabButton key={tab.id} {...tab} active={activeTab === tab.id} />
                                    ))}
                                </nav>

                                <div className="bg-red-50 rounded-3xl p-6 text-center border border-red-100">
                                    <p className="text-red-900 font-bold mb-2">Besoin d'une pause ?</p>
                                    <button
                                        onClick={() => setPendingAction({ type: 'deleteAccount' })}
                                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                                    >
                                        <Trash size={18} /> Supprimer mon compte
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* --- MAIN CONTENT AREA --- */}
                        <main className="flex-1 min-w-0">
                            {loading ? (
                                <div className="bg-white rounded-[40px] p-20 flex flex-col items-center justify-center border border-gray-100 shadow-sm min-h-[500px]">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-gray-100 border-t-yellow-400 rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-8 h-8 bg-yellow-50 rounded-full"></div>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 font-medium tracking-wide animate-pulse">Chargement de vos données...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                                    {/* === TAB: ORDERS === */}
                                    {activeTab === 'orders' && (
                                        <div className="space-y-8">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Historique des commandes</h2>

                                                <div className="flex items-center gap-4 w-full md:w-auto">
                                                    {/* Search Input */}
                                                    <div className="relative flex-1 md:w-64">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                        <input
                                                            type="text"
                                                            placeholder="Rechercher (ID, Statut)..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all shadow-sm placeholder-gray-400"
                                                        />
                                                    </div>

                                                    {orders.length > 0 && <span className="shrink-0 text-sm font-bold text-gray-500 bg-white px-3 py-2.5 rounded-xl border border-gray-200 shadow-sm">{orders.length}</span>}
                                                </div>
                                            </div>

                                            {orders.filter(o =>
                                                o.id.toString().includes(searchTerm) ||
                                                o.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                o.total.toString().includes(searchTerm)
                                            ).length === 0 ? (
                                                <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-100">
                                                    <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500 animate-bounce">
                                                        <Package size={40} />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                        {orders.length === 0 ? "Aucune commande" : "Aucun résultat"}
                                                    </h3>
                                                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                                        {orders.length === 0
                                                            ? "Vous n'avez pas encore passé de commande. Découvrez nos produits et commencez votre shopping !"
                                                            : "Aucune commande ne correspond à votre recherche. Essayez un autre mot-clé."}
                                                    </p>
                                                    {orders.length === 0 && (
                                                        <Link to="/shop" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-yellow-400 hover:text-black transition-all shadow-lg hover:shadow-yellow-200">
                                                            Découvrir la boutique
                                                        </Link>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm">
                                                    <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                                        {orders.filter(o =>
                                                            o.id.toString().includes(searchTerm) ||
                                                            o.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            o.total.toString().includes(searchTerm)
                                                        ).map((order, idx) => (
                                                            <div key={order.id} className="p-5 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50/50 transition-colors group">

                                                                {/* 1. ID & Status */}
                                                                <div className="w-full sm:w-1/4 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-8 h-8 flex items-center justify-center bg-gray-900 text-yellow-400 rounded-lg text-xs font-mono font-bold">
                                                                            #{order.id.toString().slice(-3)}
                                                                        </span>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs font-bold text-gray-900">Commande</span>
                                                                            <span className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-transparent ${getStatusColor(order.status)}`}>
                                                                        {order.status}
                                                                    </span>
                                                                </div>

                                                                {/* 2. Thumbnails */}
                                                                <div className="w-full sm:flex-1 flex gap-2 overflow-x-auto scrollbar-hide py-1">
                                                                    {order.items?.slice(0, 4).map((item, i) => (
                                                                        <div key={i} className="relative w-12 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                                                            <img src={getImageUrl(item)} className="w-full h-full object-cover" alt="" />
                                                                            <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] px-1 font-bold">x{item.quantity}</div>
                                                                        </div>
                                                                    ))}
                                                                    {(order.items?.length || 0) > 4 && (
                                                                        <div className="w-12 h-14 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold text-gray-400 border border-dashed border-gray-200 shrink-0">
                                                                            <span>+{order.items.length - 4}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* 3. Total & Actions */}
                                                                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 sm:pl-6 sm:border-l border-gray-100 mt-2 sm:mt-0">
                                                                    <div className="text-right">
                                                                        <div className="font-black text-gray-900">{Number(order.total).toLocaleString()} FCFA</div>
                                                                        <div className="text-[10px] text-gray-400 font-medium">{order.items?.length || 0} Articles</div>
                                                                    </div>

                                                                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                                                        <button
                                                                            onClick={() => setSelectedOrder(order)}
                                                                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-md transition-all"
                                                                            title="Voir la facture"
                                                                        >
                                                                            <CreditCard size={16} />
                                                                        </button>
                                                                        <div className="w-px h-6 bg-gray-200"></div>
                                                                        <button
                                                                            onClick={() => navigate(`/order/${order.id}`)}
                                                                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-md transition-all"
                                                                            title="Voir les détails"
                                                                        >
                                                                            <ChevronRight size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* === TAB: PROFILE (Shopify Style) === */}
                                    {activeTab === 'profile' && (
                                        <div className="max-w-3xl mx-auto space-y-8">

                                            {/* Page Header */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900">Mon profil</h2>
                                                    <p className="text-sm text-gray-500 mt-1">Gérez vos informations personnelles</p>
                                                </div>
                                                {/* Button - Minimalist Style */}
                                                <button
                                                    onClick={handleUpdateProfile}
                                                    disabled={saving}
                                                    className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                                    Enregistrer
                                                </button>
                                            </div>

                                            <div className="space-y-6">


                                                {/* Card 1: Personal Details */}
                                                <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                                        <h3 className="text-sm font-semibold text-gray-900">Informations générales</h3>
                                                    </div>
                                                    <div className="p-6 space-y-5">
                                                        <div className="grid md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-700 mb-2">Prénom</label>
                                                                <input
                                                                    value={formData.first_name}
                                                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
                                                                    placeholder="Votre prénom"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-700 mb-2">Nom</label>
                                                                <input
                                                                    value={formData.last_name}
                                                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
                                                                    placeholder="Votre nom"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-700 mb-2">Téléphone</label>
                                                                <input
                                                                    value={formData.phone}
                                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
                                                                    placeholder="+225..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card 2: Account Info (Read Only) */}
                                                <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                                        <h3 className="text-sm font-semibold text-gray-900">Identifiants de connexion</h3>
                                                    </div>
                                                    <div className="p-6">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-700 mb-2">Adresse E-mail</label>
                                                            <div className="relative">
                                                                <input
                                                                    disabled
                                                                    value={user.email}
                                                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                                                                />
                                                                <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                            </div>
                                                            <p className="mt-2 text-xs text-gray-500">L'adresse e-mail ne peut pas être modifiée pour des raisons de sécurité.</p>
                                                        </div>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>
                                    )}

                                    {/* === TAB: SECURITY (Shopify Style) === */}
                                    {activeTab === 'security' && (
                                        <div className="max-w-3xl mx-auto space-y-8">

                                            {/* Header */}
                                            <div className="mb-8">
                                                <h2 className="text-2xl font-bold text-gray-900">Sécurité</h2>
                                                <p className="text-sm text-gray-500 mt-1">Gérez la sécurité de votre compte et vos identifiants.</p>
                                            </div>

                                            {/* Card 1: Password */}
                                            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                                    <h3 className="text-sm font-semibold text-gray-900">Mot de passe</h3>
                                                </div>
                                                <div className="p-6">
                                                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-700 mb-2">Mot de passe actuel</label>
                                                            <div className="relative">
                                                                <input
                                                                    type={showPasswords.current ? "text" : "password"}
                                                                    value={passData.current}
                                                                    onChange={e => setPassData({ ...passData, current: e.target.value })}
                                                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
                                                                    placeholder="••••••••"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="grid md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-700 mb-2">Nouveau mot de passe</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type={showPasswords.new ? "text" : "password"}
                                                                        value={passData.new}
                                                                        onChange={e => setPassData({ ...passData, new: e.target.value })}
                                                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
                                                                        placeholder="••••••••"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-700 mb-2">Confirmer</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type={showPasswords.confirm ? "text" : "password"}
                                                                        value={passData.confirm}
                                                                        onChange={e => setPassData({ ...passData, confirm: e.target.value })}
                                                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
                                                                        placeholder="••••••••"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="pt-2 flex justify-end">
                                                            <button
                                                                type="submit"
                                                                className="px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-sm"
                                                            >
                                                                Mettre à jour
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>

                                            {/* Card 2: Account Security Status */}
                                            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                                    <h3 className="text-sm font-semibold text-gray-900">État du compte</h3>
                                                </div>
                                                <div className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                                            <Shield size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">Compte sécurisé</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">Votre adresse e-mail {user.email} est vérifiée.</p>
                                                        </div>
                                                        <div className="ml-auto">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                                Actif
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card 3: Delete Account */}
                                            <div className="bg-white rounded-xl border border-red-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                                <div className="px-6 py-4 border-b border-red-50 bg-red-50/30">
                                                    <h3 className="text-sm font-semibold text-red-900">Zone de danger</h3>
                                                </div>
                                                <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900 mb-1">Supprimer mon compte</h4>
                                                        <p className="text-xs text-gray-500 max-w-sm">Cette action est irréversible. Toutes vos données, commandes et points seront définitivement effacés.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setPendingAction({ type: 'deleteAccount' })}
                                                        className="px-4 py-2 border border-red-200 text-red-600 font-medium text-xs rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shrink-0"
                                                    >
                                                        Supprimer mon compte
                                                    </button>
                                                </div>
                                            </div>


                                        </div>
                                    )}

                                    {/* === TAB: ADDRESSES (Shopify Style) === */}
                                    {activeTab === 'addresses' && (
                                        <div className="max-w-3xl mx-auto space-y-8">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900">Adresses</h2>
                                                    <p className="text-sm text-gray-500 mt-1">Gérez vos adresses de livraison.</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowAddressModal(true)}
                                                    className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
                                                >
                                                    <Plus size={16} /> Nouvelle adresse
                                                </button>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-5">
                                                {/* Default Address Card */}
                                                {formData.address && (
                                                    <div className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] group">
                                                        <div className="absolute top-4 right-4">
                                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Par défaut</span>
                                                        </div>
                                                        <div className="mb-4">
                                                            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mb-3">
                                                                <MapPin size={16} />
                                                            </div>
                                                            <h3 className="font-semibold text-gray-900">Adresse Principale</h3>
                                                        </div>
                                                        <div className="space-y-1 text-sm text-gray-500">
                                                            <p className="text-gray-900 font-medium">{formData.address}</p>
                                                            <p>{formData.city} {formData.zip}</p>
                                                            <p className="pt-2 text-xs text-gray-400">{formData.phone}</p>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                                            <button onClick={() => setActiveTab('profile')} className="text-xs font-medium text-black hover:underline">Modifier dans le profil</button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Other Addresses */}
                                                {addresses.map(addr => (
                                                    <div key={addr.id} className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] group hover:border-black/20 transition-colors">
                                                        <button
                                                            onClick={() => setPendingAction({ type: 'deleteAddress', id: addr.id })}
                                                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                        <div className="mb-4">
                                                            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mb-3">
                                                                <MapPin size={16} />
                                                            </div>
                                                            <h3 className="font-semibold text-gray-900">{addr.title}</h3>
                                                        </div>
                                                        <div className="space-y-1 text-sm text-gray-500">
                                                            <p className="text-gray-900 font-medium">{addr.address}</p>
                                                            <p>{addr.city}</p>
                                                            <p className="pt-2 text-xs text-gray-400">{addr.phone}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add New Placeholder - Minimalist */}
                                                <button
                                                    onClick={() => setShowAddressModal(true)}
                                                    className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-black hover:text-black hover:bg-gray-50 transition-all min-h-[200px]"
                                                >
                                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                        <Plus size={20} />
                                                    </div>
                                                    <span className="font-medium text-sm">Ajouter une adresse</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* === TAB: LOYALTY (Shopify Style) === */}
                                    {activeTab === 'loyalty' && (
                                        <div className="max-w-3xl mx-auto space-y-8">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900">Fidélité</h2>
                                                    <p className="text-sm text-gray-500 mt-1">Vos points et récompenses.</p>
                                                </div>
                                            </div>

                                            {/* Overview Stats */}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {/* Points Card */}
                                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                                                            <Award size={16} />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Points disponibles</span>
                                                    </div>
                                                    <div className="text-4xl font-bold text-gray-900 mt-2">
                                                        {profile.loyalty_points || 0}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2">Gagnez des points à chaque achat.</p>
                                                </div>

                                                {/* Tier Card */}
                                                {/* Tier Card */}
                                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                                                            <Award size={16} />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Statut membre</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="text-4xl font-bold text-gray-900 lowercase capitalize">
                                                            {profile.loyalty_tier || "Bronze"}
                                                        </div>
                                                        {/* Icon Logic: Crown with Metallic Colors */}
                                                        {(() => {
                                                            const tier = (profile.loyalty_tier || "bronze").toLowerCase();
                                                            // Metallic Hex Colors
                                                            let colorClass = "text-[#CD7F32]"; // Bronze
                                                            if (tier.includes("silver") || tier.includes("argent")) colorClass = "text-[#C0C0C0]"; // Silver
                                                            if (tier.includes("gold") || tier.includes("or")) colorClass = "text-[#FFD700]"; // Gold
                                                            if (tier.includes("platinum")) colorClass = "text-[#E5E4E2]"; // Platinum

                                                            return <Crown size={32} style={{ color: colorClass.replace("text-[", "").replace("]", ""), fill: colorClass.replace("text-[", "").replace("]", "") }} strokeWidth={1.5} />;
                                                        })()}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2">Avantages exclusifs débloqués.</p>
                                                </div>
                                            </div>

                                            {/* How to Earn Points Section */}
                                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <CreditCard size={18} className="text-gray-400" />
                                                    Comment gagner des points ?
                                                </h3>
                                                <div className="grid sm:grid-cols-3 gap-6">
                                                    <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm mb-3">
                                                            <ShoppingBag size={18} />
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-sm">Achats</h4>
                                                        <p className="text-xs text-gray-500 mt-1">1 point pour chaque <br /> <strong className="text-gray-900">1 000 FCFA</strong> dépensés</p>
                                                    </div>
                                                    <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm mb-3">
                                                            <UserPlus size={18} />
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-sm">Parrainage</h4>
                                                        <p className="text-xs text-gray-500 mt-1">Gagnez <strong className="text-gray-900">50 points</strong> <br /> par ami parrainé</p>
                                                    </div>
                                                    <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm mb-3">
                                                            <Award size={18} />
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-sm">Bonus Anniversaire</h4>
                                                        <p className="text-xs text-gray-500 mt-1">Un cadeau de <strong className="text-gray-900">100 points</strong> <br /> pour votre fête</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rewards / Coupons */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Mes Récompenses</h3>
                                                {coupons.length > 0 ? (
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {coupons.map((coupon, idx) => (
                                                            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between h-48">
                                                                <div>
                                                                    <div className="text-3xl font-bold text-gray-900 mb-1">{coupon.discount}</div>
                                                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{coupon.description}</p>
                                                                </div>
                                                                <div className="pt-4 border-t border-gray-50">
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Code Promo</p>
                                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm font-medium text-gray-900 select-all cursor-pointer hover:bg-gray-100 transition-colors text-center border-dashed">
                                                                        {coupon.code}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center">
                                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                                            <Ticket size={20} />
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900">Aucune récompense active</p>
                                                        <p className="text-xs text-gray-500 mt-1">Continuez vos achats pour débloquer des coupons.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* === TAB: WISHLIST (Shopify Style) === */}
                                    {activeTab === 'wishlist' && (
                                        <div className="max-w-4xl mx-auto space-y-8">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900">Liste de souhaits</h2>
                                                    <p className="text-sm text-gray-500 mt-1">Vos articles coups de cœur.</p>
                                                </div>
                                                {favorites.length > 0 && (
                                                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{favorites.length} articles</span>
                                                )}
                                            </div>

                                            {favorites.length === 0 ? (
                                                <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                                        <Heart size={20} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Votre liste est vide</h3>
                                                    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Sauvegardez vos articles préférés pour les retrouver plus tard.</p>
                                                    <Link to="/shop" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-sm">
                                                        Explorer les produits
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                    {favorites.map(product => (
                                                        <div key={product.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
                                                            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                                                                <img
                                                                    src={product.images?.[0] || product.image || "/placeholder.png"}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                                />
                                                                {/* Overlay Actions */}
                                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => removeFavorite(product.fav_id)}
                                                                        className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-colors"
                                                                        title="Retirer des favoris"
                                                                    >
                                                                        <Trash size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="p-4">
                                                                <h3 className="font-semibold text-gray-900 truncate text-sm mb-1">{product.name}</h3>
                                                                <p className="text-sm font-bold text-gray-900 mb-4">{Number(product.price).toLocaleString()} FCFA</p>

                                                                <Link
                                                                    to={`/product/${product.id}`}
                                                                    className="flex items-center justify-center w-full py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-xs"
                                                                >
                                                                    Voir le produit
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            )}
                        </main>
                    </div>
                </div>

                {/* MODAL: ADD ADDRESS (Shopify Style) */}
                {showAddressModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div
                            className="bg-white w-full max-w-lg rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Nouvelle adresse</h3>
                                <button
                                    onClick={() => setShowAddressModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddAddress} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Titre (ex: Bureau)</label>
                                    <input
                                        required
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
                                        placeholder="Maison, Bureau..."
                                        value={newAddress.title}
                                        onChange={e => setNewAddress({ ...newAddress, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Adresse Complète</label>
                                    <textarea
                                        required
                                        rows="2"
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none placeholder-gray-400"
                                        placeholder="Rue, Quartier, Porte..."
                                        value={newAddress.address}
                                        onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">Ville</label>
                                        <input
                                            required
                                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
                                            value={newAddress.city}
                                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">Numéro de Contact</label>
                                        <input
                                            required
                                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400"
                                            value={newAddress.phone}
                                            onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-black text-white py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-sm"
                                    >
                                        Ajouter cette adresse
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                <ConfirmModal
                    isOpen={!!pendingAction}
                    onClose={() => setPendingAction(null)}
                    onConfirm={handleConfirmAction}
                    title={pendingAction?.type === 'deleteAccount' ? "Supprimer mon compte" : "Supprimer l'adresse"}
                    message={pendingAction?.type === 'deleteAccount'
                        ? "Cette action est irréversible. Toutes vos données (commandes, favoris) seront effacées définitivement."
                        : "Êtes-vous sûr de vouloir supprimer cette adresse de livraison ?"}
                    confirmText="Supprimer"
                    isDestructive={true}
                    verificationText={pendingAction?.type === 'deleteAccount' ? "SUPPRIMER" : ""}
                />
            </div>
        </MainLayout>
    );
}

