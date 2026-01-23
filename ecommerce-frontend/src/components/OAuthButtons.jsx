import { supabase } from "../lib/supabase";
import { FaGoogle, FaApple, FaFacebookF } from "react-icons/fa";

const OAuthButtons = () => {
  const loginWith = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* GOOGLE */}
      <button
        onClick={() => loginWith("google")}
        className="w-full flex items-center justify-center gap-3 border rounded-xl py-3 hover:bg-gray-50 transition"
      >
        <FaGoogle className="text-red-500" />
        <span className="text-sm font-medium">
          Continuer avec Google
        </span>
      </button>

    </div>
  );
};

export default OAuthButtons;
