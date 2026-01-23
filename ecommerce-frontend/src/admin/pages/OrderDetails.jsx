import { ArrowLeft, Truck, MapPin, Phone, Mail, Calendar, CreditCard, Package, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    try {
      setLoading(true);
      const idToFetch = orderId.replace("#", "");

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', idToFetch)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Commande introuvable");

      // Normalize items
      data.items = data.items || data.order_items || [];

      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Livré': return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'Expédié': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'Annulé': return 'bg-red-100 text-red-700 ring-red-600/20';
      case 'En cours': return 'bg-amber-100 text-amber-700 ring-amber-600/20';
      case 'Payé': return 'bg-green-100 text-green-700 ring-green-600/20';
      default: return 'bg-gray-100 text-gray-700 ring-gray-600/20';
    }
  };

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error || !order) return (
    <div className="text-center p-12">
      <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block mb-4">
        <ArrowLeft size={24} />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Erreur</h2>
      <p className="text-gray-500 mb-6">{error || "Commande introuvable"}</p>
      <button onClick={() => navigate(-1)} className="px-6 py-2 bg-black text-white rounded-xl font-medium">Retour</button>
    </div>
  );

  const shipping = order.shipping_address || {};
  const items = order.items || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <button
        onClick={() => navigate("/admin/orders")}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
      >
        <ArrowLeft size={18} />
        Retour aux commandes
      </button>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            Commande #{order.id.toString().slice(-8)}
            <span className={`text-sm px-3 py-1 rounded-full ring-1 ring-inset font-bold ${getStatusStyle(order.status)}`}>
              {order.status}
            </span>
          </h1>
          <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
            <Calendar size={14} />
            {new Date(order.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
          </div>
        </div>

        {/* Actions (Future: Add status update dropdown here) */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COL: ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Package size={18} className="text-gray-400" />
                Produits ({items.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={index} className="p-6 flex gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                    <img
                      src={item.images?.[0] || item.image || "/placeholder.png"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                      <p className="font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                    </div>
                    <div className="mb-2">
                      {item.size && <p className="text-sm font-bold text-black border border-black/10 bg-gray-100 px-2 py-0.5 rounded w-fit mb-1">Taille : {item.size}</p>}
                      <p className="text-sm text-gray-500">{item.variant || "Standard"}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-100 w-fit px-2 py-1 rounded-md">
                      <span>{Number(item.price).toLocaleString()} FCFA</span>
                      <span>x</span>
                      <span className="font-bold text-gray-700">{item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 p-6 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-500">Sous-total</span>
                <span className="font-medium">{items.reduce((acc, i) => acc + i.price * i.quantity, 0).toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-gray-500">Livraison</span>
                <span className="font-medium">Calculé à la commande</span>
                {/* Note: If shipping cost was stored separately, we would display it. 
                    For now total usually includes it or we infer it. 
                    Let's just show Total from DB which is final. */}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-indigo-600">{Number(order.total).toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL: INFO */}
        <div className="space-y-6">

          {/* CLIENT */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-gray-400" />
              Client
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {shipping?.firstName?.charAt(0) || order.user_email?.charAt(0) || "?"}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-900 truncate">{shipping.firstName} {shipping.lastName}</p>
                  <p className="text-gray-500 truncate">{order.user_email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={16} />
                <span>{shipping.phone || "Non renseigné"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={16} />
                <span className="truncate">{order.user_email}</span>
              </div>
            </div>
          </div>

          {/* SHIPPING */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-gray-400" />
              Livraison
            </h3>
            <div className="flex items-start gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
              <MapPin size={16} className="mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Adresse</p>
                <p>{shipping.address}</p>
                <p>{shipping.apartment}</p>
                <p>{shipping.city}, {shipping.region}</p>
              </div>
            </div>
            {order.tracking_number && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase">Suivi</p>
                <p className="font-mono bg-yellow-50 text-yellow-700 px-2 py-1 rounded inline-block mt-1">{order.tracking_number}</p>
              </div>
            )}
          </div>

          {/* PAYMENT */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-gray-400" />
              Paiement
            </h3>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600 uppercase">{order.payment_method || "N/A"}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${order.status !== 'Annulé' ? 'bg-black' : 'bg-red-500'}`}>
                {order.status === 'Livré' || order.status === 'Payé' ? 'PAYÉ' : 'EN ATTENTE'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
