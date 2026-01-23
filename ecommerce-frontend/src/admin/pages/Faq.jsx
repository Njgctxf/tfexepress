import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Search, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from '../../services/api/faqs.api';

const Faq = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        display_order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const data = await getAllFaqs();
            setFaqs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ question: '', answer: '', display_order: faqs.length + 1, is_active: true });
        setEditingFaq(null);
    };

    const handleEdit = (item) => {
        setEditingFaq(item);
        setFormData({
            question: item.question,
            answer: item.answer,
            display_order: item.display_order,
            is_active: item.is_active
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette question ?")) return;
        try {
            await deleteFaq(id);
            setFaqs(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFaq) {
                const updated = await updateFaq(editingFaq.id, formData);
                setFaqs(prev => prev.map(f => f.id === updated.id ? updated : f));
            } else {
                const created = await createFaq(formData);
                setFaqs(prev => [...prev, created].sort((a, b) => a.display_order - b.display_order));
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            alert("Erreur lors de l'enregistrement");
        }
    };

    const filteredFaqs = faqs.filter(f =>
        f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">FAQ / Aide</h1>
                    <p className="text-gray-500 text-sm">Gérez les questions fréquentes</p>
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
                        <Plus size={20} /> <span className="hidden md:inline">Nouvelle Question</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Chargement...</div>
            ) : (
                <div className="space-y-4">
                    {filteredFaqs.map(item => (
                        <div key={item.id} className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold shrink-0">
                                {item.display_order}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 truncate">{item.question}</h3>
                                    {!item.is_active && <span className="text-[10px] bg-red-100 text-red-600 px-2 rounded-full">Inactif</span>}
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 md:line-clamp-1">{item.answer}</p>
                            </div>

                            <div className="flex gap-2 shrink-0 self-end sm:self-center">
                                <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-100 rounded text-gray-600">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h2 className="text-xl font-bold">{editingFaq ? 'Modifier la question' : 'Nouvelle question'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Question</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Réponse</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
                                    value={formData.answer}
                                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ordre d'affichage</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none"
                                        value={formData.display_order}
                                        onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                                            checked={formData.is_active}
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium text-gray-700">Afficher sur le site</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-bold">Annuler</button>
                                <button type="submit" className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 shadow-xl">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Faq;
