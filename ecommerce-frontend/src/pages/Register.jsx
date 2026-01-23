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

const Register = () => {
  const { register, user } = useAuth();
  const { t } = useLocalization();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError(t('passwords_dont_match'));
      return;
    }

    setLoading(true);

    try {
      const res = await register(email, password);
      
      if (res?.requiresConfirmation) {
        setError(t('account_created_check_email'));
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la création du compte");
    } finally {
      if (!user) setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold mb-1">
        {t('register_title')}
      </h1>
      <p className="text-gray-500 mb-6">
        {t('register_subtitle')} <span className="font-semibold">TFExpress</span>
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

        <AuthInput
          icon={Lock}
          type="password"
          placeholder={t('confirm_password')}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <LoadingButton loading={loading}>
          {t('create_account_button')}
        </LoadingButton>
      </form>

      <p className="text-sm text-center mt-6">
        {t('already_account')}{" "}
        <Link
          to="/login"
          className="text-orange-500 font-medium hover:underline"
        >
          {t('log_in')}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
