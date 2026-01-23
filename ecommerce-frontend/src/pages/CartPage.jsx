import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLocalization } from "../context/LocalizationContext";
import { supabase } from "../lib/supabase";
import { Trash2, Lock, ArrowRight, ShoppingBag, ArrowLeft, Ticket, X, CheckCircle, Sparkles } from "lucide-react";

// Helper Component for Coupon Input
const CouponSection = ({ applyCoupon, discount, removeCoupon, user, loyaltyPoints, usePoints, togglePoints, subTotal, redemptionRate }) => {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const { formatPrice } = useLocalization();

  const pointsValue = Math.min(loyaltyPoints * (redemptionRate || 1), subTotal);
  // ... rest of usePoints logic

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setMsg(null);
    const res = await applyCoupon(code);
    setLoading(false);

    if (res.success) {
      setMsg({ type: "success", text: res.message });
      setCode("");
    } else {
      setMsg({ type: "error", text: res.message });
    }
  };

  const handlePointToggle = () => {
    if (!usePoints) togglePoints(true, pointsValue);
    else togglePoints(false, 0);
  };

  return (
    <div className="space-y-4">
      {user && (
        <div className={`p-4 rounded-xl border transition-all ${usePoints ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${usePoints ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${usePoints ? "text-indigo-900" : "text-gray-900"}`}>Utiliser mes points</p>
                <div className="flex flex-col">
                  <p className="text-xs text-gray-500 truncate">Solde: <strong>{loyaltyPoints}</strong> pts ({formatPrice(loyaltyPoints * (redemptionRate || 1))})</p>
                </div>
              </div>
            </div>
            {loyaltyPoints > 0 ? (
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" checked={usePoints} onChange={handlePointToggle} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            ) : (
              <span className="text-xs font-medium text-gray-400">Insuffisant</span>
            )}
          </div>
          {usePoints && (
            <div className="mt-3 pt-3 border-t border-indigo-100 flex justify-between text-sm text-indigo-700">
              <span>Réduction:</span>
              <span className="font-bold">- {formatPrice(pointsValue)}</span>
            </div>
          )}
        </div>
      )}

      {discount && (
        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
            <Ticket size={16} />
            <span>Code {discount.code} (-{discount.percent}%)</span>
          </div>
          <button onClick={removeCoupon} className="text-green-700 hover:bg-green-100 p-1 rounded-full"><X size={16} /></button>
        </div>
      )}

      {!discount && (
        <>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Code Promo"
              className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase font-bold focus:ring-1 focus:ring-black outline-none"
            />
            <button
              onClick={handleApply}
              disabled={loading || !code}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50 transition-colors"
            >
              {loading ? "..." : "Appliquer"}
            </button>
          </div>
          {msg && <p className={`text-xs flex items-center gap-1 ${msg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>}
        </>
      )}
    </div>
  );
};

const CartPage = () => {
  const { cart, increaseQty, decreaseQty, removeFromCart, totalPrice, subTotal, discount, applyCoupon, removeCoupon, usePoints, loyaltyAmount, togglePoints } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice, t } = useLocalization();
  const [note, setNote] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [redemptionRate, setRedemptionRate] = useState(1);

  React.useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "loyalty").single()
      .then(({ data }) => { if (data?.value?.redemptionRate) setRedemptionRate(data.value.redemptionRate); });
    if (user) {
      supabase.from("profiles").select("loyalty_points").eq("id", user.id).single()
        .then(({ data }) => { if (data) setLoyaltyPoints(data.loyalty_points || 0); });
    }
  }, [user]);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-gray-50 p-6 rounded-full mb-6"><ShoppingBag size={48} className="text-gray-400" /></div>
        <h2 className="text-3xl font-bold mb-4">{t('cart')} vide</h2>
        <Link to="/shop" className="bg-black text-white px-8 py-4 rounded-lg font-bold">{t('shop')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
      <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={24} /></button>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight">{t('cart')}</h1>
        </div>
        <Link to="/shop" className="text-sm border-b border-gray-300 hover:border-black transition-colors pb-1 hidden md:block">{t('shop')}</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="hidden md:grid grid-cols-12 gap-4 text-xs uppercase tracking-widest text-gray-500 font-medium pb-2 border-b border-gray-100">
            <div className="col-span-6">{t('product')}</div>
            <div className="col-span-3 text-center">{t('quantity')}</div>
            <div className="col-span-3 text-right">{t('total')}</div>
          </div>

          <div className="space-y-8">
            {cart.map((item) => (
              <div key={item.cartId || item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-gray-50 pb-8 last:border-0 relative">
                <div className="md:col-span-6 flex gap-6">
                  <div className="w-24 h-24 bg-white rounded-lg p-2 flex-shrink-0 border border-gray-100">
                    <img src={item.image || item.images?.[0] || "/placeholder.png"} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link to={`/product/${item.id}`} className="font-bold text-lg hover:text-gray-600 transition-colors">{item.name}</Link>
                    {item.size && <p className="text-sm text-gray-700 font-medium mt-1">Taille: {item.size}</p>}
                    <p className="text-sm text-gray-500 mt-1">{formatPrice(item.price)}</p>
                  </div>
                </div>
                <div className="md:col-span-3 flex justify-center items-center">
                  <div className="flex items-center border border-gray-300 rounded-lg h-10">
                    <button onClick={() => decreaseQty(item.cartId || item.id)} className="w-10 h-full text-gray-500 hover:text-black">-</button>
                    <span className="w-10 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => increaseQty(item.cartId || item.id)} className="w-10 h-full text-gray-500 hover:text-black">+</button>
                  </div>
                </div>
                <div className="md:col-span-3 flex justify-between md:flex-col md:items-end md:gap-2">
                  <div className="md:hidden font-medium text-gray-500">{t('total')}</div>
                  <p className="font-bold text-lg">{formatPrice(item.price * item.qty)}</p>
                  <button onClick={() => removeFromCart(item.cartId || item.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-100">
            <label className="text-sm font-bold text-gray-900 mb-2 block">Note de commande (Optionnel)</label>
            <textarea
              rows="3"
              className="w-full border border-gray-200 rounded-lg p-4 text-sm focus:ring-1 focus:ring-black outline-none transition-all resize-none bg-gray-50"
              placeholder="Instructions spéciales pour la livraison..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-gray-50 rounded-2xl p-6 lg:p-8 border border-gray-200">
            <h2 className="text-lg font-bold mb-6">{t('order_summary')}</h2>
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 border-dashed">
              <div className="flex justify-between items-center text-gray-600">
                <span>{t('subtotal')}</span>
                <span className="font-medium text-gray-900">{formatPrice(subTotal)}</span>
              </div>
              <CouponSection applyCoupon={applyCoupon} discount={discount} removeCoupon={removeCoupon} user={user} loyaltyPoints={loyaltyPoints} usePoints={usePoints} togglePoints={togglePoints} subTotal={subTotal} redemptionRate={redemptionRate} />
              {discount && (
                <div className="flex justify-between items-center text-green-600 font-medium">
                  <span>Remise ({discount.code})</span>
                  <span>- {formatPrice((subTotal * discount.percent) / 100)}</span>
                </div>
              )}
              {usePoints && loyaltyAmount > 0 && (
                <div className="flex justify-between items-center text-indigo-600 font-medium">
                  <span>Points Fidélité</span>
                  <span>- {formatPrice(loyaltyAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-start text-gray-600 pb-2">
                <span>{t('shipping')}</span>
                <span className="text-sm text-gray-500 italic">Calculé au paiement</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold">{t('total')}</span>
              <span className="text-2xl font-black">{formatPrice(totalPrice)}</span>
            </div>
            <button onClick={() => navigate("/checkout")} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-2 group shadow-lg">
              {t('checkout')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
