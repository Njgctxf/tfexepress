import { useEffect, useState } from "react";
import { Search, Truck, Edit, Save, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  
  // EDIT MODAL STATE
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    tracking_number: "",
    tracking_url: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching admin orders:", err);
    } finally {
      setLoading(false);
    }
  }

  // OPEN MODAL
  const openEditModal = (order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status || "En cours",
      tracking_number: order.tracking_number || "",
      tracking_url: order.tracking_url || ""
    });
  };

  // SAVE UPDATES
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update(editForm)
        .eq("id", selectedOrder.id);

      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, ...editForm } : o));
      setSelectedOrder(null);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      String(order.id).includes(search) ||
      (order.user_email && order.user_email.toLowerCase().includes(search.toLowerCase()));

    const matchStatus =
      statusFilter === "Tous" || order.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const getStatusColor = (s) => {
    switch(s) {
        case 'Livré': return 'bg-green-100 text-green-700';
        case 'Expédié': return 'bg-blue-100 text-blue-700';
        case 'Annulé': return 'bg-red-100 text-red-700';
        default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Commandes</h1>
        <p className="text-sm text-gray-500">Gérer les expéditions et suivis</p>
      </div>

      {/* FILTRES */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher (ID, Email)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-48 px-3 py-2 border rounded-xl text-sm focus:outline-none"
        >
          <option value="Tous">Tous les statuts</option>
          <option value="En cours">En cours</option>
          <option value="Expédié">Expédié</option>
          <option value="Livré">Livré</option>
          <option value="Annulé">Annulé</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
            <div className="p-10 text-center text-gray-400">Chargement des commandes...</div>
        ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-gray-500">Aucune commande trouvée.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                    <th className="px-6 py-4">Commande</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Tracking</th>
                    <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4">{order.user_email}</td>
                        <td className="px-6 py-4">{Number(order.total).toLocaleString()} FCFA</td>
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status || "En cours"}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                            {order.tracking_number || "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => openEditModal(order)}
                                className="text-black hover:bg-gray-100 p-2 rounded-lg flex items-center gap-1 ml-auto text-xs font-bold border"
                            >
                                <Edit size={14} /> Gérer
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                    <X size={24} />
                </button>
                
                <h2 className="text-xl font-bold mb-1">Gérer la commande #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500 mb-6">Mettre à jour le statut et le suivi</p>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Statut</label>
                        <select 
                            className="w-full border rounded-lg px-3 py-2"
                            value={editForm.status}
                            onChange={e => setEditForm({...editForm, status: e.target.value})}
                        >
                            <option value="En cours">En cours</option>
                            <option value="Expédié">Expédié</option>
                            <option value="Livré">Livré</option>
                            <option value="Annulé">Annulé</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Numéro de Tracking</label>
                        <div className="relative">
                            <Truck size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="text"
                                className="w-full border rounded-lg pl-9 pr-3 py-2"
                                placeholder="ex: DHL-123456789"
                                value={editForm.tracking_number}
                                onChange={e => setEditForm({...editForm, tracking_number: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Lien de Tracking (URL)</label>
                        <input 
                            type="url"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="https://..."
                            value={editForm.tracking_url}
                            onChange={e => setEditForm({...editForm, tracking_url: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setSelectedOrder(null)}
                            className="flex-1 py-2 rounded-lg border hover:bg-gray-50 font-medium"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2 rounded-lg bg-black text-white hover:bg-gray-800 font-medium flex justify-center items-center gap-2"
                        >
                            <Save size={16} /> {saving ? "Sauvegarde..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
