import { useState, useEffect } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import AuthInput from "../components/AuthInput";
import LoadingButton from "../components/LoadingButton";
import AuthError from "../components/AuthError";
import OAuthButtons from "../components/OAuthButtons";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ REDIRECTION AUTOMATIQUE QUAND CONNECTÉ
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // ❌ pas de navigate ici
      // le useEffect(user) gère la redirection
    } catch (err) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold mb-1">
        Bon retour 👋
      </h1>
      <p className="text-gray-500 mb-6">
        Connectez-vous à votre compte
      </p>

      {/* OAUTH */}
      <OAuthButtons />

      <div className="my-6 text-center text-gray-400 text-sm">
        ou
      </div>

      {/* FORM */}
      <form onSubmit={handleLogin} className="space-y-4">
        <AuthError message={error} />

        <AuthInput
          icon={Mail}
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthInput
          icon={Lock}
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showToggle
          required
        />

        <LoadingButton loading={loading}>
          Se connecter
        </LoadingButton>
      </form>

      <p className="text-sm text-center mt-6">
        Pas encore de compte ?{" "}
        <Link
          to="/register"
          className="text-blue-500 font-medium hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
