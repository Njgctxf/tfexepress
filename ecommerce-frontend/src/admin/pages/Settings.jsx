import { useState, useRef, useEffect } from "react";
import {
    Save, Globe, CreditCard, Truck, Shield,
    Store, Mail, Lock, CheckCircle, Smartphone,
    Plus, Trash2, Edit, Plane, Ship, X,
    User, Camera, Eye, EyeOff, Facebook, Instagram, Youtube, Linkedin, Twitter
} from "lucide-react";

import { useAdminUI } from "../context/AdminUIContext";

export default function Settings() {
    const { adminProfile, updateAdminProfile, updateUserAuth, siteSettings, updateSiteSettings } = useAdminUI();
    const [activeTab, setActiveTab] = useState("profile");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef(null);

    // Password visibility states
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // FORM STATE
    const [settings, setSettings] = useState({
        // Profile
        firstName: "",
        lastName: "",
        personalEmail: "",
        avatar: null,

        // General
        siteName: "",
        supportEmail: "",
        supportPhone: "",
        siteAddress: "",
        currency: "EUR",

        // Socials
        facebook: "",
        instagram: "",
        tiktok: "",
        youtube: "",
        twitter: "",
        linkedin: "",
        pinterest: "",
        snapchat: "",

        // Config
        stripeEnabled: false,
        stripePublicKey: "",
        stripeSecretKey: "",
        paypalEnabled: false,
        paypalClientId: "",

        shippingMethods: [],
        shippingFreeThreshold: 0,

        // Security (Local only)
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Sync local state with context when profile OR settings load
    useEffect(() => {
        if (!adminProfile.loading && !siteSettings.loading) {
            setSettings(prev => ({
                ...prev,
                // Profile
                firstName: adminProfile.firstName || "",
                lastName: adminProfile.lastName || "",
                personalEmail: adminProfile.email || "",
                avatar: adminProfile.avatar || null,

                // General
                siteName: siteSettings.general?.siteName || "",
                supportEmail: siteSettings.general?.supportEmail || "",
                supportPhone: siteSettings.general?.supportPhone || "",
                siteAddress: siteSettings.general?.siteAddress || "",
                currency: siteSettings.general?.currency || "EUR",

                facebook: siteSettings.general?.facebook || "",
                instagram: siteSettings.general?.instagram || "",
                tiktok: siteSettings.general?.tiktok || "",
                youtube: siteSettings.general?.youtube || "",
                twitter: siteSettings.general?.twitter || "",
                linkedin: siteSettings.general?.linkedin || "",
                pinterest: siteSettings.general?.pinterest || "",
                snapchat: siteSettings.general?.snapchat || "",

                // Shipping
                shippingMethods: siteSettings.shipping?.methods || [
                    { id: 'std', name: 'Livraison Standard', price: siteSettings.shipping?.standard || 2000, zone: 'abidjan', details: '2-4 jours', enabled: true },
                    { id: 'exp', name: 'Livraison Express', price: siteSettings.shipping?.express || 3000, zone: 'abidjan', details: '24h', enabled: true },
                    { id: 'nat', name: 'Expedition Nationale', price: siteSettings.shipping?.national || 5000, zone: 'national', details: '', enabled: true },
                    { id: 'air', name: '✈️ Par Avion', price: siteSettings.shipping?.internationalAir || 50000, zone: 'international', details: '', enabled: true },
                    { id: 'sea', name: '🚢 Par Bateau', price: siteSettings.shipping?.internationalSea || 20000, zone: 'international', details: '', enabled: true }
                ],
                shippingFreeThreshold: siteSettings.shipping?.freeThreshold || 0,

                // Payments
                stripeEnabled: siteSettings.payments?.stripeEnabled || false,
                stripePublicKey: siteSettings.payments?.stripePublicKey || "",
                stripeSecretKey: siteSettings.payments?.stripeSecretKey || "",
                paypalEnabled: siteSettings.payments?.paypalEnabled || false,
                paypalClientId: siteSettings.payments?.paypalClientId || ""
            }));
        }
    }, [adminProfile, siteSettings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);

            // 1. SAVE PROFILE (AND EMAIL IF CHANGED)
            if (activeTab === "profile") {
                await updateAdminProfile({
                    firstName: settings.firstName,
                    lastName: settings.lastName,
                    email: settings.personalEmail,
                    avatar: settings.avatar
                });

                // Check if email changed
                if (settings.personalEmail && settings.personalEmail !== adminProfile.email) {
                    await updateUserAuth({ email: settings.personalEmail });
                    alert("Email de connexion mis à jour ! Veuillez vérifier votre ancienne et nouvelle boîte mail pour confirmer.");
                }
            }

            // 2. SAVE CONFIG (PERSISTED)
            if (activeTab === "general") {
                await updateSiteSettings('general', {
                    siteName: settings.siteName,
                    supportEmail: settings.supportEmail,
                    supportPhone: settings.supportPhone,
                    siteAddress: settings.siteAddress,
                    currency: settings.currency,
                    facebook: settings.facebook,
                    instagram: settings.instagram,
                    tiktok: settings.tiktok,
                    youtube: settings.youtube,
                    twitter: settings.twitter,
                    linkedin: settings.linkedin,
                    pinterest: settings.pinterest,
                    snapchat: settings.snapchat
                });
            }
            if (activeTab === "shipping") {
                await updateSiteSettings('shipping', {
                    methods: settings.shippingMethods,
                    freeThreshold: Number(settings.shippingFreeThreshold)
                });
            }
            if (activeTab === "payments") {
                await updateSiteSettings('payments', {
                    stripeEnabled: settings.stripeEnabled,
                    stripePublicKey: settings.stripePublicKey,
                    stripeSecretKey: settings.stripeSecretKey,
                    paypalEnabled: settings.paypalEnabled,
                    paypalClientId: settings.paypalClientId
                });
            }

            // 3. SAVE SECURITY (PASSWORD)
            if (activeTab === "security") {
                if (settings.newPassword) {
                    if (settings.newPassword !== settings.confirmPassword) {
                        throw new Error("Les nouveaux mots de passe ne correspondent pas.");
                    }
                    if (settings.newPassword.length < 6) {
                        throw new Error("Le mot de passe doit faire au moins 6 caractères.");
                    }

                    await updateUserAuth({ password: settings.newPassword });
                    setSettings(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
                    alert("Mot de passe mis à jour avec succès !");
                }
            }


            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
            setSaving(false);
            alert("Erreur: " + err.message);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newAvatar = reader.result;
                setSettings(prev => ({ ...prev, avatar: newAvatar }));
                updateAdminProfile({ avatar: newAvatar });
            };
            reader.readAsDataURL(file);
        }
    };

    const addShippingMethod = (zone) => {
        const newMethod = {
            id: 'meth-' + Date.now(),
            name: 'Nouvelle méthode',
            price: 0,
            zone: zone,
            details: '',
            enabled: true
        };
        setSettings(prev => ({
            ...prev,
            shippingMethods: [...prev.shippingMethods, newMethod]
        }));
    };

    const updateShippingMethod = (id, field, value) => {
        setSettings(prev => ({
            ...prev,
            shippingMethods: prev.shippingMethods.map(m =>
                m.id === id ? { ...m, [field]: field === 'price' ? Number(value) : value } : m
            )
        }));
    };

    const removeShippingMethod = (id) => {
        if (window.confirm("Supprimer cette méthode de livraison ?")) {
            setSettings(prev => ({
                ...prev,
                shippingMethods: prev.shippingMethods.filter(m => m.id !== id)
            }));
        }
    };

    const toggleShippingMethod = (id) => {
        setSettings(prev => ({
            ...prev,
            shippingMethods: prev.shippingMethods.map(m =>
                m.id === id ? { ...m, enabled: !m.enabled } : m
            )
        }));
    };

    const tabs = [
        { id: "profile", label: "Mon Profil", icon: User, desc: "Informations personnelles" },
        { id: "general", label: "Général", icon: Globe, desc: "Informations de la boutique" },
        { id: "payments", label: "Paiements", icon: CreditCard, desc: "Passerelles et devises" },
        { id: "shipping", label: "Livraison", icon: Truck, desc: "Frais et zones" },
        { id: "security", label: "Sécurité", icon: Shield, desc: "Mots de passe et accès" },
    ];

    const getCurrencySymbol = (code) => {
        switch (code) {
            case 'USD': return '$';
            case 'GBP': return '£';
            case 'XOF': return 'FCFA';
            case 'EUR': return '€';
            default: return code;
        }
    };

    return (
        <div className="space-y-6 pt-2 pb-10 max-w-[1200px] w-full mx-auto font-sans">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        Paramètres
                    </h1>
                    <p className="text-gray-500 mt-1">Configurez votre boutique et vos préférences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`fixed bottom-6 right-6 z-50 shadow-xl md:static md:shadow-lg px-6 py-3 md:py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${saved ? "bg-green-500 text-white" : "bg-black text-white hover:bg-gray-800"
                        }`}
                >
                    {saving ? (
                        <div key="saving" className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saved ? (
                        <span key="saved" className="flex items-center gap-2"><CheckCircle size={18} /> Sauvegardé</span>
                    ) : (
                        <span key="idle" className="flex items-center gap-2"><Save size={18} /> Enregistrer</span>
                    )}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-8">

                {/* SIDEBAR TABS */}
                <div className="w-full lg:w-72 flex-shrink-0 space-y-2">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 group ${isActive
                                    ? "bg-white shadow-md shadow-gray-200 ring-1 ring-black/5"
                                    : "hover:bg-gray-50"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? "bg-black text-white" : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-black"
                                    }`}>
                                    <tab.icon size={20} />
                                </div>
                                <div className="overflow-hidden">
                                    <span className={`block font-bold truncate ${isActive ? "text-gray-900" : "text-gray-600"}`}>{tab.label}</span>
                                    <span className="text-xs text-gray-400 font-medium truncate block">{tab.desc}</span>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[500px]">

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Mon Profil</h2>
                                <p className="text-gray-500 text-sm mt-1">Gérez vos informations personnelles</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-400 overflow-hidden border-2 border-white shadow-lg">
                                        {settings.avatar ? (
                                            <img key="img" src={settings.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span key="initials">
                                                {((settings.firstName?.[0] || "") + (settings.lastName?.[0] || "")).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{`${settings.firstName || ""} ${settings.lastName || ""}`}</h3>
                                    <p className="text-gray-500 text-sm mb-2">Administrateur Principal</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        Changer la photo
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Prénom</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={settings.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Nom</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={settings.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Email personnel</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="personalEmail"
                                        value={settings.personalEmail}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GENERAL TAB */}
                    {activeTab === "general" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Informations Générales</h2>
                                <p className="text-gray-500 text-sm mt-1">Détails visibles par vos clients</p>
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Nom de la boutique</label>
                                    <div className="relative">
                                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="siteName"
                                            value={settings.siteName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Email de support</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            name="supportEmail"
                                            value={settings.supportEmail}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Devise principale</label>
                                    <select
                                        name="currency"
                                        value={settings.currency}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 outline-none transition-all font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="EUR">EUR (€)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="XOF">XOF (FCFA)</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Téléphone de support</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="supportPhone"
                                            value={settings.supportPhone}
                                            onChange={handleChange}
                                            placeholder="+225 07 00 00 00 00"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Adresse physique</label>
                                    <textarea
                                        name="siteAddress"
                                        value={settings.siteAddress}
                                        onChange={handleChange}
                                        rows="2"
                                        placeholder="Abidjan, Cocody..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 outline-none transition-all font-medium resize-none"
                                    />
                                </div>

                                <hr className="border-gray-100" />

                                <h3 className="text-lg font-bold text-gray-900">Réseaux Sociaux</h3>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Facebook</label>
                                        <div className="relative">
                                            <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="facebook"
                                                value={settings.facebook}
                                                onChange={handleChange}
                                                placeholder="URL Facebook"
                                                className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-black outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Instagram</label>
                                        <div className="relative">
                                            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="instagram"
                                                value={settings.instagram}
                                                onChange={handleChange}
                                                placeholder="URL Instagram"
                                                className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-black outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">TikTok</label>
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                            </svg>
                                            <input
                                                type="text"
                                                name="tiktok"
                                                value={settings.tiktok}
                                                onChange={handleChange}
                                                placeholder="URL TikTok"
                                                className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-black outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">YouTube</label>
                                        <div className="relative">
                                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="youtube"
                                                value={settings.youtube}
                                                onChange={handleChange}
                                                placeholder="URL YouTube"
                                                className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-black outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">X / Twitter</label>
                                        <div className="relative">
                                            <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="twitter"
                                                value={settings.twitter}
                                                onChange={handleChange}
                                                placeholder="URL X (Twitter)"
                                                className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-black outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">LinkedIn</label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="linkedin"
                                                value={settings.linkedin}
                                                onChange={handleChange}
                                                placeholder="URL LinkedIn"
                                                className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-black outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                 </div>
                            </div>
                        </div>
                    )}

                    {/* PAYMENTS TAB */}
                    {activeTab === "payments" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="pb-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Moyens de Paiement</h2>
                                    <p className="text-gray-500 text-sm mt-1">Gérez vos intégrations Stripe et PayPal</p>
                                </div>
                            </div>

                            {/* STRIPE */}
                            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#635BFF] text-white rounded-lg flex items-center justify-center font-bold">S</div>
                                        <span className="font-bold text-gray-900">Stripe</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="stripeEnabled" checked={settings.stripeEnabled} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                    </label>
                                </div>

                                {settings.stripeEnabled && (
                                    <div className="space-y-4 pt-4 border-t border-gray-200/50 animate-in fade-in">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Clé Publique</label>
                                            <input
                                                type="text"
                                                name="stripePublicKey"
                                                value={settings.stripePublicKey}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600 focus:border-black outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Clé Secrète</label>
                                            <input
                                                type="password"
                                                name="stripeSecretKey"
                                                value={settings.stripeSecretKey}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600 focus:border-black outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PAYPAL */}
                            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#003087] text-white rounded-lg flex items-center justify-center font-bold">P</div>
                                        <span className="font-bold text-gray-900">PayPal</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="paypalEnabled" checked={settings.paypalEnabled} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                    </label>
                                </div>

                                {settings.paypalEnabled && (
                                    <div className="space-y-4 pt-4 border-t border-gray-200/50 animate-in fade-in">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Client ID</label>
                                            <input
                                                type="text"
                                                name="paypalClientId"
                                                value={settings.paypalClientId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600 focus:border-black outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SHIPPING TAB */}
                    {activeTab === "shipping" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="pb-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Livraison & Frais</h2>
                                    <p className="text-gray-500 text-sm mt-1">Gérez vos zones et méthodes de livraison</p>
                                </div>
                            </div>

                            {/* SEUIL LIVRAISON GRATUITE */}
                            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-black text-white rounded-lg">
                                        <GiftIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Livraison Gratuite</h3>
                                        <p className="text-xs text-gray-500">Seuil à partir duquel la livraison devient gratuite (Abidjan uniquement)</p>
                                    </div>
                                </div>
                                <div className="relative max-w-xs">
                                    <input
                                        type="number"
                                        name="shippingFreeThreshold"
                                        value={settings.shippingFreeThreshold}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-16 py-2.5 bg-white border border-gray-200 rounded-xl font-bold focus:border-black outline-none transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 bg-gray-100 px-2 py-1 rounded text-[10px] pointer-events-none font-bold">
                                        {getCurrencySymbol(settings.currency)}
                                    </span>
                                </div>
                            </div>

                            {/* ZONES DE LIVRAISON */}
                            {['abidjan', 'national', 'international'].map(zone => (
                                <div key={zone} className="space-y-4">
                                    <div className="flex items-center justify-between pt-4">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 capitalize">
                                            {zone === 'abidjan' ? '📍 Abidjan' : zone === 'national' ? '🇨🇮 National (Intérieur)' : '🌍 International'}
                                        </h3>
                                        <button 
                                            onClick={() => addShippingMethod(zone)}
                                            className="text-xs font-bold flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all shadow-sm"
                                        >
                                            <Plus size={14} /> Ajouter une méthode
                                        </button>
                                    </div>

                                    <div className="grid gap-4">
                                        {settings.shippingMethods
                                            .filter(m => m.zone === zone)
                                            .map(method => (
                                                <div 
                                                    key={method.id} 
                                                    className={`p-5 rounded-2xl border transition-all ${method.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <input 
                                                                    type="text"
                                                                    value={method.name}
                                                                    onChange={(e) => updateShippingMethod(method.id, 'name', e.target.value)}
                                                                    placeholder="Nom de la livraison (ex: Express)"
                                                                    className="flex-1 bg-transparent font-bold text-gray-900 border-b border-transparent focus:border-gray-300 outline-none"
                                                                />
                                                                <button 
                                                                    onClick={() => toggleShippingMethod(method.id)}
                                                                    className={`p-1.5 rounded-lg transition-colors ${method.enabled ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
                                                                    title={method.enabled ? "Désactiver" : "Activer"}
                                                                >
                                                                    {method.enabled ? <CheckCircle size={18} /> : <X size={18} />}
                                                                </button>
                                                            </div>
                                                            <div className="flex flex-wrap gap-3">
                                                                <div className="relative w-32">
                                                                    <input 
                                                                        type="number"
                                                                        value={method.price}
                                                                        onChange={(e) => updateShippingMethod(method.id, 'price', e.target.value)}
                                                                        className="w-full pl-3 pr-10 py-1.5 bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none text-sm font-bold shadow-sm"
                                                                    />
                                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold uppercase">{getCurrencySymbol(settings.currency)}</span>
                                                                </div>
                                                                <input 
                                                                    type="text"
                                                                    value={method.details}
                                                                    onChange={(e) => updateShippingMethod(method.id, 'details', e.target.value)}
                                                                    placeholder="Détails (ex: 24h, Avion...)"
                                                                    className="flex-1 min-w-[150px] px-3 py-1.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-gray-200 outline-none text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-end">
                                                            <button 
                                                                onClick={() => removeShippingMethod(method.id)}
                                                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        {settings.shippingMethods.filter(m => m.zone === zone).length === 0 && (
                                            <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-sm">
                                                Aucune méthode de livraison pour cette zone.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === "security" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Sécurité & Accès</h2>
                                <p className="text-gray-500 text-sm mt-1">Modifiez votre mot de passe administrateur</p>
                            </div>

                            <div className="max-w-md space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Mot de passe actuel</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            disabled
                                            value="dummy-password-placeholder"
                                            className="w-full pl-12 pr-12 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-400 cursor-not-allowed items-center"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={settings.newPassword}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Confirmer le nouveau mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={settings.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function GiftIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8v13" />
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
        </svg>
    )
}
