import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  RotateCcw, Check, X, Search, Clock,
  AlertCircle, DollarSign, Ban, Package,
  Calendar, User, ArrowUpRight, ArrowDownRight, Eye
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import KpiCard from "../components/KpiCard";

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");

  // STATE FOR ACTIONS
  const [processingId, setProcessingId] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  async function fetchReturns() {
    try {
      setLoading(true);

      // 1. Fetch Returns (raw)
      const { data: returnsData, error: returnsError } = await supabase
        .from("returns")
        .select("*")
        .order("created_at", { ascending: false });

      if (returnsError) throw returnsError;

      if (!returnsData || returnsData.length === 0) {
        setReturns([]);
        return;
      }

      // 2. Fetch Related Orders
      const orderIds = [...new Set(returnsData.map(r => r.order_id).filter(Boolean))];
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total, created_at")
        .in("id", orderIds);

      // 3. Fetch Related Profiles
      const userIds = [...new Set(returnsData.map(r => r.user_id).filter(Boolean))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      // 4. Manual Join
      const joinedData = returnsData.map(ret => {
        const order = ordersData?.find(o => o.id === ret.order_id);
        const user = profilesData?.find(p => p.id === ret.user_id);
        return {
          ...ret,
          order: order,
          user: user
        };
      });

      setReturns(joinedData);
    } catch (err) {
      console.error("Error fetching returns:", err);
      alert("Erreur: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus, orderId) {
    if (!confirm(`Passer ce retour en statut : ${newStatus} ?`)) return;
    setProcessingId(id);
    try {
      // 1. Update Return Status
      const { error: returnError } = await supabase
        .from("returns")
        .update({ status: newStatus })
        .eq("id", id);

      if (returnError) throw returnError;

      // 2. If Refunded, update Order Status
      if (newStatus === "Remboursé" && orderId) {
        const { error: orderError } = await supabase
          .from("orders")
          .update({ status: "Remboursé" })
          .eq("id", orderId);

        if (orderError) console.error("Error updating order status:", orderError);
      }

      setReturns(returns.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert("Erreur lors de la mise à jour");
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  }

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const total = returns.length;
    const pending = returns.filter(r => r.status === 'En attente').length;
    const refunded = returns.filter(r => r.status === 'Remboursé').length;
    const rejected = returns.filter(r => r.status === 'Rejeté').length;

    return { total, pending, refunded, rejected };
  }, [returns]);

  // --- FILTERING ---
  const filteredReturns = useMemo(() => {
    return returns.filter((ret) => {
      const searchTerm = search.toLowerCase();
      const matchSearch =
        String(ret.id).toLowerCase().includes(searchTerm) ||
        String(ret.order?.id).toLowerCase().includes(searchTerm) ||
        (ret.user?.full_name && ret.user.full_name.toLowerCase().includes(searchTerm)) ||
        (ret.user?.email && ret.user.email.toLowerCase().includes(searchTerm));

      const matchStatus =
        statusFilter === "Tous" || ret.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [returns, search, statusFilter]);

  const getStatusStyle = (s) => {
    switch (s) {
      case 'Remboursé': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejeté': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] w-full mx-auto overflow-hidden">

      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <RotateCcw className="text-gray-900" /> Demande de Remboursement
          </h1>
          <p className="text-gray-500 mt-1">Gérez les demandes de remboursement et échanges</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Demandes"
          value={stats.total}
          icon={<RotateCcw size={24} className="text-white" />}
          gradient="from-blue-600 to-indigo-600"
          trend="Global"
          trendUp={true}
          onClick={() => setStatusFilter("Tous")}
        />
        <KpiCard
          title="En Attente"
          value={stats.pending}
          icon={<Clock size={24} className="text-white" />}
          gradient="from-amber-500 to-orange-400"
          trend="À traiter"
          trendUp={false}
          onClick={() => setStatusFilter("En attente")}
        />
        <KpiCard
          title="Remboursés"
          value={stats.refunded}
          icon={<DollarSign size={24} className="text-white" />}
          gradient="from-emerald-500 to-teal-400"
          trend="Validés"
          trendUp={true}
          onClick={() => setStatusFilter("Remboursé")}
        />
        <KpiCard
          title="Rejetés"
          value={stats.rejected}
          icon={<Ban size={24} className="text-white" />}
          gradient="from-red-600 to-rose-500"
          trend="Refusés"
          trendUp={true}
          onClick={() => setStatusFilter("Rejeté")}
        />
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher (ID, Client, Commande)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {["Tous", "En attente", "Remboursé", "Rejeté"].map((filter) => (
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

      {/* RISKS LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
        {loading ? (
          <div key="loading" className="p-20 text-center flex flex-col items-center justify-center text-gray-400">
            <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            Chargement...
          </div>
        ) : filteredReturns.length === 0 ? (
          <div key="empty" className="p-24 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Package size={24} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">Aucune demande trouvée</p>
            <p className="text-sm text-gray-400 mt-1">Le calme avant la tempête ?</p>
          </div>
        ) : (
          <div key="list" className="w-full overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                  <th className="px-6 py-4 w-32">Retour ID</th>
                  <th className="px-6 py-4 w-32">Commande</th>
                  <th className="px-6 py-4 w-64">Client</th>
                  <th className="px-6 py-4 w-64">Raison</th>
                  <th className="px-6 py-4 w-32">Statut</th>
                  <th className="px-6 py-4 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 max-w-[140px]">
                      <div className="font-bold text-gray-900 truncate notranslate" title={ret.id}>
                        <span>#{ret.id}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{new Date(ret.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[140px]">
                      <Link to={`/admin/orders?highlight=${ret.order?.id}`} className="font-mono text-indigo-600 font-medium truncate notranslate hover:underline block" title={`Voir la commande #${ret.order?.id}`}>
                        <span>#{ret.order?.id}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] xl:max-w-[300px]">
                      {ret.user ? (
                        <div>
                          <div className="font-medium text-gray-900 truncate" title={ret.user.full_name}>
                            <span>{ret.user.full_name}</span>
                          </div>
                          <div className="text-xs text-gray-500 truncate" title={ret.user.email}>
                            <span>{ret.user.email}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 italic">Utilisateur inconnu</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-50 p-2 rounded-lg text-sm text-gray-600 border border-gray-100 italic truncate max-w-[180px]" title={ret.reason}>
                          <span>"{ret.reason}"</span>
                        </div>
                        <button
                          onClick={() => setSelectedReason(ret)}
                          className="p-1.5 hover:bg-white hover:text-black text-gray-400 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                          title="Lire le motif complet"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex w-fit items-center gap-1 ${getStatusStyle(ret.status)}`}>
                        <span>{ret.status || "En attente"}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ret.status === 'En attente' && (
                          <>
                            <button
                              onClick={() => updateStatus(ret.id, "Remboursé", ret.order?.id)}
                              disabled={processingId === ret.id}
                              className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-100"
                              title="Accepter & Rembourser"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => updateStatus(ret.id, "Rejeté")}
                              disabled={processingId === ret.id}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                              title="Rejeter la demande"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {processingId === ret.id && (
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REASON MODAL */}
      {selectedReason && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedReason(null)}>
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertCircle size={20} className="text-gray-900" />
                Motif du retour
              </h3>
              <button onClick={() => setSelectedReason(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed text-sm italic relative">
                <span className="absolute top-2 left-2 text-4xl text-gray-200 font-serif">"</span>
                <span className="relative z-10 px-2 block">{selectedReason.reason}</span>
                <span className="absolute bottom-[-10px] right-4 text-4xl text-gray-200 font-serif">"</span>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedReason(null)}
                  className="px-6 py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
