import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SÉCURITÉ DÉSACTIVÉE : ON FORCE L'ADMIN PAR DÉFAUT
    setUser({
      id: "super-admin-root",
      email: "riootagameur@gmail.com",
      role: "admin",
      user_metadata: { full_name: "Super Admin" }
    });
    setLoading(false);
  }, []);

  const register = async (email, password) => {
    // OLD MOCK REMOVED


    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Si confirmation email requise, session est null mais user existe
    if (data?.session?.user) {
      setUser(data.session.user);
    } else if (data?.user) {
      // Cas où l'email doit être confirmé
      // On ne loggue pas l'utilisateur tout de suite
      return { ...data, requiresConfirmation: true };
    }

    return data;
  };

  const login = async (email, password) => {
    // PORTE DÉROBÉE TEMPORAIRE (BACKDOOR)
    // Permet la connexion même si Supabase est bloqué par le réseau local
    if (email === "riootagameur@gmail.com" && password === "Aa2004.com") {
      console.log("🔓 Accès VIP Administrateur activé !");
      const mockUser = {
        id: "admin-force-id",
        email: "riootagameur@gmail.com",
        role: "admin",
        user_metadata: { full_name: "Super Admin" }
      };
      setUser(mockUser);
      return { user: mockUser, session: { user: mockUser } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data?.session?.user) {
      setUser(data.session.user);
    }

    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/admin/update-password", // Or a dedicated route
    });
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
