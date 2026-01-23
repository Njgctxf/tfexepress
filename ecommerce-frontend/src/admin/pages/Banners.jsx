import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/AdminLayout';
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon, Link as LinkIcon, Palette, Tag, Upload, Search } from 'lucide-react';
import { getBanners, createBanner, updateBanner, deleteBanner, deleteAllBanners } from '../../services/api/banners.api';
import { getProducts } from '../../services/api/products.api';
import { getCategories } from '../../services/api/categories.api';
import { resizeImage } from '../../utils/imageUtils';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [mobilePreviewOpen, setMobilePreviewOpen] = useState(true); // Default open on mobile to see it, user can collapse
    const [deleteId, setDeleteId] = useState(null);
    const [confirmAll, setConfirmAll] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_key: '', // Will default to first category loading
        slot: 'main',
        badge: '',
        image_url: '',
        bg_color: '#000000',
        product_id: '',
        link: ''
    });

    const slots = [
        { value: 'main', label: 'Principal (Grand)' },
        { value: 'rightTop', label: 'Haut Droite (Carré)' },
        { value: 'rightBottom', label: 'Bas Droite (Carré)' }
    ];

    const predefinedBadges = ["Nouveau", "Promo", "Best Seller", "Exclusif", "Populaire", "Limited"];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bannerData, prodRes, catData] = await Promise.all([
                getBanners(),
                getProducts(),
                getCategories()
            ]);

            setBanners(bannerData);
            if (prodRes.success) setProducts(prodRes.data);
            setCategories(catData || []);

            // Set default category for form if available
            if (catData && catData.length > 0) {
                setFormData(prev => ({ ...prev, category_key: catData[0].name }));
            }
        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '', description: '',
            category_key: categories.length > 0 ? categories[0].name : '',
            slot: 'main',
            badge: '', image_url: '', bg_color: '#000000', product_id: '', link: ''
        });
        setEditingBanner(null);
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title || '',
            description: banner.description || '',
            category_key: banner.category_key,
            slot: banner.slot,
            badge: banner.badge || '',
            image_url: banner.image_url || '',
            bg_color: banner.bg_color && banner.bg_color.startsWith('#') ? banner.bg_color : '#000000', // Fallback if old tailwind class
            product_id: banner.product_id || '',
            link: banner.link || ''
        });
        setIsModalOpen(true);
    };
    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteBanner(deleteId);
            setBanners(prev => prev.filter(b => b.id !== deleteId));
            toast.success("Bannière supprimée");
            setDeleteId(null);
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const confirmDeleteAll = async () => {
        try {
            await deleteAllBanners();
            setBanners([]);
            toast.success("Toutes les bannières ont été supprimées.");
            setConfirmAll(false);
        } catch (error) {
            toast.error("Erreur lors de la suppression totale");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const base64 = await resizeImage(file);
            if (base64) {
                setFormData(prev => ({ ...prev, image_url: base64 }));
            }
        } catch (err) {
            console.error("Image upload failed", err);
            toast.error("Erreur lors du traitement de l'image");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBanner) {
                const updated = await updateBanner(editingBanner.id, formData);
                setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
            } else {
                const created = await createBanner(formData);
                setBanners(prev => [...prev, created]);
            }
            setIsModalOpen(false);
            resetForm();
            toast.success("Bannière enregistrée !");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'enregistrement: " + (error.message || "Erreur inconnue"));
        }
    };

    // Group banners by category
    const groupedBanners = banners.reduce((acc, b) => {
        const key = b.category_key || "Autre";
        if (!acc[key]) acc[key] = [];
        acc[key].push(b);
        return acc;
    }, {});

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Derived state for tabs
    const bannerCategories = Object.keys(groupedBanners);

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Bannières</h1>
                    <p className="text-gray-500 text-sm md:text-base">Gérez les publicités hero de l'accueil</p>
                </div>

                {/* SEARCH BAR (Mobile & Desktop) */}
                <div className="relative w-full md:w-64 order-last md:order-none mt-2 md:mt-0">
                    <input
                        type="text"
                        placeholder="Rechercher une bannière..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all shadow-sm"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    {banners.length > 0 && (
                        <button
                            onClick={() => setConfirmAll(true)}
                            className="flex-1 md:flex-none justify-center bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-100"
                        >
                            <Trash2 size={20} /> <span className="md:inline">Tout Supprimer</span>
                        </button>
                    )}
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex-1 md:flex-none justify-center bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
                    >
                        <Plus size={20} /> <span className="md:inline">Nouvelle Bannière</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Chargement...</div>
            ) : (
                <div className="space-y-6">
                    {/* TABS */}
                    {Object.keys(groupedBanners).length > 0 && (
                        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'all'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                Tout voir
                            </button>
                            {bannerCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-colors ${activeTab === cat
                                        ? 'bg-black text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {banners.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-xl">Aucune bannière. Créez-en une !</div>
                    )}

                    {/* CONTENT */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {(activeTab === 'all'
                            ? banners
                            : banners.filter(b => (b.category_key || 'Autre') === activeTab)
                        )
                            .filter(b => {
                                if (!searchTerm) return true;
                                const lowerTerm = searchTerm.toLowerCase();
                                return (
                                    (b.title && b.title.toLowerCase().includes(lowerTerm)) ||
                                    (b.description && b.description.toLowerCase().includes(lowerTerm)) ||
                                    (b.badge && b.badge.toLowerCase().includes(lowerTerm))
                                );
                            })
                            .map(banner => (
                                <div key={banner.id} className="border rounded-lg overflow-hidden group hover:shadow-md transition bg-white relative flex flex-col">
                                    <div
                                        className="h-32 flex items-center justify-center relative overflow-hidden flex-shrink-0"
                                        style={{ backgroundColor: banner.bg_color.startsWith('#') ? banner.bg_color : '#000' }}
                                    >
                                        {banner.image_url ? (
                                            <img src={banner.image_url} alt={banner.title} className="h-full w-auto object-contain z-10" />
                                        ) : (
                                            <ImageIcon className="text-white opacity-20" size={40} />
                                        )}
                                        <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                                            {banner.slot === 'main' ? 'Principale' : banner.slot === 'rightTop' ? 'Haut Droite' : 'Bas Droite'}
                                        </span>
                                        {banner.badge && (
                                            <span className="absolute top-2 right-2 bg-white text-black text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                                                {banner.badge}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="mb-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{banner.category_key}</span>
                                            <h3 className="font-bold text-gray-900 truncate">{banner.title || 'Sans titre'}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mb-4">{banner.description || '...'}</p>

                                        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => handleEdit(banner)}
                                                className="flex-1 flex items-center justify-center gap-1 text-sm bg-gray-50 border border-gray-200 py-1.5 rounded hover:bg-gray-100 text-gray-700 font-medium"
                                            >
                                                <Edit size={14} /> Modifier
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(banner.id)}
                                                className="flex items-center justify-center px-3 text-sm bg-white border border-red-200 text-red-600 rounded hover:bg-red-50"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Empty State for Filter/Search */}
                    {banners.length > 0 && (
                        (activeTab !== 'all' && banners.filter(b => (b.category_key || 'Autre') === activeTab).length === 0) ||
                        (searchTerm && banners.filter(b => (b.title || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0)
                    ) && (
                            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                {searchTerm ? (
                                    <p className="text-gray-500">Aucun résultat pour la recherche <span className="font-bold">"{searchTerm}"</span></p>
                                ) : (
                                    <>
                                        <p className="text-gray-500">Aucune bannière pour la catégorie <span className="font-bold">"{activeTab}"</span></p>
                                        <button
                                            onClick={() => {
                                                resetForm();
                                                setFormData(prev => ({ ...prev, category_key: activeTab }));
                                                setIsModalOpen(true);
                                            }}
                                            className="mt-4 text-black underline hover:no-underline font-medium"
                                        >
                                            Créer une bannière pour cette catégorie
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 md:p-4">
                    <div className="bg-white rounded-none md:rounded-2xl w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">

                        {/* LEFT: FORM */}
                        <div className={`flex-1 p-6 space-y-6 overflow-y-auto transition-all ${mobilePreviewOpen ? 'pb-[480px]' : 'pb-24'} md:pb-6`}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">
                                    {editingBanner ? 'Modifier la bannière' : 'Nouvelle bannière'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* PRODUCT SELECTOR */}
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">1. Choisir un Produit (Base)</label>
                                    <select
                                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                        value={formData.product_id}
                                        onChange={e => {
                                            const selectedId = e.target.value;
                                            const product = products.find(p => String(p.id) === String(selectedId));

                                            // Auto-populate
                                            if (product) {
                                                // 1. Image logic
                                                let img = product.image;
                                                if (!img && product.images && product.images.length > 0) img = product.images[0];

                                                // 2. Description logic (increase limit)
                                                let desc = product.description || '';
                                                if (desc.length > 150) desc = desc.substring(0, 150) + '...';

                                                // 3. Category logic
                                                // We try to match product.category.name with our categories list
                                                // If exact match found, we use it. 
                                                // Note: product.category might be an object {id, name} or just ID depending on API, but getProducts returns object.
                                                let catKey = formData.category_key;
                                                if (product.category && product.category.name) {
                                                    // Verify if this category exists in our banners "tabs" (which usually match site categories)
                                                    // But we can just set it, and if it's new it might show in a new tab or "Autre"
                                                    catKey = product.category.name;
                                                }

                                                setFormData({
                                                    ...formData,
                                                    product_id: product.id,
                                                    title: product.name,
                                                    description: desc,
                                                    image_url: img || formData.image_url,
                                                    category_key: catKey
                                                });
                                            } else {
                                                setFormData({ ...formData, product_id: '' });
                                            }
                                        }}
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* CATEGORY & SLOT */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Catégorie</label>
                                        <select
                                            className="w-full p-2 border rounded-lg"
                                            value={formData.category_key}
                                            onChange={e => setFormData({ ...formData, category_key: e.target.value })}
                                        >
                                            {/* Always show actual categories */}
                                            {categories.length === 0 && <option>Chargement...</option>}
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Position</label>
                                        <select
                                            className="w-full p-2 border rounded-lg"
                                            value={formData.slot}
                                            onChange={e => setFormData({ ...formData, slot: e.target.value })}
                                        >
                                            {slots.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* TEXT FIELDS (Title & Description) - MOVED HERE FOR VISIBILITY */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-gray-700">Titre affiché (Modifiable)</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-gray-700">Description affichée (Modifiable)</label>
                                        <textarea
                                            className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition"
                                            rows="3"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Description courte pour accrocher le client..."
                                        />
                                        <p className="text-xs text-gray-400 text-right">{formData.description.length}/150 caractères recommandés</p>
                                    </div>
                                </div>

                                {/* CUSTOMIZATION */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Palette size={16} /> Apparence (Couleur, Badge, Image)
                                    </h3>

                                    {/* COLOR PICKER */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Couleur de Fond</label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="color"
                                                value={formData.bg_color}
                                                onChange={e => setFormData({ ...formData, bg_color: e.target.value })}
                                                className="w-12 h-12 rounded cursor-pointer border-0 p-0 shadow-sm"
                                            />
                                            <span className="text-sm text-gray-500 font-mono">{formData.bg_color}</span>
                                        </div>
                                    </div>

                                    {/* BADGE SELECTOR */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Badge</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {predefinedBadges.map(b => (
                                                <button
                                                    key={b}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, badge: b })}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition ${formData.badge === b ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                                                >
                                                    {b}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Ou écrivez un badge personnalisé..."
                                            className="w-full p-2 border rounded-lg text-sm"
                                            value={formData.badge}
                                            onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Image Personnalisée (Optionnel)</label>
                                        <div className="flex items-center gap-2">
                                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition text-gray-700">
                                                <Upload size={16} /> Choisir un fichier
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                            <span className="text-xs text-gray-400">Remplace l'image du produit</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 shadow-lg hover:shadow-xl transition"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT: LIVE PREVIEW & BOTTOM SHEET MOBILE */}
                        <div
                            className={`
                                md:w-[380px] md:static md:bg-gray-50 md:p-8 md:border-l md:border-t-0 md:h-auto md:block
                                fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-gray-100 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                                ${mobilePreviewOpen ? 'h-[460px]' : 'h-14'}
                            `}
                        >
                            {/* MOBILE HANDLE BAR */}
                            <div
                                className="md:hidden w-full h-14 absolute top-0 left-0 flex items-center justify-center cursor-pointer active:bg-gray-50 rounded-t-3xl"
                                onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
                            >
                                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                                <span className={`absolute right-6 text-xs font-bold text-gray-400 transition-opacity ${mobilePreviewOpen ? 'opacity-0' : 'opacity-100'}`}>
                                    Voir l'aperçu
                                </span>
                            </div>

                            <div className="h-full pt-12 md:pt-0 px-6 md:px-0 md:sticky md:top-8 overflow-y-auto md:overflow-visible">
                                <div className="flex justify-between items-center mb-6 hidden md:flex">
                                    <h3 className="font-bold text-lg text-gray-900">Aperçu en direct</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex justify-center md:hidden mb-4 opacity-50">
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Aperçu en direct</span>
                                </div>

                                {/* PREVIEW CARD */}
                                <div
                                    className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-500 shadow-2xl skew-y-1 hover:skew-y-0`}
                                    style={{ backgroundColor: formData.bg_color }}
                                >
                                    <div className="relative z-10 flex flex-col h-full text-white">
                                        {formData.badge && (
                                            <span className="bg-white/90 text-black w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                                                {formData.badge}
                                            </span>
                                        )}

                                        <h2 className="text-2xl font-extrabold leading-tight mb-2 drop-shadow-md">
                                            {formData.title || 'Titre du produit'}
                                        </h2>

                                        <p className="text-sm opacity-90 line-clamp-2 mb-6">
                                            {formData.description || 'Description du produit...'}
                                        </p>

                                        <div className="mt-auto flex justify-center">
                                            {formData.image_url ? (
                                                <img
                                                    src={formData.image_url}
                                                    className="h-40 object-contain drop-shadow-2xl hover:scale-105 transition duration-700"
                                                    alt="Preview"
                                                />
                                            ) : (
                                                <div className="h-40 w-full flex items-center justify-center border-2 border-white/20 border-dashed rounded-xl">
                                                    <span className="text-white/50 text-sm">Pas d'image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-xs text-gray-400 mt-6 pb-20 md:pb-0">
                                    Ceci est un aperçu approximatif du rendu final sur la page d'accueil.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* CONFIRM MODAL SINGLE */}
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Supprimer la bannière ?"
                message="Cette action est irréversible."
                confirmText="Supprimer"
                isDestructive={true}
            />

            {/* CONFIRM MODAL ALL */}
            <ConfirmModal
                isOpen={confirmAll}
                onClose={() => setConfirmAll(false)}
                onConfirm={confirmDeleteAll}
                title="SUPPRIMER TOUTES LAS BANNIÈRES ?"
                message="Attention : Vous allez supprimer l'intégralité des bannières du site. Cela ne peut pas être annulé."
                confirmText="TOUT SUPPRIMER"
                isDestructive={true}
                verificationText="SUPPRIMER"
            />
        </div>
    );
};

export default Banners;
