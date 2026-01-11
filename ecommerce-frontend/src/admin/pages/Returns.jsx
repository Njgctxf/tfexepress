import { useEffect, useState } from "react";
import { RotateCcw, Check, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  async function fetchReturns() {
    try {
      setLoading(true);
      // Fetch returns with related order info
      const { data, error } = await supabase
        .from("returns")
        .select(`
            *,
            order:orders(id, total),
            user:profiles(email, full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReturns(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    if(!confirm(`Passer ce retour en statut : ${newStatus} ?`)) return;
    try {
        await supabase.from("returns").update({ status: newStatus }).eq("id", id);
        setReturns(returns.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch(err) {
        alert("Erreur");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><RotateCcw /> Gestion des Retours</h1>
          <p className="text-gray-500">Demandes de remboursement et échanges</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Commande</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Raison</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {returns.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 text-gray-400">Aucune demande de retour</td></tr>
                ) : returns.map(ret => (
                    <tr key={ret.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">#{ret.id}</td>
                        <td className="px-6 py-4 text-blue-600 font-medium">#{ret.order?.id}</td>
                        <td className="px-6 py-4">
                            <div className="font-bold">{ret.user?.full_name}</div>
                            <div className="text-xs text-gray-400">{ret.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 italic">"{ret.reason}"</td>
                        <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                ${ret.status === 'Remboursé' ? 'bg-green-100 text-green-700' : 
                                  ret.status === 'Rejeté' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {ret.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            {ret.status === 'En attente' && (
                                <>
                                    <button onClick={() => updateStatus(ret.id, "Remboursé")} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg" title="Rembourser">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => updateStatus(ret.id, "Rejeté")} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg" title="Rejeter">
                                        <X size={16} />
                                    </button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
