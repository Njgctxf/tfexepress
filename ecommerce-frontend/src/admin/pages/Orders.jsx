import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search, Truck, Edit, Save, X, Eye, Trash2,
  Package, DollarSign, Calendar, Filter,
  CheckCircle, Clock, AlertCircle, ShoppingBag,
  MoreVertical, ChevronRight, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import KpiCard from "../components/KpiCard";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";
import { updateOrder } from "../../services/api/orders.api";

export default function Orders() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");

  // Ref for scrolling
  const highlightRef = useRef(null);

  // Auto-scroll to highlighted element
  useEffect(() => {
    if (!loading && highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, highlightId]);


  // MODAL STATE
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    tracking_number: "",
    tracking_url: ""
  });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fix for potential missing items array
      const formattedOrders = (data || []).map(order => ({
        ...order,
        items: order.items || order.order_items || []
      }));

      setOrders(formattedOrders);
    } catch (err) {
      console.error("Error fetching admin orders:", err);
    } finally {
      setLoading(false);
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setOrders(orders.filter(o => o.id !== deleteId));
      toast.success("Commande supprimée");
      setDeleteId(null);
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === "En cours").length;
    const deliveredOrders = orders.filter(o => o.status === "Livré" || o.status === "Expédié").length;

    return { totalOrders, totalRevenue, pendingOrders, deliveredOrders };
  }, [orders]);

  // --- FILTERING ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchTerm = search.toLowerCase();
      const matchSearch =
        String(order.id).toLowerCase().includes(searchTerm) ||
        (order.user_email && order.user_email.toLowerCase().includes(searchTerm)) ||
        (order.shipping_address?.firstName && order.shipping_address.firstName.toLowerCase().includes(searchTerm)) ||
        (order.shipping_address?.lastName && order.shipping_address.lastName.toLowerCase().includes(searchTerm));

      const matchStatus =
        statusFilter === "Tous" || order.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // --- MODAL HANDLERS ---
  const openEditModal = (order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status || "En cours",
      tracking_number: order.tracking_number || "",
      tracking_url: order.tracking_url || ""
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Use Backend API to trigger email notifications
      const data = await updateOrder(selectedOrder.id, {
        status: editForm.status,
        tracking_number: editForm.tracking_number,
        tracking_url: editForm.tracking_url
      });

      // if (error) throw error; // No longer needed as API throws

      // Merge with existing order data (preserve items)
      const updatedOrder = {
        ...selectedOrder,
        ...data,
        items: selectedOrder.items // Explicitly keep existing items
      };

      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      setSelectedOrder(null);
      toast.success("Commande mise à jour");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyle = (s) => {
    switch (s) {
      case 'Livré': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Expédié': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Annulé': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] w-full mx-auto overflow-hidden">

      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Commandes</h1>
          <p className="text-gray-500 mt-1">Gérez et suivez toutes vos commandes clients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Commandes"
          value={stats.totalOrders}
          icon={<ShoppingBag size={24} className="text-white" />}
          gradient="from-blue-600 to-indigo-600"
          trend="Global"
          trendUp={true}
          onClick={() => setStatusFilter("Tous")}
        />
        <KpiCard
          title="Revenu Total"
          value={`${Number(stats.totalRevenue).toLocaleString()} FCFA`}
          icon={<DollarSign size={24} className="text-white" />}
          gradient="from-emerald-500 to-teal-400"
          trend="Chiffre d'affaires"
          trendUp={true}
        />
        <KpiCard
          title="En Attente"
          value={stats.pendingOrders}
          icon={<Clock size={24} className="text-white" />}
          gradient="from-amber-500 to-orange-400"
          trend="À traiter"
          trendUp={false}
          onClick={() => setStatusFilter("En cours")}
        />
        <KpiCard
          title="Traitées (Exp/Liv)"
          value={stats.deliveredOrders}
          icon={<CheckCircle size={24} className="text-white" />}
          gradient="from-purple-600 to-pink-500"
          trend="Finalisées"
          trendUp={true}
          onClick={() => setStatusFilter("Livré")}
        />
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher (ID, Email, Nom)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {["Tous", "En cours", "Expédié", "Livré", "Annulé"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === filter
                ? "bg-black text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
        {loading ? (
          <div key="loading" className="p-20 text-center flex flex-col items-center justify-center text-gray-400">
            <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            Chargement...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div key="empty" className="p-24 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Package size={24} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">Aucune commande trouvée</p>
            <p className="text-sm text-gray-400 mt-1">Modifiez vos filtres de recherche</p>
          </div>
        ) : (
          <div key="list" className="w-full overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                  <th className="px-6 py-4 w-32">Commande</th>
                  <th className="px-6 py-4 w-32">Date</th>
                  <th className="px-6 py-4 w-64">Client</th>
                  <th className="px-6 py-4 w-40">Articles</th>
                  <th className="px-6 py-4 w-32">Total</th>
                  <th className="px-6 py-4 w-32">Statut</th>
                  <th className="px-6 py-4 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const isHighlighted = highlightId && String(order.id) === String(highlightId);
                  return (
                    <tr
                      key={order.id}
                      ref={isHighlighted ? highlightRef : null}
                      className={`hover:bg-gray-50/50 transition-colors group ${isHighlighted ? 'bg-indigo-50 animate-pulse border-l-4 border-indigo-600' : ''
                        }`}
                    >
                      <td className="px-6 py-4 max-w-[140px]">
                        <Link to={`/admin/orders/${order.id}`} className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate notranslate block" title={order.id}>
                          <span>#{order.id.toString().slice(-8)}</span>
                        </Link>
                        <Link to={`/admin/orders/${order.id}`} className="text-xs text-gray-400 font-mono mt-0.5 truncate notranslate block">
                          <span>{order.id}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{order.date || new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] xl:max-w-[300px]">
                        {order.shipping_address?.firstName ? (
                          <div>
                            <div className="font-medium text-gray-900 truncate" title={`${order.shipping_address.firstName} ${order.shipping_address.lastName}`}>
                              <span>{order.shipping_address.firstName} {order.shipping_address.lastName}</span>
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={order.user_email}>
                              <span>{order.user_email}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="font-medium text-gray-700 truncate" title={order.user_email}>
                            <span>{order.user_email}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 min-w-[140px]">
                        <div className="flex -space-x-2 overflow-hidden">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shrink-0" title={item.name}>
                              {item.images?.[0] || item.image ? (
                                <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-500">
                                  {item.name ? item.name.slice(0, 2).toUpperCase() : "??"}
                                </div>
                              )}
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {order.items?.length} article{order.items?.length > 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <span>{Number(order.total).toLocaleString()} FCFA</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                          <span>{order.status || "En cours"}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(order)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Voir la commande"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteId(order.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer la commande"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT/DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">

            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-white/80 backdrop-blur border-b border-gray-100 z-10 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Commande #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500 text-xs">
                  {new Date(selectedOrder.created_at).toLocaleString()} • {selectedOrder.items?.length} articles
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* ITEMS GRID */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Articles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                      <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                        {item.images?.[0] || item.image ? (
                          <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                        {item.size && (
                          <p className="text-xs text-black font-bold mt-0.5">Taille: {item.size}</p>
                        )}
                        <p className="text-sm text-gray-500">{Number(item.price).toLocaleString()} FCFA x {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* INFO CLIENT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Livraison</h3>
                  <p className="text-gray-700 font-medium">{selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}</p>
                  <p className="text-gray-500 text-sm mt-1">{selectedOrder.shipping_address?.address}</p>
                  <p className="text-gray-500 text-sm">{selectedOrder.shipping_address?.city}</p>
                  <p className="text-gray-500 text-sm mt-2">{selectedOrder.shipping_address?.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Paiement</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full w-full"></div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">PAYÉ</span>
                  </div>
                  <p className="text-gray-600 text-sm">Méthode: <span className="font-bold text-gray-900 uppercase">{selectedOrder.payment_method}</span></p>
                  <p className="text-gray-600 text-sm mt-1">Total: <span className="font-bold text-gray-900 text-lg">{Number(selectedOrder.total).toLocaleString()} FCFA</span></p>
                </div>
              </div>

              {/* ADMIN ACTIONS */}
              <form onSubmit={handleSave} className="border-t pt-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Gestion de la commande</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 ml-1">Statut</label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                      value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="En cours">En cours</option>
                      <option value="Expédié">Expédié</option>
                      <option value="Livré">Livré</option>
                      <option value="Annulé">Annulé</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 ml-1">Numéro de suivi</label>
                    <div className="relative">
                      <Truck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                        placeholder="Ex: DHL-123456"
                        value={editForm.tracking_number}
                        onChange={e => setEditForm({ ...editForm, tracking_number: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">URL de suivi</label>
                  <input
                    type="url"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all text-sm"
                    placeholder="https://..."
                    value={editForm.tracking_url}
                    onChange={e => setEditForm({ ...editForm, tracking_url: e.target.value })}
                  />
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 font-bold hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-900 transition-colors shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Mettre à jour
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer la commande ?"
        message="Cette action est irréversible."
        confirmText="Supprimer"
        isDestructive={true}
      />
    </div>
  );
}
