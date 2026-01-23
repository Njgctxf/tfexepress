import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CreditCard,
  Truck,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Ticket,
  X,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { createOrder } from "../services/api";



const Checkout = () => {
  const { cart, totalPrice, subTotal, discount, clearCart, loyaltyAmount, usePoints } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Info, 2: Shipping, 3: Payment, 4: Success
  const [loading, setLoading] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const [earningRate, setEarningRate] = useState(1000);
  const [redemptionRate, setRedemptionRate] = useState(1);
  const [shippingRates, setShippingRates] = useState({
    standard: 1500,
    express: 3000,
    national: 5000,
    internationalAir: 15000,
    internationalSea: 10000,
    freeThreshold: 100000
  });
  const [shippingZone, setShippingZone] = useState('abidjan'); // 'abidjan', 'national', 'international'
  const [intlMethod, setIntlMethod] = useState(null); // 'air', 'sea'

  useEffect(() => {
    // Fetch Settings
    supabase.from("site_settings").select("value").eq("key", "loyalty").single()
      .then(({ data }) => {
        if (data?.value) {
          if (data.value.earningRate) setEarningRate(data.value.earningRate);
          if (data.value.redemptionRate) setRedemptionRate(data.value.redemptionRate);
        }
      });

    // Fetch Shipping Settings
    supabase.from("site_settings").select("value").eq("key", "shipping").single()
      .then(({ data }) => {
        if (data?.value) {
          setShippingRates({
            standard: data.value.standard !== undefined ? Number(data.value.standard) : 1500,
            express: data.value.express !== undefined ? Number(data.value.express) : 3000,
            national: data.value.national !== undefined ? Number(data.value.national) : 5000,
            internationalAir: data.value.internationalAir !== undefined ? Number(data.value.internationalAir) : 15000,
            internationalSea: data.value.internationalSea !== undefined ? Number(data.value.internationalSea) : 10000,
            freeThreshold: data.value.freeThreshold !== undefined ? Number(data.value.freeThreshold) : 100000
          });
        }
      });
  }, []);

  // Form states
  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    region: "",
    phone: "",
    saveInfo: true
  });

  const [shippingMethod, setShippingMethod] = useState(null); // Force selection
  const [paymentMethod, setPaymentMethod] = useState(null); // Force selection

  // Handlers
  const [errors, setErrors] = useState({});

  // Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNextStep = () => {
    // STEP 1 VALIDATION
    if (step === 1) {
      const required = ['email', 'firstName', 'lastName', 'address', 'city', 'phone'];
      const newErrors = {};

      required.forEach(field => {
        if (!formData[field].trim()) {
          newErrors[field] = "Ce champ est obligatoire";
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        window.scrollTo(0, 0);
        return;
      }
    }

    // STEP 2 VALIDATION
    if (step === 2) {
      if (!shippingMethod) {
        setErrors({ shippingMethod: "Veuillez choisir un mode de livraison" });
        return;
      }
    }

    // STEP 3 VALIDATION (Before Order)
    if (step === 3) {
      if (!paymentMethod) {
        setErrors({ paymentMethod: "Veuillez choisir un moyen de paiement" });
        return;
      }
    }

    if (step < 3) setStep(step + 1);
    else handlePlaceOrder();
    window.scrollTo(0, 0);
  };

  const handleBackStep = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/cart");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      let finalShippingCost = 0;

      if (shippingZone === 'abidjan') {
        finalShippingCost = shippingMethod === 'standard' ? shippingRates.standard : shippingRates.express;
      } else if (shippingZone === 'national') {
        finalShippingCost = shippingRates.national;
      } else { // international
        finalShippingCost = intlMethod === 'air' ? shippingRates.internationalAir : shippingRates.internationalSea;
      }

      const couponAmount = discount ? (subTotal * discount.percent / 100) : 0;
      const amountToCover = subTotal - couponAmount;
      const authorizedPointsValue = usePoints ? loyaltyAmount : 0;
      const actualDiscountValue = Math.min(authorizedPointsValue, amountToCover);
      const actualPointsUsed = Math.ceil(actualDiscountValue / redemptionRate);
      const finalTotal = Math.max(0, amountToCover - actualDiscountValue) + finalShippingCost;
      const pointsEarned = Math.floor(finalTotal / earningRate);

      // CALL BACKEND API
      // This ensures emails are sent and business logic is centralized
      await createOrder({
        user_id: user?.id || null,
        user_email: formData.email,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.qty,
          price: item.price,
          name: item.name,
          image: item.image || item.images?.[0],
          variant: item.variant,
          size: item.size
        })),
        total: finalTotal,
        shipping_address: formData,
        payment_method: paymentMethod,
        shipping_cost: finalShippingCost,
        points_used: actualPointsUsed,
        points_earned: pointsEarned,
        coupon_code: discount?.code || null,
        metadata: {
          points_value_f: actualDiscountValue,
          initial_subtotal: subTotal
        }
      });

      setStep(4);
      clearCart();
    } catch (err) {
      console.error("Order Error:", err);
      // Simplify error message for user
      const msg = err.message?.includes("Failed to fetch")
        ? "Impossible de contacter le serveur. Vérifiez votre connexion."
        : err.message || "Erreur inconnue";
      alert("Une erreur est survenue: " + msg);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderField = (name, placeholder, type = "text", fullWidth = true) => (
    <div className={fullWidth ? "w-full" : ""}>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full p-3 border rounded-lg outline-none transition-all ${errors[name]
          ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
          : "border-gray-300 focus:ring-2 focus:ring-black focus:border-black"
          }`}
        value={formData[name]}
        onChange={handleInputChange}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors[name]}</p>
      )}
    </div>
  );

  const Breadcrumbs = () => (
    <div className="flex items-center text-xs md:text-sm font-medium mb-8">
      <button onClick={() => setStep(1)} className={`${step === 1 ? 'text-black font-bold' : 'text-orange-500'}`}>Information</button>
      <ChevronRight size={14} className="mx-2 text-gray-400" />
      <button onClick={() => step > 1 && setStep(2)} disabled={step < 2} className={`${step === 2 ? 'text-black font-bold' : step > 2 ? 'text-orange-500' : 'text-gray-400'}`}>Livraison</button>
      <ChevronRight size={14} className="mx-2 text-gray-400" />
      <button onClick={() => step > 2 && setStep(3)} disabled={step < 3} className={`${step === 3 ? 'text-black font-bold' : step > 3 ? 'text-orange-500' : 'text-gray-400'}`}>Paiement</button>
    </div>
  );

  const OrderSummaryItem = ({ item }) => (
    <div className="flex gap-4 items-center">
      <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
        <img src={item.image || item.images?.[0] || "/placeholder.png"} alt={item.name} className="w-full h-full object-contain p-1" />
        <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {item.qty}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-500">
          {item.size && <span className="mr-2 font-bold text-black border border-gray-200 px-1 rounded-sm">Taille: {item.size}</span>}
          {item.variant || "Standard"}
        </p>
      </div>
      <p className="text-sm font-medium text-gray-900">{(item.price * item.qty).toLocaleString()} F</p>
    </div>
  );

  // --- MAIN LAYOUT ---

  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Commande Confirmée !</h2>
          <p className="text-gray-500 mb-8">Merci pour votre achat. Vous recevrez un email de confirmation dans quelques instants.</p>
          <Link to="/" className="block w-full bg-black text-white py-4 rounded-xl font-bold">Retour à la boutique</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* LEFT COLUMN (Form) */}
      <div className="flex-1 bg-white order-2 lg:order-1 pt-8 lg:pt-0">
        <div className="max-w-2xl ml-auto mr-auto lg:mr-0 px-4 lg:px-12 py-8 lg:py-12">

          {/* Header (Desktop) */}
          <div className="hidden lg:flex justify-between items-center mb-8">
            <Link to="/" className="text-2xl font-black tracking-tighter">TFExpress</Link>
            <Link to="/cart" replace className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-2">
              <ArrowLeft size={16} />
              Retour au panier
            </Link>
          </div>

          {/* Mobile Header with Back Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <Link to="/" className="text-xl font-black tracking-tighter">TFExpress</Link>
            <Link to="/cart" replace className="text-sm font-medium text-orange-600">Retour au panier</Link>
          </div>

          <Breadcrumbs />

          {/* STEP 1: INFORMATION */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Coordonnées</h2>
                {!user && <Link to="/login" className="text-sm text-orange-600 hover:underline">Déjà un compte ? Se connecter</Link>}
              </div>

              <div className="space-y-4">
                {renderField("email", "Adresse e-mail", "email")}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newsletter"
                    className="rounded text-black focus:ring-black"
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-600">S'inscrire aux actualités et offres exclusives</label>
                </div>
              </div>

              <h2 className="text-xl font-medium mt-8 mb-4">Adresse de livraison</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {renderField("firstName", "Prénom")}
                  {renderField("lastName", "Nom")}
                </div>

                {renderField("address", "Adresse (Numéro, Rue)")}
                {renderField("apartment", "Appartement, suite, etc. (optionnel)")}

                <div className="grid grid-cols-2 gap-3">
                  {renderField("city", "Ville")}
                  {renderField("phone", "Téléphone")}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    name="saveInfo"
                    type="checkbox"
                    id="saveInfo"
                    className="rounded text-black focus:ring-black"
                    checked={formData.saveInfo}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="saveInfo" className="text-sm text-gray-600">Sauvegarder mes informations pour la prochaine fois</label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LIVRAISON */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Contact</span>
                  <span className="text-gray-900 font-medium">{formData.email}</span>
                  <button onClick={() => setStep(1)} className="text-xs font-medium text-orange-600 hover:text-orange-700 underline">Modifier</button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Expédier à</span>
                  <span className="text-gray-900 font-medium truncate max-w-[200px]">{formData.address}, {formData.city}</span>
                  <button onClick={() => setStep(1)} className="text-xs font-medium text-orange-600 hover:text-orange-700 underline">Modifier</button>
                </div>
              </div>

              <h2 className="text-xl font-medium mt-6">Zone de Livraison</h2>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${shippingZone === 'abidjan' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => { setShippingZone('abidjan'); setShippingMethod(null); setIntlMethod(null); }}
                >
                  Abidjan
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${shippingZone === 'national' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => { setShippingZone('national'); setShippingMethod('national'); setIntlMethod(null); }}
                >
                  Intérieur du Pays
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${shippingZone === 'international' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => { setShippingZone('international'); setShippingMethod(null); setIntlMethod(null); }}
                >
                  International
                </button>
              </div>

              <h2 className="text-xl font-medium">Mode de livraison</h2>
              <div className={`border rounded-lg overflow-hidden ${errors.shippingMethod ? 'border-red-500' : 'border-gray-200'}`}>

                {/* ABIDJAN OPTIONS */}
                {shippingZone === 'abidjan' && (
                  <>
                    <div
                      className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'bg-orange-50/50 border-orange-500' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setShippingMethod('standard');
                        setErrors(prev => ({ ...prev, shippingMethod: null }));
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${shippingMethod === 'standard' ? 'border-orange-600' : 'border-gray-300'}`}>
                          {shippingMethod === 'standard' && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                        </div>
                        <span className="text-sm font-medium">Standard (2-4 jours)</span>
                      </div>
                      <span className="text-sm font-medium">{shippingRates.standard.toLocaleString()} F</span>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <div
                      className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${shippingMethod === 'express' ? 'bg-orange-50/50 border-orange-500' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setShippingMethod('express');
                        setErrors(prev => ({ ...prev, shippingMethod: null }));
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${shippingMethod === 'express' ? 'border-orange-600' : 'border-gray-300'}`}>
                          {shippingMethod === 'express' && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                        </div>
                        <span className="text-sm font-medium">Express (24h)</span>
                      </div>
                      <span className="text-sm font-medium">{shippingRates.express.toLocaleString()} F</span>
                    </div>
                  </>
                )}

                {/* NATIONAL */}
                {shippingZone === 'national' && (
                  <div
                    className={`flex justify-between items-center p-4 cursor-pointer bg-orange-50/50 border-orange-500`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-orange-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-orange-600" />
                      </div>
                      <span className="text-sm font-medium">Expédition Nationale</span>
                    </div>
                    <span className="text-sm font-medium">{shippingRates.national.toLocaleString()} F</span>
                  </div>
                )}

                {/* INTERNATIONAL */}
                {shippingZone === 'international' && (
                  <>
                    <div
                      className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${intlMethod === 'air' ? 'bg-orange-50/50 border-orange-500' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setIntlMethod('air');
                        setShippingMethod('international_air');
                        setErrors(prev => ({ ...prev, shippingMethod: null }));
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${intlMethod === 'air' ? 'border-orange-600' : 'border-gray-300'}`}>
                          {intlMethod === 'air' && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                        </div>
                        <span className="text-sm font-medium">✈️ Par Avion (Rapide)</span>
                      </div>
                      <span className="text-sm font-medium">{shippingRates.internationalAir.toLocaleString()} F</span>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <div
                      className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${intlMethod === 'sea' ? 'bg-orange-50/50 border-orange-500' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setIntlMethod('sea');
                        setShippingMethod('international_sea');
                        setErrors(prev => ({ ...prev, shippingMethod: null }));
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${intlMethod === 'sea' ? 'border-orange-600' : 'border-gray-300'}`}>
                          {intlMethod === 'sea' && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                        </div>
                        <span className="text-sm font-medium">🚢 Par Bateau (Économique)</span>
                      </div>
                      <span className="text-sm font-medium">{shippingRates.internationalSea.toLocaleString()} F</span>
                    </div>
                  </>
                )}

              </div>
              {errors.shippingMethod && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.shippingMethod}</p>
              )}
            </div>
          )}

          {/* STEP 3: PAIEMENT */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Contact</span>
                  <span className="text-gray-900 font-medium">{formData.email}</span>
                  <button onClick={() => setStep(1)} className="text-xs font-medium text-orange-600 hover:text-orange-700 underline">Modifier</button>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Expédier à</span>
                  <span className="text-gray-900 font-medium truncate max-w-[200px]">{formData.address}</span>
                  <button onClick={() => setStep(1)} className="text-xs font-medium text-orange-600 hover:text-orange-700 underline">Modifier</button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Méthode</span>
                  <span className="text-gray-900 font-medium">{shippingMethod === 'standard' ? 'Standard' : 'Express'}</span>
                  <button onClick={() => setStep(2)} className="text-xs font-medium text-orange-600 hover:text-orange-700 underline">Modifier</button>
                </div>
              </div>

              <h2 className="text-xl font-medium mt-6">Paiement</h2>
              <p className="text-sm text-gray-500">Toutes les transactions sont sécurisées et cryptées.</p>

              <div className={`border rounded-lg overflow-hidden ${errors.paymentMethod ? 'border-red-500' : 'border-gray-200'}`}>
                <div
                  className={`flex items-center p-4 cursor-pointer gap-3 ${paymentMethod === 'card' ? 'bg-gray-50' : ''}`}
                  onClick={() => {
                    setPaymentMethod('card');
                    setErrors(prev => ({ ...prev, paymentMethod: null }));
                  }}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-black' : 'border-gray-300'}`}>
                    {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                  <span className="text-sm font-medium flex-1">Carte Bancaire (Visa, Mastercard)</span>
                  <CreditCard size={20} className="text-gray-600" />
                </div>
                <div
                  className={`flex items-center p-4 cursor-pointer gap-3 border-t border-gray-200 ${paymentMethod === 'mobile' ? 'bg-gray-50' : ''}`}
                  onClick={() => {
                    setPaymentMethod('mobile');
                    setErrors(prev => ({ ...prev, paymentMethod: null }));
                  }}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'mobile' ? 'border-black' : 'border-gray-300'}`}>
                    {paymentMethod === 'mobile' && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                  <span className="text-sm font-medium flex-1">Mobile Money (Orange, MTN, Wave)</span>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Orange_logo.svg/1200px-Orange_logo.svg.png" className="h-4" alt="Orange" />
                </div>
                <div
                  className={`flex items-center p-4 cursor-pointer gap-3 border-t border-gray-200 ${paymentMethod === 'cod' ? 'bg-gray-50' : ''}`}
                  onClick={() => {
                    setPaymentMethod('cod');
                    setErrors(prev => ({ ...prev, paymentMethod: null }));
                  }}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-black' : 'border-gray-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                  <span className="text-sm font-medium">Paiement à la livraison</span>
                </div>
              </div>
              {errors.paymentMethod && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.paymentMethod}</p>
              )}
            </div>
          )}

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col-reverse md:flex-row md:items-center justify-between gap-4">
            {step > 1 && (
              <button
                onClick={handleBackStep}
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-black transition-colors py-3"
              >
                <ArrowLeft size={16} />
                Retour à l'étape précédente
              </button>
            )}
            <button
              onClick={handleNextStep}
              className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
              disabled={loading}
            >
              {loading ? 'Chargement...' : step === 3 ? 'Payer maintenant' : 'Continuer'}
            </button>
          </div>

          {/* FOOTER */}
          <div className="border-t border-gray-200 mt-12 pt-4 flex gap-4 text-xs text-gray-400">
            <Link to="/policy" className="hover:text-gray-600">Politique de remboursement</Link>
            <Link to="/shipping" className="hover:text-gray-600">Politique d'expédition</Link>
            <Link to="/privacy" className="hover:text-gray-600">Confidentialité</Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (Summary) */}
      <div className="flex-1 bg-gray-50 border-l border-gray-200 order-1 lg:order-2">
        {/* Mobile Summary Toggle */}
        <div className="lg:hidden p-5 border-b border-gray-100 bg-white flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors" onClick={() => setShowOrderSummary(!showOrderSummary)}>
          <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
            <span className="text-gray-500">{showOrderSummary ? 'Masquer le sommaire' : 'Afficher le sommaire'}</span>
            {showOrderSummary ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          </div>
          <span className="font-bold text-lg tracking-tight">{totalPrice.toLocaleString()} F</span>
        </div>

        {/* Desktop & Mobile Expanded Content */}
        <div className={`
            lg:block lg:sticky lg:top-0 lg:h-screen 
            ${showOrderSummary ? 'block' : 'hidden'}
        `}>
          <div className="p-6 md:p-12 max-w-lg">
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <OrderSummaryItem key={item.cartId || item.id} item={item} />
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium text-gray-900">{subTotal.toLocaleString()} F</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expédition</span>
                <span className="text-gray-500 text-xs">
                  {shippingMethod === 'standard' ? `${shippingRates.standard.toLocaleString()} F` :
                    shippingMethod === 'express' ? `${shippingRates.express.toLocaleString()} F` :
                      shippingMethod === 'national' ? `${shippingRates.national.toLocaleString()} F` :
                        shippingMethod === 'international_air' ? `${shippingRates.internationalAir.toLocaleString()} F` :
                          shippingMethod === 'international_sea' ? `${shippingRates.internationalSea.toLocaleString()} F` : '-'}
                </span>
              </div>

              {/* COUPON & POINTS UI REMOVED FROM HERE */}
              {/* Only Display Discounts applied */}
              {discount && (
                <div className="flex justify-between items-center text-green-600 font-medium text-sm animate-in fade-in slide-in-from-right-4">
                  <span className="flex items-center gap-1"><Ticket size={14} /> Remise ({discount.code})</span>
                  <span>- {((subTotal * discount.percent) / 100).toLocaleString()} F</span>
                </div>
              )}

              {/* POINTS DISPLAY */}
              {usePoints && (loyaltyAmount || 0) > 0 && (
                <div className="flex justify-between items-center text-indigo-600 font-medium text-sm animate-in fade-in slide-in-from-right-4">
                  <span className="flex items-center gap-1"><Sparkles size={14} /> Points Fidélité</span>
                  <span>- {(loyaltyAmount || 0).toLocaleString()} F</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <div className="text-right">
                  {/* Strikethrough Display if Discounted */}
                  {(discount || usePoints) && (
                    <span className="block text-xs text-gray-400 line-through decoration-red-500/50 mb-1">
                      {(subTotal + (
                        shippingMethod === 'standard' ? shippingRates.standard :
                          shippingMethod === 'express' ? shippingRates.express :
                            shippingMethod === 'national' ? shippingRates.national :
                              shippingMethod === 'international_air' ? shippingRates.internationalAir :
                                shippingMethod === 'international_sea' ? shippingRates.internationalSea : 0)
                      ).toLocaleString()} F
                    </span>
                  )}
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-xs text-gray-500">XOF</span>
                    <span className="text-2xl font-black text-gray-900">
                      {/* TotalPrice includes discounts, just add shipping */}
                      {(totalPrice
                        + (
                          shippingMethod === 'standard' ? shippingRates.standard :
                            shippingMethod === 'express' ? shippingRates.express :
                              shippingMethod === 'national' ? shippingRates.national :
                                shippingMethod === 'international_air' ? shippingRates.internationalAir :
                                  shippingMethod === 'international_sea' ? shippingRates.internationalSea : 0)
                      ).toLocaleString()
                      } F
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Checkout;
