import { useState, useEffect } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import AuthInput from "../components/AuthInput";
import LoadingButton from "../components/LoadingButton";
import AuthError from "../components/AuthError";
import OAuthButtons from "../components/OAuthButtons";
import { useAuth } from "../context/AuthContext";
import { useLocalization } from "../context/LocalizationContext";

const Login = () => {
  const { login, user } = useAuth();
  const { t } = useLocalization();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold mb-1">
        {t('login_title')}
      </h1>
      <p className="text-gray-500 mb-6">
        {t('login_subtitle')}
      </p>

      <OAuthButtons />

      <div className="my-6 text-center text-gray-400 text-sm">
        ou
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <AuthError message={error} />

        <AuthInput
          icon={Mail}
          type="email"
          placeholder={t('email_label')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthInput
          icon={Lock}
          type="password"
          placeholder={t('password_label')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showToggle
          required
        />

        <LoadingButton loading={loading}>
          {t('login_button')}
        </LoadingButton>
      </form>

      <p className="text-sm text-center mt-6">
        {t('no_account')}{" "}
        <Link
          to="/register"
          className="text-orange-500 font-medium hover:underline"
        >
          {t('create_account')}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
