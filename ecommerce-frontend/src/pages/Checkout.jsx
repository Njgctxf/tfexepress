import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronRight,
  CreditCard,
  Gift,
  MapPin,
  Truck,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
  });

  const [shippingMethod, setShippingMethod] = useState("express");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const steps = [
    { id: 1, name: "Adresse", icon: <MapPin size={20} /> },
    { id: 2, name: "Livraison", icon: <Truck size={20} /> },
    { id: 3, name: "Paiement", icon: <CreditCard size={20} /> },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handlePlaceOrder();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/cart");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        user_email: user?.email || address.email || "guest@example.com",
        items: cart,
        total: totalPrice,
        shipping_address: address,
        payment_method: paymentMethod
      };

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error("Erreur lors de la commande");

      setStep(4);
      clearCart();
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la commande.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 4 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-slideRight">
          <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Votre panier est vide
          </h2>
          <p className="text-gray-500 mb-8">
            Ajoutez des articles à votre panier pour commencer votre commande.
          </p>
          <Link
            to="/shop"
            className="inline-block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02]"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* 🚀 HEADER FLOW */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline font-medium">Retour</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-8">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === s.id
                      ? "bg-orange-500 text-white ring-4 ring-orange-100"
                      : step > s.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s.id ? <Check size={16} /> : s.id}
                </div>
                <span
                  className={`text-sm font-medium hidden md:inline ${
                    step === s.id ? "text-orange-600" : "text-gray-500"
                  }`}
                >
                  {s.name}
                </span>
                {s.id < 3 && (
                  <ChevronRight
                    size={16}
                    className="text-gray-300 hidden md:inline"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-10 sm:w-20"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 📦 LEFT COLUMN: FORMS */}
          <div className="lg:col-span-8 space-y-6">
            {/* SUCCESS STATE */}
            {step === 4 ? (
              <div className="bg-white rounded-3xl shadow-xl p-8 py-16 text-center animate-slideLeft">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <Check size={48} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-4">
                  Commande Confirmée !
                </h1>
                <p className="text-gray-600 mb-10 max-w-md mx-auto">
                  Merci pour votre confiance. Votre commande est en cours de
                  préparation et vous recevrez un email de confirmation d'ici
                  quelques instants.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/dashboard"
                    className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-colors"
                  >
                    Suivre ma commande
                  </Link>
                  <Link
                    to="/"
                    className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1: ADDRESS */}
                {step === 1 && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-slideRight">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <MapPin size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Adresse de Livraison
                      </h2>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Prénom
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Jean"
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          value={address.firstName}
                          onChange={(e) =>
                            setAddress({
                              ...address,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Nom
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Dupont"
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          value={address.lastName}
                          onChange={(e) =>
                            setAddress({ ...address, lastName: e.target.value })
                          }
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="jean.dupont@example.com"
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          value={address.email}
                          onChange={(e) =>
                            setAddress({ ...address, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Numéro de téléphone
                        </label>
                        <input
                          type="tel"
                          placeholder="+225 00 00 00 00 00"
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          value={address.phone}
                          onChange={(e) =>
                            setAddress({ ...address, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Adresse Complète
                        </label>
                        <input
                          type="text"
                          placeholder="Ruelle, Quartier, Appartement..."
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          value={address.address}
                          onChange={(e) =>
                            setAddress({ ...address, address: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Ville
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Abidjan"
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          value={address.city}
                          onChange={(e) =>
                            setAddress({ ...address, city: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Région
                        </label>
                        <select
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          value={address.region}
                          onChange={(e) =>
                            setAddress({ ...address, region: e.target.value })
                          }
                        >
                          <option value="">Sélectionnez une région</option>
                          <option value="abidjan">Abidjan</option>
                          <option value="bouake">Bouaké</option>
                          <option value="yamoussoukro">Yamoussoukro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: SHIPPING */}
                {step === 2 && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-slideRight">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Truck size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Mode de Livraison
                      </h2>
                    </div>
                    <div className="p-8 space-y-4">
                      <div
                        onClick={() => setShippingMethod("express")}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          shippingMethod === "express"
                            ? "border-orange-500 bg-orange-50/30"
                            : "border-gray-100 hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              shippingMethod === "express"
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {shippingMethod === "express" && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              Jumia Express
                            </p>
                            <p className="text-sm text-gray-500">
                              Livraison demain avant 18h
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-orange-600">
                          Gratuit
                        </span>
                      </div>

                      <div
                        onClick={() => setShippingMethod("standard")}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          shippingMethod === "standard"
                            ? "border-orange-500 bg-orange-50/30"
                            : "border-gray-100 hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              shippingMethod === "standard"
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {shippingMethod === "standard" && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              Livraison Standard
                            </p>
                            <p className="text-sm text-gray-500">
                              Livraison en 2-4 jours ouvrés
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">
                          1,500 FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: PAYMENT */}
                {step === 3 && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-slideRight">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <CreditCard size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Mode de Paiement
                      </h2>
                    </div>
                    <div className="p-8 space-y-4">
                      <div
                        onClick={() => setPaymentMethod("card")}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          paymentMethod === "card"
                            ? "border-orange-500 bg-orange-50/30"
                            : "border-gray-100 hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === "card"
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {paymentMethod === "card" && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <CreditCard className="text-gray-400" />
                            <div>
                              <p className="font-bold text-gray-900">
                                Carte Bancaire
                              </p>
                              <p className="text-sm text-gray-500">
                                Visa, Mastercard, American Express
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setPaymentMethod("mobile")}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          paymentMethod === "mobile"
                            ? "border-orange-500 bg-orange-50/30"
                            : "border-gray-100 hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === "mobile"
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {paymentMethod === "mobile" && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center text-[10px] font-bold text-orange-600">
                              $$
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                Mobile Money
                              </p>
                              <p className="text-sm text-gray-500">
                                Orange, MTN, Wave, Moov
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setPaymentMethod("cod")}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          paymentMethod === "cod"
                            ? "border-orange-500 bg-orange-50/30"
                            : "border-gray-100 hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === "cod"
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {paymentMethod === "cod" && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              Paiement à la livraison
                            </p>
                            <p className="text-sm text-gray-500">
                              Payez en cash ou par carte lors de la réception
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TRUST BADGE */}
            {step !== 4 && (
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-2xl">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">
                    Paiement 100% Sécurisé
                  </p>
                  <p className="text-xs text-green-600">
                    Vos données sont protégées par un cryptage SSL de niveau
                    bancaire.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 🧾 RIGHT COLUMN: SUMMARY */}
          {step !== 4 && (
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">
                    Résumé de la commande
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 flex-shrink-0 overflow-hidden">
                          <img
                            src={item.images?.[0]}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qté: {item.qty}
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {item.price.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between text-gray-500">
                      <span>Sous-total</span>
                      <span>{(totalPrice || 0).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Frais de port</span>
                      <span className="text-green-600 font-medium">
                        Gratuit
                      </span>
                    </div>
                    <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t border-dashed border-gray-200">
                      <span>TOTAL</span>
                      <span className="text-orange-600">
                        {(totalPrice || 0).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-orange-500/20 group transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {step === 3 ? "CONFIRMER MA COMMANDE" : "CONTINUER"}
                        <ChevronRight
                          size={20}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed">
                    En cliquant sur "Confirmer", vous acceptez nos conditions
                    générales de vente et notre politique de confidentialité.
                  </p>
                </div>
              </div>

              {/* HELP CARD */}
              <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl shadow-gray-200">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">
                  Service Client
                </p>
                <h4 className="font-bold mb-4">Besoin d'aide ?</h4>
                <a
                  href="tel:+22501020304"
                  className="flex items-center gap-3 text-orange-400 font-bold mb-2 hover:text-orange-300 transition-colors"
                >
                  📞 +225 01 02 03 04
                </a>
                <p className="text-xs text-gray-400">
                  Disponible 24/7 pour vous accompagner dans vos achats.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
