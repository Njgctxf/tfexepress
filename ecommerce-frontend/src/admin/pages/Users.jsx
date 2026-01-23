import { useEffect, useState, useMemo } from "react";
import {
  User, Mail, Calendar, Shield, Award, Sparkles,
  Edit, X, Save, Search, Users as UsersIcon, Trophy,
  Crown, Star, Ban, CheckCircle, Package, Eye,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import KpiCard from "../components/KpiCard";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("Tous");

  // EDIT MODAL
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ loyalty_points: 0, loyalty_tier: 'Bronze' });
  const [saving, setSaving] = useState(false);

  // ORDERS MODAL
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [currentUserForOrders, setCurrentUserForOrders] = useState(null);

  // BLOCK USER STATE
  const [pendingBlock, setPendingBlock] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      // Fetch profiles directly from Supabase to ensure we get is_blocked
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const total = users.length;
    const goldUsers = users.filter(u => u.loyalty_tier === 'Or').length;
    const blockedUsers = users.filter(u => u.is_blocked).length;
    const totalPoints = users.reduce((acc, u) => acc + (u.loyalty_points || 0), 0);

    return { total, goldUsers, blockedUsers, totalPoints };
  }, [users]);

  // --- FILTERING ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchTerm = search.toLowerCase();
      const matchSearch =
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm));

      const matchTier =
        tierFilter === "Tous" ||
        (user.loyalty_tier || "Bronze") === tierFilter;

      return matchSearch && matchTier;
    });
  }, [users, search, tierFilter]);

  // --- ACTIONS ---

  const openEdit = (user) => {
    setSelectedUser(user);
    setForm({
      loyalty_points: user.loyalty_points || 0,
      loyalty_tier: user.loyalty_tier || 'Bronze'
    });
  };

  const handleViewOrders = async (user) => {
    setCurrentUserForOrders(user);
    setOrdersModalOpen(true);
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', user.email) // Assuming user_email link
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCurrentOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur chargement commandes: " + err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const confirmBlockUser = async () => {
    if (!pendingBlock) return;
    const user = pendingBlock;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !user.is_blocked })
        .eq('id', user.id);

      if (error) throw error;

      // Optimistic Update
      setUsers(users.map(u => u.id === user.id ? { ...u, is_blocked: !u.is_blocked } : u));
      toast.success(user.is_blocked ? "Utilisateur débloqué" : "Utilisateur bloqué");
      setPendingBlock(null);
    } catch (err) {
      toast.error("Erreur: " + err.message);
    }
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          loyalty_points: form.loyalty_points,
          loyalty_tier: form.loyalty_tier
        })
        .eq('email', selectedUser.email)
        .select()
        .single();

      if (error) throw error;

      setUsers(users.map(u => u.email === selectedUser.email ? { ...u, ...data } : u));
      setSelectedUser(null);
      toast.success("Utilisateur mis à jour");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Erreur de sauvegarde: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platine': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Or': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Argent': return 'bg-slate-200 text-slate-700 border-slate-300';
      default: return 'bg-orange-100 text-orange-800 border-orange-200'; // Bronze
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] w-full mx-auto overflow-hidden">

      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <User className="text-gray-900" /> Utilisateurs & Fidélité
          </h1>
          <p className="text-gray-500 mt-1">Gérez les comptes clients et le programme de récompenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Utilisateurs"
          value={stats.total}
          icon={<UsersIcon size={24} className="text-white" />}
          gradient="from-blue-600 to-indigo-600"
          trend="Inscrits"
          trendUp={true}
          onClick={() => setTierFilter("Tous")}
        />
        <KpiCard
          title="Membres Gold"
          value={stats.goldUsers}
          icon={<Trophy size={24} className="text-white" />}
          gradient="from-amber-500 to-orange-400"
          trend="VIP"
          trendUp={true}
          onClick={() => setTierFilter("Or")}
        />
        <KpiCard
          title="Comptes Bloqués"
          value={stats.blockedUsers}
          icon={<Ban size={24} className="text-white" />}
          gradient="from-red-600 to-rose-500"
          trend="Restreints"
          trendUp={false}
        />
        <KpiCard
          title="Points Distribués"
          value={Number(stats.totalPoints).toLocaleString()}
          icon={<Sparkles size={24} className="text-white" />}
          gradient="from-emerald-500 to-teal-400"
          trend="Fidélité globale"
          trendUp={true}
        />
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher (Nom, Email)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {["Tous", "Bronze", "Argent", "Or", "Platine"].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${tierFilter === tier
                ? "bg-black text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* USERS LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
        {loading ? (
          <div key="loading" className="p-20 text-center flex flex-col items-center justify-center text-gray-400">
            <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            Chargement...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div key="empty" className="p-24 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <User size={24} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">Aucun utilisateur trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Essayez un autre filtre</p>
          </div>
        ) : (
          <div key="list" className="w-full overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 w-64">Utilisateur</th>
                  <th className="px-6 py-4 w-64">Email</th>
                  <th className="px-6 py-4 w-40">Fidélité</th>
                  <th className="px-6 py-4 w-32">Statut</th>
                  <th className="px-6 py-4 w-32">Inscription</th>
                  <th className="px-6 py-4 w-48 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors group ${user.is_blocked ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4 max-w-[200px] xl:max-w-[300px]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${user.is_blocked ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {user.is_blocked ? <Ban size={18} /> : (user.email?.charAt(0).toUpperCase() || "U")}
                        </div>
                        <span className="font-bold text-gray-900 truncate notranslate" title={user.full_name}>
                          <span>{user.full_name || user.email?.split("@")[0] || "Utilisateur"}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="flex items-center gap-2 text-gray-600 truncate notranslate" title={user.email}>
                        <Mail size={14} className="shrink-0" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="flex items-center gap-1 font-bold text-gray-900">
                          <Sparkles size={14} className="text-yellow-500 fill-yellow-500" />
                          <span>{user.loyalty_points || 0} pts</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wide ${getTierColor(user.loyalty_tier)}`}>
                          <span>{user.loyalty_tier || "Bronze"}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_blocked ? (
                        <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200">BLOQUÉ</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold border border-green-200">ACTIF</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      <div className="flex items-center gap-1 notranslate">
                        <Calendar size={12} />
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewOrders(user)}
                          className="bg-gray-100 text-gray-600 hover:bg-black hover:text-white p-2 rounded-lg transition-all"
                          title="Voir les commandes"
                        >
                          <Package size={18} />
                        </button>

                        <button
                          onClick={() => openEdit(user)}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-all"
                          title="Modifier Fidélité"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => setPendingBlock(user)}
                          className={`p-2 rounded-lg transition-all ${user.is_blocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                          title={user.is_blocked ? "Débloquer" : "Bloquer"}
                        >
                          {user.is_blocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {
        selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-3xl w-full max-w-sm relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 font-bold text-2xl">
                  {selectedUser.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">{selectedUser.full_name}</h2>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>

              <form onSubmit={saveUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1 ml-1">Points Fidélité</label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all font-bold"
                      value={form.loyalty_points}
                      onChange={e => setForm({ ...form, loyalty_points: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1 ml-1">Niveau (Tier)</label>
                  <div className="relative">
                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all appearance-none cursor-pointer"
                      value={form.loyalty_tier}
                      onChange={e => setForm({ ...form, loyalty_tier: e.target.value })}
                    >
                      <option value="Bronze">Bronze</option>
                      <option value="Argent">Argent</option>
                      <option value="Or">Or</option>
                      <option value="Platine">Platine</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-black text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 mt-4"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={18} /> Sauvegarder
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )
      }

      {/* ORDERS MODAL (NEW) */}
      {
        ordersModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package className="text-gray-900" /> Commandes de {currentUserForOrders?.full_name}
                  </h2>
                  <p className="text-sm text-gray-500">{currentUserForOrders?.email}</p>
                </div>
                <button onClick={() => setOrdersModalOpen(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:shadow-md transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {ordersLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 text-sm">Chargement des historiques...</p>
                  </div>
                ) : currentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <Package size={32} />
                    </div>
                    <p className="font-bold text-gray-900">Aucune commande trouvée</p>
                    <p className="text-sm text-gray-500">Cet utilisateur n'a pas encore passé de commande.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentOrders.map(order => (
                      <div key={order.id} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold font-mono">
                            #{order.id.toString().slice(-3)}
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Commande #{order.id}</p>
                            <p className="font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                          <div className="text-right">
                            <p className="font-black text-gray-900">{Number(order.total).toLocaleString()} FCFA</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${['Livré', 'Remboursé'].includes(order.status) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl text-center text-xs text-gray-400 font-medium uppercase tracking-wider">
                Historique complet
              </div>
            </div>
          </div>
        )
      }
      {/* BLOCK CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!pendingBlock}
        onClose={() => setPendingBlock(null)}
        onConfirm={confirmBlockUser}
        title={pendingBlock?.is_blocked ? "Débloquer l'utilisateur ?" : "Bloquer l'utilisateur ?"}
        message={pendingBlock?.is_blocked
          ? "L'utilisateur pourra de nouveau se connecter et passer commande."
          : "L'utilisateur ne pourra plus se connecter à son compte."}
        confirmText={pendingBlock?.is_blocked ? "Débloquer" : "Bloquer"}
        isDestructive={!pendingBlock?.is_blocked}
      />
    </div >
  );
}
