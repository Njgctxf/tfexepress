import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { Package, MapPin, Heart, Save, Trash, User, Truck, RotateCcw, Award, Ticket, Printer, CheckCircle, Plus, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);

  // Data
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [addresses, setAddresses] = useState([]); // List of extra addresses

  // Form states for profile
  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    city: "",
    zip: "",
    phone: ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // New Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ title: "", address: "", city: "", phone: "" });

  useEffect(() => {
    if (!user && !authLoading) {
        navigate("/login");
        return;
    }
    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      
      // 1. Fetch Profile (Points, Tier) from Backend
      try {
        const res = await fetch(`http://localhost:5000/api/profiles/me?email=${user.email}`);
        if (res.ok) {
            const profileData = await res.json();
            if (profileData) {
                setProfile(profileData);
                setFormData({
                    full_name: profileData.full_name || "",
                    address: profileData.address || "",
                    city: profileData.city || "",
                    zip: profileData.zip || "",
                    phone: profileData.phone || ""
                });
            }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }

      // 2. Fetch Orders with Tracking info
      // 2. Fetch Orders from Express Backend
      try {
        const res = await fetch(`http://localhost:5000/api/orders/my-orders?email=${user.email}`);
        if (res.ok) {
          const ordersData = await res.json();
          setOrders(ordersData);
        }
      } catch (err) {
        console.error("Failed to fetch orders from backend:", err);
      }

      // 3. Fetch Favorites (Filter out null products)
      const { data: favData } = await supabase
        .from("favorites")
        .select(`id, product:products (*)`)
        .eq("user_id", user.id);
      if (favData) {
        setFavorites(favData.filter(f => f.product).map(f => ({ ...f.product, fav_id: f.id })));
      }

      // 4. Fetch Extra Addresses
      const { data: addrData } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id);
      if (addrData) setAddresses(addrData);

      // 5. Fetch Coupons from DB
      const { data: couponsData } = await supabase
        .from("coupons")
        .select("*")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      
      if (couponsData) {
        setCoupons(couponsData.map(c => ({
            code: c.code,
            description: c.description,
            expires: c.expires_at,
            discount: `-${c.discount_percent}%`
        })));
      } else {
        // Fallback or empty
        setCoupons([]);
      }

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }

  // UPDATE PROFILE
  async function handleUpdateProfile(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/profiles/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: user.email,
            ...formData
        })
      });

      if (!res.ok) throw new Error("Erreur mise à jour");
      const updatedProfile = await res.json();

      setMessage("✅ Informations mises à jour avec succès !");
      setProfile({ ...profile, ...updatedProfile });
    } catch (error) {
      setMessage("❌ Erreur: " + error.message);
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  // ADD NEW ADDRESS
  async function handleAddAddress(e) {
    e.preventDefault();
    try {
        const { data, error } = await supabase
            .from("user_addresses")
            .insert([{ ...newAddress, user_id: user.id }])
            .select()
            .single();
        
        if (error) throw error;
        
        setAddresses([...addresses, data]);
        setShowAddressModal(false);
        setNewAddress({ title: "", address: "", city: "", phone: "" });
    } catch (error) {
        alert("Erreur ajout adresse: " + error.message);
    }
  }

  async function handleDeleteAddress(id) {
    if(!confirm("Supprimer cette adresse ?")) return;
    await supabase.from("user_addresses").delete().eq("id", id);
    setAddresses(addresses.filter(a => a.id !== id));
  }

  // REMOVE FAVORITE
  async function removeFavorite(favId) {
    const { error } = await supabase.from("favorites").delete().eq("id", favId);
    if (!error) {
        setFavorites(prev => prev.filter(f => f.fav_id !== favId));
    }
  }

  // HELPER: ORDER STATUS STEPS
  const getStatusStep = (status) => {
    switch(status?.toLowerCase()) {
        case 'en attente': return 1;
        case 'en cours': return 1;
        case 'expédié': return 2;
        case 'livré': return 3;
        default: return 0;
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center font-bold text-gray-400">Vérification de session...</div>;
  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-full md:w-72 space-y-4">
            
            {/* PROFILE CARD */}
            <div className="p-6 bg-white border rounded-2xl text-center shadow-sm">
                <div className="relative w-20 h-20 mx-auto mb-3">
                    <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400">
                        {user.email[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 border-2 border-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Award size={10} />
                        {profile.loyalty_tier || "Bronze"}
                    </div>
                </div>
                <h2 className="font-bold text-lg truncate">{profile.full_name || "Utilisateur"}</h2>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                    <Ticket size={12} />
                    {profile.loyalty_points || 0} Points
                </div>
            </div>

            {/* NAV LINKS */}
            <nav className="space-y-1">
                {[
                    { id: 'orders', label: 'Mes Commandes', icon: Package },
                    { id: 'info', label: 'Mes Infos & Adresses', icon: MapPin },
                    { id: 'wishlist', label: 'Ma Liste de Souhaits', icon: Heart },
                    { id: 'loyalty', label: 'Fidélité & Coupons', icon: Award },
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id ? "bg-black text-white shadow-md" : "bg-white border hover:bg-gray-50 text-gray-600"}`}
                    >
                        <item.icon size={18} /> {item.label}
                    </button>
                ))}
            </nav>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 min-h-[500px]">
            {loading ? (
                <div className="bg-white border rounded-2xl p-10 flex items-center justify-center h-full text-gray-400">Chargement...</div>
            ) : (
                <div className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm h-full relative">
                
                {/* --- TAB: ORDERS --- */}
                {activeTab === "orders" && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Historique des commandes</h2>
                        {orders.length === 0 ? (
                            <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border-dashed border-2">
                                <Package size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">Aucune commande pour l'instant</p>
                                <Link to="/shop" className="text-black font-semibold underline mt-2 block hover:opacity-70 transition-opacity">Commencer mon shopping</Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map(order => {
                                    const step = getStatusStep(order.status);
                                    return (
                                    <div key={order.id} className="border rounded-2xl p-6 hover:shadow-md transition-shadow">
                                        
                                        {/* Header */}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg">Commande #{order.id}</h3>
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">{order.items?.length || 0} article(s) • Total: <span className="font-bold text-gray-900">{Number(order.total).toLocaleString()} FCFA</span></p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                                                    <Printer size={14} /> Facture
                                                </button>
                                                <button className="flex items-center gap-1 px-3 py-2 border border-black text-black rounded-lg text-xs font-medium hover:bg-black hover:text-white transition-colors">
                                                    <RotateCcw size={14} /> Commander à nouveau
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tracking Progress */}
                                        <div className="mb-6 bg-gray-50 rounded-xl p-4">
                                            <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                                                <span className={step >= 1 ? "text-green-600" : ""}>Préparation</span>
                                                <span className={step >= 2 ? "text-green-600" : ""}>Expédition</span>
                                                <span className={step >= 3 ? "text-green-600" : ""}>Livraison</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                <div 
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                                    style={{ width: `${step * 33.33}%` }}
                                                ></div>
                                            </div>
                                            {order.tracking_number && (
                                                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                                                    <Truck size={12} />
                                                    Tracking: {order.tracking_number}
                                                </p>
                                            )}
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="flex justify-end pt-4 border-t">
                                            <button className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                                                <RotateCcw size={14} /> Retourner un article
                                            </button>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB: INFO (ADDRESSES) --- */}
                {activeTab === "info" && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>
                            {message && <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message}</div>}
                            <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Nom Complet</label>
                                    <input type="text" className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-gray-50" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Téléphone</label>
                                    <input type="text" className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-gray-50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Adresse</label>
                                    <input type="text" className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-gray-50" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Ville</label>
                                    <input type="text" className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-gray-50" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Code Postal</label>
                                    <input type="text" className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-gray-50" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                     <button type="submit" disabled={saving} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
                                        <Save size={16} /> {saving ? "..." : "Enregistrer"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <hr />

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Carnet d'adresses</h3>
                                <button onClick={() => setShowAddressModal(true)} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                                    <Plus size={14} /> Ajouter
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Default Profile Address */}
                                {formData.address && (
                                    <div className="border-2 border-green-500 bg-green-50 rounded-xl p-4 relative">
                                        <div className="absolute top-3 right-3 text-green-600"><CheckCircle size={18} /></div>
                                        <p className="text-xs font-bold uppercase text-green-700 mb-2">Adresse Principale</p>
                                        <p className="font-medium text-gray-900">{formData.address}</p>
                                        <p className="text-sm text-gray-500">{formData.city} {formData.zip}</p>
                                        <p className="text-xs text-gray-400 mt-2">{formData.phone}</p>
                                    </div>
                                )}

                                {/* Extra Addresses */}
                                {addresses.map(addr => (
                                    <div key={addr.id} className="border rounded-xl p-4 relative group hover:border-black transition-colors">
                                        <button onClick={() => handleDeleteAddress(addr.id)} className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-600"><Trash size={14}/></button>
                                        <p className="text-xs font-bold uppercase text-gray-400 mb-2">{addr.title}</p>
                                        <p className="font-medium text-gray-900">{addr.address}</p>
                                        <p className="text-sm text-gray-500">{addr.city}</p>
                                        <p className="text-xs text-gray-400 mt-2">{addr.phone}</p>
                                    </div>
                                ))}

                                {/* Add Button Card */}
                                <button onClick={() => setShowAddressModal(true)} className="border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors h-32">
                                    <MapPin size={24} className="mb-2 opacity-50" />
                                    <span className="text-sm font-medium">Ajouter une nouvelle adresse</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: LOYALTY --- */}
                {activeTab === "loyalty" && (
                    <div className="space-y-8">
                        {/* Points Banner */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center">
                            <div>
                                <p className="text-white/60 font-bold uppercase text-sm mb-1">Votre solde fidélité</p>
                                <h2 className="text-4xl font-extrabold flex items-baseline gap-2">
                                    {profile.loyalty_points || 0} <span className="text-lg font-medium text-yellow-400">Points</span>
                                </h2>
                                <p className="mt-2 text-sm text-white/80">Statut actuel: <span className="font-bold text-white">{profile.loyalty_tier || "Bronze"}</span></p>
                            </div>
                            <Award size={64} className="text-yellow-400 opacity-20 hidden md:block" />
                        </div>

                        {/* Coupons */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Ticket size={20} /> Vos Coupons Disponibles
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {coupons.map((coupon, idx) => (
                                    <div key={idx} className="border border-dashed border-gray-300 bg-orange-50 rounded-xl p-4 flex justify-between items-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                                        <div>
                                            <p className="font-bold text-lg text-orange-900">{coupon.discount}</p>
                                            <p className="text-sm text-orange-800/80 mb-2">{coupon.description}</p>
                                            <div className="inline-block bg-white border border-orange-200 text-orange-600 font-mono font-bold px-2 py-1 rounded text-sm select-all">
                                                {coupon.code}
                                            </div>
                                        </div>
                                        <div className="text-right text-xs text-orange-600/60 mt-auto">
                                            Exp: {new Date(coupon.expires).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: WISHLIST (Simplified for length) --- */}
                {activeTab === "wishlist" && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Ma Liste de Souhaits</h2>
                         {favorites.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <Heart size={48} className="mx-auto mb-3 opacity-20" />
                                <p>Votre liste de souhaits est vide.</p>
                                <Link to="/shop" className="text-black font-semibold underline mt-2 block">Explorer la boutique</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.map(product => (
                                    <div key={product.id} className="border rounded-xl p-4 relative group hover:shadow-lg transition-shadow">
                                        <button onClick={() => removeFavorite(product.fav_id)} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:text-red-600 transition-colors z-10"><Trash size={16} /></button>
                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                                            <img src={product.images?.[0] || product.image || "/placeholder.png"} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="font-medium truncate">{product.name}</h3>
                                        <p className="font-bold text-gray-900 mb-3">{Number(product.price).toLocaleString()} FCFA</p>
                                        <Link to={`/product/${product.id}`} className="block w-full text-center bg-gray-100 hover:bg-black hover:text-white py-2 rounded-lg text-sm font-medium transition-colors">Voir le produit</Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* MODAL: ADD ADDRESS */}
                {showAddressModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white border text-left p-6 rounded-2xl shadow-2xl w-full max-w-sm relative animate-in fade-in zoom-in duration-200">
                            <button onClick={() => setShowAddressModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                                <X size={24} />
                            </button>
                            <h3 className="text-xl font-bold mb-4">Nouvelle Adresse</h3>
                            <form onSubmit={handleAddAddress} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Titre (ex: Bureau)</label>
                                    <input required type="text" className="w-full border rounded-lg px-3 py-2 bg-gray-50" placeholder="Bureau, Maison..." value={newAddress.title} onChange={e => setNewAddress({...newAddress, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Adresse</label>
                                    <textarea required rows="2" className="w-full border rounded-lg px-3 py-2 bg-gray-50" placeholder="Rue, Porte..." value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Ville</label>
                                    <input required type="text" className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Téléphone Contact</label>
                                    <input required type="text" className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                                </div>
                                <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold mt-2">Ajouter</button>
                            </form>
                        </div>
                    </div>
                )}

                </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
