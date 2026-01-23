import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, User, CheckCircle, RotateCcw } from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { createReturnRequest } from "../services/api/returns.api";

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Return/Cancel Request State
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState("");
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const [existingReturn, setExistingReturn] = useState(null);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    async function fetchOrder() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items(*)
                `)
                .eq('id', orderId)
                .single();

            if (error) throw error;
            if (!data) throw new Error("Commande introuvable");

            // Fallback: Support both 'items' (aliased) and 'order_items' (raw)
            if (data) {
                data.items = data.items || data.order_items || [];
            }

            setOrder(data);

            // Check for existing return request
            if (data.id) checkExistingReturn(data.id);
        } catch (err) {
            console.error("Order fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function checkExistingReturn(id) {
        const { data, error } = await supabase
            .from("returns")
            .select("*")
            .eq("order_id", id)
            .maybeSingle(); // Use maybeSingle to avoid 406 if 0 rows

        if (error) console.error("Error checking return:", error);
        if (data) setExistingReturn(data);
    }

    async function handleReturnRequest(e) {
        e.preventDefault();
        setSubmittingReturn(true);
        try {
            // Get current authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Votre session a expiré. Veuillez vous reconnecter.");
                return;
            }

            // Use API instead of direct Supabase insert to trigger Email
            await createReturnRequest({
                order_id: order.id,
                user_id: user.id,
                reason: returnReason
            });

            toast.success("Demande envoyée avec succès (Admin notifié)");
            setShowReturnModal(false);
            setExistingReturn({ status: "En attente" }); // Optimistic update
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la demande: " + (error.message || "Erreur inconnue"));
        } finally {
            setSubmittingReturn(false);
        }
    }

    const getStatusStep = (status) => {
        switch (status?.toLowerCase()) {
            case 'en attente': return 1;
            case 'en cours': return 1;
            case 'expédié': return 2;
            case 'livré': return 3;
            default: return 0;
        }
    };

    const getImageUrl = (item) => {
        let img = item.image || (item.images && item.images[0]);
        if (img && img.startsWith("/")) {
            return `http://localhost:5000${img}`;
        }
        return img || "/placeholder.png";
    };

    if (loading) return (
        <MainLayout>
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-yellow-400 rounded-full"></div>
            </div>
        </MainLayout>
    );

    if (error || !order) return (
        <MainLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <Package size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h1>
                <p className="text-gray-500 mb-6">{error || "Impossible de récupérer les détails."}</p>
                <Link to="/dashboard" className="px-6 py-2 bg-black text-white rounded-xl font-medium">Retour au tableau de bord</Link>
            </div>
        </MainLayout>
    );

    const step = getStatusStep(order.status);
    const shipping = order.shipping_address || {};

    return (
        <MainLayout>
            {/* MODAL */}
            {showReturnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {order.status === 'Livré' ? "Retourner un article" : "Annuler la commande"}
                        </h2>
                        <form onSubmit={handleReturnRequest}>
                            <p className="text-sm text-gray-500 mb-4">
                                {order.status === 'Livré'
                                    ? "Veuillez nous expliquer la raison de votre retour."
                                    : "Veuillez nous indiquer la raison de votre annulation."
                                } Un administrateur examinera votre demande.
                            </p>
                            <textarea
                                className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none text-sm"
                                placeholder={order.status === 'Livré' ? "Raison du retour (ex: mauvaise taille...)" : "Raison de l'annulation..."}
                                value={returnReason}
                                onChange={e => setReturnReason(e.target.value)}
                                required
                            />
                            <div className="flex gap-3 justify-end mt-6">
                                <button type="button" onClick={() => setShowReturnModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg">Annuler</button>
                                <button
                                    type="submit"
                                    disabled={submittingReturn}
                                    className="px-6 py-2 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {submittingReturn ? "Envoi..." : "Envoyer la demande"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#F8F9FB] py-8 md:py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* BREADCRUMB / BACK */}
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black mb-6 transition-colors">
                        <ArrowLeft size={18} />
                        Retour
                    </button>

                    {/* HEADER */}
                    <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100 mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-10 h-10 bg-gray-900 text-yellow-400 rounded-xl flex items-center justify-center font-mono font-bold text-xs shadow-md">
                                        #{order.id.toString().slice(-3)}
                                    </span>
                                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Commande #{order.id}</h1>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium ml-1">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(order.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="uppercase">{order.items?.length || 0} Article(s)</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${order.status === 'Livré' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                    {order.status}
                                </span>
                                <p className="text-3xl font-black text-gray-900">{Number(order.total).toLocaleString()} <span className="text-sm text-gray-400">FCFA</span></p>
                            </div>
                        </div>

                        {/* PROGRESS BAR */}
                        <div className="mt-10 max-w-2xl mx-auto">
                            <div className="relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 rounded-full -translate-y-1/2 -z-10"></div>
                                <div className="absolute top-1/2 left-0 h-1 bg-yellow-400 rounded-full -translate-y-1/2 -z-10 transition-all duration-1000" style={{ width: `${step * 33.33}%` }}></div>

                                <div className="flex justify-between w-full">
                                    {/* Step 1 */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-white border-gray-200 text-gray-300'}`}>
                                            <Package size={14} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>Validée</span>
                                    </div>
                                    {/* Step 2 */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-white border-gray-200 text-gray-300'}`}>
                                            <Truck size={14} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>Expédiée</span>
                                    </div>
                                    {/* Step 3 */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                            <CheckCircle size={14} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${step >= 3 ? 'text-black' : 'text-gray-400'}`}>Livrée</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: ITEMS */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Package size={18} /> Articles ({order.items?.length})</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="p-6 flex gap-5 hover:bg-gray-50 transition-colors">
                                            <div className="w-20 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                                <img src={getImageUrl(item)} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-gray-900 line-clamp-2">{item.name}</h4>
                                                    <p className="font-bold text-gray-900 shrink-0">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">{item.brand || "Marque"}</p>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                                                    <span>{Number(item.price).toLocaleString()}</span>
                                                    <span className="text-gray-400 w-1 h-1 rounded-full bg-gray-400"></span>
                                                    <span>Qté: {item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: INFO */}
                        <div className="space-y-6">

                            {/* SHIPPING CARD */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} /> Livraison</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p className="font-bold text-gray-900">{shipping.firstName || "Client"} {shipping.lastName}</p>
                                    <p>{shipping.address}</p>
                                    <p>{shipping.city} {shipping.region}</p>
                                    <p>{shipping.phone}</p>
                                </div>
                            </div>

                            {/* PAYMENT CARD */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={18} /> Paiement</h3>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm font-medium">{order.payment_method || "Espèces"}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${order.status === 'Livré' ? 'bg-black' : 'bg-gray-400'}`}>
                                        {order.status === 'Livré' ? 'PAYÉ' : 'EN ATTENTE'}
                                    </span>
                                </div>
                            </div>

                            {/* SUMMARY CARD */}
                            <div className="bg-gray-900 rounded-[24px] p-6 text-white shadow-xl shadow-gray-200">
                                <h3 className="font-bold mb-6 flex items-center gap-2"><CreditCard size={18} className="text-yellow-400" /> Résumé</h3>
                                <div className="space-y-3 text-sm text-gray-300">
                                    <div className="flex justify-between">
                                        <span>Sous-total</span>
                                        <span>{order.items?.reduce((acc, i) => acc + i.price * i.quantity, 0).toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Livraison</span>
                                        <span className="text-green-400 font-bold">Gratuit</span>
                                    </div>
                                    <div className="border-t border-gray-700 pt-3 mt-3 flex justify-between items-end">
                                        <span className="font-bold text-white">Total</span>
                                        <span className="text-2xl font-black text-yellow-400">{Number(order.total).toLocaleString()} FCFA</span>
                                    </div>
                                </div>
                            </div>

                            {/* ACTIONS - CANCELLATION & RETURN */}
                            {['Livré', 'En attente', 'En cours'].includes(order.status) && !existingReturn && (
                                <button
                                    onClick={() => setShowReturnModal(true)}
                                    className={`w-full py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${order.status === 'Livré'
                                        ? "border-gray-200 text-gray-500 hover:border-black hover:text-black hover:bg-white"
                                        : "border-red-100 text-red-600 bg-red-50 hover:bg-red-100"
                                        }`}
                                >
                                    {order.status === 'Livré' ? <><RotateCcw size={18} /> Faire une réclamation / Retour</> : <><RotateCcw size={18} /> Annuler la commande</>}
                                </button>
                            )}

                            {existingReturn && (
                                <div className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold ${existingReturn.status === 'Remboursé' ? 'bg-green-50 text-green-700 border-green-100' :
                                    existingReturn.status === 'Rejeté' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                    <RotateCcw size={18} /> {order.status === 'Livré' ? 'Retour' : 'Demande'} {existingReturn.status}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
