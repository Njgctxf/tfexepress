import { useEffect, useState } from "react";
import { Plus, Trash, Ticket, Calendar } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", discount_percent: 10, expires_at: "" });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer ce coupon ?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    setCoupons(coupons.filter(c => c.id !== id));
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
        const { data, error } = await supabase.from("coupons").insert([form]).select().single();
        if (error) throw error;
        setCoupons([data, ...coupons]);
        setShowModal(false);
        setForm({ code: "", description: "", discount_percent: 10, expires_at: "" });
    } catch(err) {
        alert("Erreur: " + err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Ticket /> Coupons & Offres</h1>
          <p className="text-gray-500">Gérez les codes de réduction</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold">
            <Plus size={16} /> Créer un coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(coupon => (
            <div key={coupon.id} className="bg-white p-6 rounded-2xl shadow-sm border border-dashed border-gray-300 relative group">
                <button onClick={() => handleDelete(coupon.id)} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500"><Trash size={16}/></button>
                <div className="text-3xl font-bold text-gray-800 mb-1">-{coupon.discount_percent}%</div>
                <div className="inline-block bg-orange-100 text-orange-700 font-mono font-bold px-2 py-1 rounded text-sm mb-4">{coupon.code}</div>
                <p className="text-sm text-gray-500 mb-2">{coupon.description}</p>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> Expire le: {new Date(coupon.expires_at).toLocaleDateString()}
                </div>
            </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Nouveau Coupon</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <input autoFocus required type="text" placeholder="Code (ex: VIP2024)" className="w-full border p-2 rounded-lg uppercase font-bold" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} />
                    <input required type="text" placeholder="Description courte" className="w-full border p-2 rounded-lg" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500">Réduction (%)</label>
                            <input required type="number" className="w-full border p-2 rounded-lg" value={form.discount_percent} onChange={e => setForm({...form, discount_percent: Number(e.target.value)})} />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500">Expiration</label>
                            <input required type="date" className="w-full border p-2 rounded-lg" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold">Créer</button>
                    <button type="button" onClick={() => setShowModal(false)} className="w-full text-gray-500 py-2">Annuler</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
