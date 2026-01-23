import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Search, Check } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api/categories.api';
import { iconMap, iconList, iconTags } from '../../config/iconRegistry';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [iconSearch, setIconSearch] = useState('');
    const [deleteId, setDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon_key: 'Grid',
        is_active: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', icon_key: 'Grid', is_active: true });
        setEditingCategory(null);
        setIconSearch('');
    };

    const handleEdit = (cat) => {
        setEditingCategory(cat);
        setFormData({
            name: cat.name,
            slug: cat.slug || '',
            icon_key: cat.icon_key || 'Grid',
            is_active: cat.is_active
        });
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteCategory(deleteId);
            setCategories(prev => prev.filter(c => c.id !== deleteId));
            setDeleteId(null);
            toast.success("Catégorie supprimée");
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                const updated = await updateCategory(editingCategory.id, formData);
                setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
            } else {
                const created = await createCategory(formData);
                setCategories(prev => [...prev, created]);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Erreur: " + (error.message || "Impossible d'enregistrer"));
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.slug && c.slug.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredIcons = iconList.filter(iconName => {
        const lowerSearch = iconSearch.toLowerCase();
        const tags = iconTags[iconName] || "";
        // Match name OR tags (keywords)
        return iconName.toLowerCase().includes(lowerSearch) || tags.includes(lowerSearch);
    });

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
                    <p className="text-gray-500 text-sm">Gérez les catégories et leurs apparences</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 whitespace-nowrap"
                    >
                        <Plus size={20} /> <span className="hidden md:inline">Nouvelle</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredCategories.map(cat => {
                        const Icon = iconMap[cat.icon_key] || iconMap.Grid;
                        return (
                            <div key={cat.id} className="bg-white border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition group">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 group-hover:bg-black group-hover:text-white transition-colors">
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{cat.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">/{cat.slug}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-gray-100 rounded text-gray-600">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => setDeleteId(cat.id)} className="p-2 hover:bg-red-50 rounded text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h2 className="text-xl font-bold">{editingCategory ? 'Modifier' : 'Nouvelle Catégorie'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Slug (URL)</label>
                                    <input
                                        type="text"
                                        placeholder="laisser vide pour auto-générer"
                                        className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* ICON PICKER */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Choisir une Icône</label>
                                <div className="border rounded-xl p-4 bg-gray-50">
                                    <div className="mb-4 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Rechercher une icône (ex: Smart, Home, Car...)"
                                            className="w-full pl-9 p-2 border rounded-lg text-sm outline-none"
                                            value={iconSearch}
                                            onChange={e => setIconSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1">
                                        {filteredIcons.map(iconName => {
                                            const Icon = iconMap[iconName];
                                            if (!Icon) return null; // Safety check
                                            const isSelected = formData.icon_key === iconName;
                                            return (
                                                <button
                                                    key={iconName}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon_key: iconName })}
                                                    className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition ${isSelected ? 'bg-black text-white border-black scale-110 shadow-lg' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-black'
                                                        }`}
                                                    title={iconName}
                                                >
                                                    <Icon size={20} />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <p className="text-right text-xs text-gray-400 mt-2">Icône sélectionnée: <span className="font-bold text-black">{formData.icon_key}</span></p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-bold">Annuler</button>
                                <button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 shadow-xl">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
            {/* CONFIRM MODAL */}
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Supprimer la catégorie ?"
                message="Cette action est irréversible."
                confirmText="Supprimer"
                isDestructive={true}
            />
        </div >
    );
};

export default Categories;
