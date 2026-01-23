import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("login"); // 'login' or 'forgot'
    const [successMessage, setSuccessMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    // Reset states when switching views
    const switchView = (newView) => {
        setView(newView);
        setError(null);
        setSuccessMessage(null);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await resetPassword(email);
            setSuccessMessage("Un email de réinitialisation a été envoyé si le compte existe.");
        } catch (err) {
            setError(err.message || "Erreur lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await login(email, password);

            // Check if login was successful
            if (data?.user || data?.session?.user) {
                navigate("/admin");
            }
        } catch (err) {
            setError(err.message || "Échec de la connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-white font-sans text-gray-900 overflow-hidden">

            {/* LEFT COLUMN: FORM */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative z-10 w-full lg:w-1/2">
                <div className="w-full max-w-sm space-y-10">

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/20">
                            <ShieldCheck size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
                                {view === "login" ? "Administration" : "Réinitialisation"}
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium">
                                {view === "login"
                                    ? "Connectez-vous pour gérer TFExpress."
                                    : "Entrez votre email pour recevoir un lien."}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={view === "login" ? handleLogin : handleResetPassword} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                                <span className="mt-0.5 w-2 h-2 rounded-full bg-red-600 shrink-0" />
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-semibold border border-green-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                                <span className="mt-0.5 w-2 h-2 rounded-full bg-green-600 shrink-0" />
                                {successMessage}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent text-gray-900 font-medium rounded-2xl focus:bg-white focus:border-black focus:ring-0 transition-all placeholder:text-gray-400 sm:text-sm"
                                        placeholder="admin@tfexpress.com"
                                    />
                                </div>
                            </div>

                            {view === "login" && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Mot de passe</label>
                                        <button
                                            type="button"
                                            onClick={() => switchView("forgot")}
                                            className="text-xs font-bold text-gray-500 hover:text-black transition-colors"
                                        >
                                            Oublié ?
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent text-gray-900 font-medium rounded-2xl focus:bg-white focus:border-black focus:ring-0 transition-all placeholder:text-gray-400 sm:text-sm"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-black/10 text-base font-bold text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-800 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <span className="flex items-center gap-2">
                                    {view === "login" ? "Connexion sécurisée" : "Envoyer le lien"}
                                    <ArrowRight size={18} />
                                </span>
                            )}
                        </button>
                    </form>

                    {view === "forgot" && (
                        <div className="pt-4 text-center">
                            <button
                                onClick={() => switchView("login")}
                                className="text-sm font-bold text-gray-500 hover:text-black transition-colors"
                            >
                                Retour à la connexion
                            </button>
                        </div>
                    )}

                    {view === "login" && (
                        <div className="pt-8 border-t border-gray-100">
                            <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors flex items-center gap-2">
                                ← Retour au site public
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: VISUAL */}
            <div className="hidden lg:flex flex-1 relative bg-black overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black/80"></div>

                <div className="relative z-10 flex flex-col justify-between p-24 h-full text-white">
                    <div className="flex items-center gap-3 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md"></div>
                        <span className="font-bold tracking-widest text-sm">TFEXPRESS ADMIN V2.0</span>
                    </div>

                    <div className="space-y-8 max-w-lg">
                        <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
                            Gérez votre empire e-commerce avec style.
                        </h2>
                        <div className="space-y-4">
                            {[
                                "Tableau de bord temps réel",
                                "Gestion avancée des commandes",
                                "Contrôle total du catalogue",
                                "Analyses et rapports détaillés"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-gray-300 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={14} className="text-white" />
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 font-medium">
                        © 2024 TFExpress Inc. Tous droits réservés.
                    </div>
                </div>
            </div>
        </div>
    );
}
