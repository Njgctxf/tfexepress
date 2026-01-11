import { useState, useEffect } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import AuthInput from "../components/AuthInput";
import LoadingButton from "../components/LoadingButton";
import AuthError from "../components/AuthError";
import OAuthButtons from "../components/OAuthButtons";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ REDIRECTION AUTOMATIQUE APRÈS CRÉATION
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const res = await register(email, password);
      
      if (res?.requiresConfirmation) {
        setError("Compte créé ! Veuillez vérifier votre email pour confirmer.");
        setLoading(false); // Stop loading manually since no redirect
        return;
      }
      
      // Si on est là, l'utilisateur est connecté et le useEffect va rediriger
    } catch (err) {
      setError(err.message || "Erreur lors de la création du compte");
    } finally {
      if (!user) setLoading(false); // Only stop loading if we didn't log in (otherwise we want to show loading until redirect)
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold mb-1">
        Créer un compte
      </h1>
      <p className="text-gray-500 mb-6">
        Rejoignez <span className="font-semibold">TFExpress</span>
      </p>

      <OAuthButtons />

      <div className="my-6 text-center text-gray-400 text-sm">
        ou
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
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

        <AuthInput
          icon={Lock}
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <LoadingButton loading={loading}>
          Créer mon compte
        </LoadingButton>
      </form>

      <p className="text-sm text-center mt-6">
        Déjà un compte ?{" "}
        <Link
          to="/login"
          className="text-blue-500 font-medium hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
