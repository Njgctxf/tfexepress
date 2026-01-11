import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { User, Mail, Calendar, Shield, Award, Sparkles, Edit, X, Save } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // EDIT MODAL
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ loyalty_points: 0, loyalty_tier: 'Bronze' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
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

  const openEdit = (user) => {
    setSelectedUser(user);
    setForm({
        loyalty_points: user.loyalty_points || 0,
        loyalty_tier: user.loyalty_tier || 'Bronze'
    });
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
        await supabase.from("profiles").update(form).eq("id", selectedUser.id);
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...form } : u));
        setSelectedUser(null);
    } catch(err) {
        alert("Erreur de sauvegarde");
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs & Fidélité</h1>
        <p className="text-gray-500 text-sm">Gérer les comptes clients et leurs récompenses</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Utilisateur</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Fidélité</th>
                <th className="px-6 py-4 font-medium">Inscription</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-600">
              {users.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                        Aucun utilisateur trouvé (Table 'profiles' non synchronisée ?)
                   </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-gray-900">
                           {user.full_name || "Utilisateur"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                        <Mail size={14} className="text-gray-400"/>
                        {user.email}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 font-bold text-gray-900">
                                <Sparkles size={14} className="text-yellow-500"/> {user.loyalty_points || 0} pts
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border w-fit">
                                {user.loyalty_tier || "Bronze"}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(user)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg flex items-center gap-1 ml-auto text-xs font-bold transition-colors">
                        <Edit size={14} /> Gérer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm relative shadow-2xl">
                 <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold mb-1">Modifier {selectedUser.full_name}</h2>
                <p className="text-sm text-gray-500 mb-6">Ajuster les points de fidélité</p>
                
                <form onSubmit={saveUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Points Fidélité</label>
                        <input type="number" className="w-full border rounded-lg px-3 py-2" value={form.loyalty_points} onChange={e => setForm({...form, loyalty_points: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Statut (Tier)</label>
                        <select className="w-full border rounded-lg px-3 py-2" value={form.loyalty_tier} onChange={e => setForm({...form, loyalty_tier: e.target.value})}>
                            <option value="Bronze">Bronze</option>
                            <option value="Argent">Argent</option>
                            <option value="Or">Or</option>
                            <option value="Platine">Platine</option>
                        </select>
                    </div>
                    <button type="submit" disabled={saving} className="w-full bg-black text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2">
                        <Save size={18} /> {saving ? "..." : "Sauvegarder"}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
