import {
  Plus, Trash, Ticket, Calendar, Search,
  Percent, Tag, Filter, X, Clock, AlertCircle, Sparkles, Save
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [deleteId, setDeleteId] = useState(null);

  // LOYALTY STATE
  const [loyaltyRate, setLoyaltyRate] = useState(1000); // Earning Rate (Spend X to get 1 point)
  const [redemptionRate, setRedemptionRate] = useState(1); // Redemption Rate (1 Point = X FCFA)
  const [savingRate, setSavingRate] = useState(false);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_percent: 10,
    expires_at: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
    fetchLoyaltySettings();
  }, []);

  async function fetchLoyaltySettings() {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "loyalty")
        .single();

      if (data?.value) {
        if (data.value.earningRate) setLoyaltyRate(data.value.earningRate);
        if (data.value.redemptionRate) setRedemptionRate(data.value.redemptionRate);
      }
    } catch (err) {
      console.error("Error fetching loyalty settings:", err);
    }
  }

  async function updateLoyaltyRate() {
    setSavingRate(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "loyalty",
          value: {
            earningRate: loyaltyRate,
            redemptionRate: redemptionRate,
            enabled: true
          }
        }, { onConflict: 'key' });

      if (error) throw error;
      toast.success("Taux de fidélité mis à jour !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSavingRate(false);
    }
  }

  async function fetchCoupons() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("coupons")
        .select("*");
      //.order("created_at", { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("coupons").delete().eq("id", deleteId);
    if (!error) {
      setCoupons(coupons.filter(c => c.id !== deleteId));
      toast.success("Coupon supprimé");
    } else {
      toast.error("Erreur suppression");
    }
    setDeleteId(null);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.from("coupons").insert([form]).select().single();
      if (error) throw error;
      setCoupons([data, ...coupons]);
      setShowModal(false);
      setForm({ code: "", description: "", discount_percent: 10, expires_at: "" });
      toast.success("Coupon créé !");
    } catch (err) {
      toast.error("Erreur: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // --- DERIVED STATE ---
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => new Date(c.expires_at) >= new Date()).length;
    const expired = total - active;
    return { total, active, expired };
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const codeMatch = (c.code || "").toLowerCase().includes(search.toLowerCase());
      const descMatch = (c.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesSearch = codeMatch || descMatch;

      // Handle invalid dates safely
      const expiryDate = new Date(c.expires_at);
      const isExpired = !isNaN(expiryDate) && expiryDate < new Date();

      const matchesFilter =
        statusFilter === "Tous" ? true :
          statusFilter === "Actifs" ? !isExpired :
            isExpired; // "Expirés"

      return matchesSearch && matchesFilter;
    });
  }, [coupons, search, statusFilter]);

  // Check if coupon is expired
  const isExpired = (dateString) => new Date(dateString) < new Date();

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] w-full mx-auto">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Ticket className="text-gray-900" /> Coupons & Fidélité
          </h1>
          <p className="text-gray-500 mt-1">Créez vos codes promo et configurez le programme de points</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
        >
          <Plus size={18} /> Créer un coupon
        </button>
      </div>

      {/* LOYALTY CONFIG */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={100} />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">Programme Fidélité</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Configuration des Points</h2>
            <p className="text-indigo-200 text-sm">Définissez combien votre client doit dépenser pour gagner 1 point de fidélité.</p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-left sm:text-right flex-1">
              <span className="block text-xs font-bold text-indigo-300 uppercase mb-1">Taux de gain</span>
              <div className="flex items-center gap-2 font-bold text-lg">
                <span className="whitespace-nowrap">1 Point = </span>
                <input
                  type="number"
                  value={loyaltyRate}
                  onChange={(e) => setLoyaltyRate(Number(e.target.value))}
                  className="w-full sm:w-24 bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-center focus:outline-none focus:bg-white/20 transition-colors"
                />
                <span>FCFA</span>
              </div>
            </div>

            <div className="text-left sm:text-right flex-1 border-l border-white/10 pl-4">
              <span className="block text-xs font-bold text-indigo-300 uppercase mb-1">Valeur Points</span>
              <div className="flex items-center gap-2 font-bold text-lg">
                <span className="whitespace-nowrap">1 Point = </span>
                <input
                  type="number"
                  value={redemptionRate}
                  onChange={(e) => setRedemptionRate(Number(e.target.value))}
                  className="w-full sm:w-24 bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-center focus:outline-none focus:bg-white/20 transition-colors"
                />
                <span>FCFA</span>
              </div>
            </div>
            <button
              onClick={updateLoyaltyRate}
              disabled={savingRate}
              className="bg-white text-indigo-900 p-3 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              {savingRate ? <div className="w-5 h-5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
              <span className="ml-2 font-bold sm:hidden">Enregistrer</span>
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Coupons</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Percent size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Actifs</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Expirés</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.expired}</h3>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {["Tous", "Actifs", "Expirés"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status
                ? "bg-black text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* COUPONS GRID */}
      {loading ? (
        <div className="p-20 text-center flex flex-col items-center justify-center text-gray-400">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          Chargement...
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucun coupon trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCoupons.map(coupon => {
            const expired = isExpired(coupon.expires_at);
            return (
              <div key={coupon.id} className="relative group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${expired
                  ? "bg-gray-100 text-gray-500 border-gray-200"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  }`}>
                  {expired ? "Expiré" : "Actif"}
                </div>

                <div className="p-6 pb-4 border-b border-dashed border-gray-200 relative">
                  {/* Decorative circles for ticket effect */}
                  <div className="absolute -left-3 bottom-[-10px] w-6 h-6 rounded-full bg-[#f8f9fa] border border-gray-200 box-content z-10"></div>
                  <div className="absolute -right-3 bottom-[-10px] w-6 h-6 rounded-full bg-[#f8f9fa] border border-gray-200 box-content z-10"></div>

                  <div className="text-4xl font-black text-gray-900 mb-1 flex items-baseline gap-1">
                    {coupon.discount_percent}<span className="text-lg font-bold text-gray-400">%</span>
                  </div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">de réduction</div>

                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-100">
                    <span className="font-mono font-bold text-lg text-gray-900 tracking-wider">{coupon.code}</span>
                    <Ticket size={16} className="text-gray-400" />
                  </div>
                </div>

                <div className="p-6 pt-4 flex-1 flex flex-col justify-between bg-gray-50/50">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{coupon.description}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className={`text-xs font-medium flex items-center gap-1.5 ${expired ? "text-red-500" : "text-gray-500"}`}>
                      {expired ? <AlertCircle size={14} /> : <Calendar size={14} />}
                      {new Date(coupon.expires_at).toLocaleDateString()}
                    </div>

                    <button
                      onClick={() => setDeleteId(coupon.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-gray-200/50">
                <Ticket className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Nouveau Coupon</h2>
              <p className="text-gray-500 mt-1">Créez une offre pour vos clients</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Code Promo</label>
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder="ex: SOLDES2024"
                  className="w-full border border-gray-200 p-3 rounded-xl uppercase font-bold tracking-wider placeholder:tracking-normal focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Description</label>
                <input
                  required
                  type="text"
                  placeholder="ex: -20% sur tout le site"
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Réduction (%)</label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      min="1"
                      max="100"
                      className="w-full border border-gray-200 p-3 pr-8 rounded-xl font-bold focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                      value={form.discount_percent}
                      onChange={e => setForm({ ...form, discount_percent: Number(e.target.value) })}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Expiration</label>
                  <input
                    required
                    type="date"
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-600"
                    value={form.expires_at}
                    onChange={e => setForm({ ...form, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-black text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-900 transition-all shadow-xl shadow-gray-200 hover:shadow-gray-300 mt-2"
              >
                {saving ? "Création..." : "Créer le coupon"}
              </button>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer ce coupon ?"
        message="Cette action est définitive."
        confirmText="Supprimer"
        isDestructive={true}
      />
    </div>
  );
}
