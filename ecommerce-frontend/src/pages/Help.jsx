import React, { useState, useEffect } from "react";
import { getFaqs } from "../services/api/faqs.api";
import MainLayout from "../layout/MainLayout";
import { useSiteSettings } from "../context/SiteSettingsContext";
import {
    Search, Truck, RotateCcw, CreditCard, User,
    ChevronDown, ChevronUp, Mail, MessageCircle, ArrowRight
} from "lucide-react";

const Help = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFaq, setOpenFaq] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { supportEmail, supportPhone } = useSiteSettings();

    useEffect(() => {
        getFaqs()
            .then(setFaqs)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleFaq = (idx) => {
        setOpenFaq(openFaq === idx ? null : idx);
    };

    const handleQuickLink = (linkType) => {
        if (linkType === 'account') {
            window.location.href = '/dashboard';
            return;
        }
        const terms = {
            'shipping': 'livra',
            'returns': 'retour',
            'payment': 'paie'
        };
        setSearchTerm(terms[linkType] || "");
        // Scroll to FAQ section
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="bg-white min-h-screen pb-20 font-sans">

                {/* HERO HEADER */}
                <div className="relative bg-black text-white py-24 px-4 overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative max-w-4xl mx-auto text-center space-y-8">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                            Comment pouvons-nous <br className="hidden md:block" /> vous aider ?
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Recherchez une réponse ou explorez nos guides ci-dessous.
                        </p>

                        <div className="relative max-w-2xl mx-auto mt-8">
                            <input
                                type="text"
                                placeholder="Rechercher (ex: livraison, retour, paiement)..."
                                className="w-full pl-14 pr-6 py-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:bg-white focus:text-black focus:ring-4 focus:ring-white/20 transition-all text-lg shadow-2xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={24} />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 lg:px-6 -mt-10 relative z-10 space-y-24">

                    {/* QUICK LINKS GRID */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <button onClick={() => handleQuickLink('shipping')} className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center gap-6 border border-gray-100">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <Truck size={32} />
                            </div>
                            <div>
                                <span className="block text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Livraison</span>
                                <span className="text-sm text-gray-500 mt-1 block">Suivi & Délais</span>
                            </div>
                        </button>

                        <button onClick={() => handleQuickLink('returns')} className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center gap-6 border border-gray-100">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                                <RotateCcw size={32} />
                            </div>
                            <div>
                                <span className="block text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">Retours</span>
                                <span className="text-sm text-gray-500 mt-1 block">Remboursements</span>
                            </div>
                        </button>

                        <button onClick={() => handleQuickLink('payment')} className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center gap-6 border border-gray-100">
                            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                <CreditCard size={32} />
                            </div>
                            <div>
                                <span className="block text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">Paiement</span>
                                <span className="text-sm text-gray-500 mt-1 block">Sécurisé & Mobile</span>
                            </div>
                        </button>

                        <button onClick={() => handleQuickLink('account')} className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center gap-6 border border-gray-100">
                            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                <User size={32} />
                            </div>
                            <div>
                                <span className="block text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Mon Compte</span>
                                <span className="text-sm text-gray-500 mt-1 block">Commandes & Infos</span>
                            </div>
                        </button>
                    </div>

                    {/* FAQ SECTION */}
                    <div id="faq-section" className="max-w-4xl mx-auto pb-20">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Questions Fréquentes</h2>
                            <p className="text-gray-500">Les réponses aux questions les plus posées par nos clients.</p>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredFaqs.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 font-medium">Aucun résultat trouvé pour "{searchTerm}"</p>
                                        <button onClick={() => setSearchTerm('')} className="mt-2 text-black underline text-sm font-bold">Voir tout</button>
                                    </div>
                                ) : (
                                    filteredFaqs.map((faq, idx) => {
                                        const isOpen = openFaq === idx;
                                        return (
                                            <div
                                                key={faq.id}
                                                className={`group rounded-2xl transition-all duration-300 border ${isOpen ? 'bg-white shadow-xl ring-1 ring-black border-transparent' : 'bg-gray-50 border-transparent hover:bg-white hover:shadow-md'}`}
                                            >
                                                <button
                                                    onClick={() => toggleFaq(idx)}
                                                    className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                                                >
                                                    <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-black' : 'text-gray-700 group-hover:text-black'}`}>
                                                        {faq.question}
                                                    </span>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-black text-white rotate-180' : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'}`}>
                                                        <ChevronDown size={18} />
                                                    </div>
                                                </button>
                                                <div
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                                                >
                                                    <div className="px-6 md:px-8 pb-8 text-gray-600 leading-relaxed text-lg border-t border-gray-100 pt-6">
                                                        {faq.answer}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <p className="text-gray-400 text-sm">Vous ne trouvez pas votre réponse ?</p>
                        </div>
                    </div>

                    {/* CONTACT SECTION */}
                    <div className="bg-black text-white rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden mb-12 shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter">Besoin d'aide supplémentaire ?</h2>
                            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
                                Notre équipe de support dédiée est disponible 7j/7 de 8h à 20h pour vous accompagner.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <a
                                    href={`mailto:${supportEmail}`}
                                    className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                                >
                                    <Mail size={20} /> Envoyer un email
                                </a>
                                <a
                                    href={`https://wa.me/${supportPhone?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto bg-green-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-green-400 transition-colors shadow-lg shadow-green-500/30"
                                >
                                    <MessageCircle size={20} /> WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
};

export default Help;
