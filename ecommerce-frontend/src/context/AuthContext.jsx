import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("DEBUG: AuthProvider initializing...");

        // MOCK AUTH IF PLACEHOLDER
        if (!supabase.supabaseUrl || supabase.supabaseUrl.includes("placeholder")) {
          console.warn("DEBUG: Supabase URL might be invalid or placeholder. Checking session anyway.");
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("DEBUG: Supabase session error:", error.message);
        }
        setUser(data?.session?.user ?? null);
      } catch (err) {
        console.error("DEBUG: Auth initialization failed:", err);
      } finally {
        console.log("DEBUG: AuthProvider loading set to false");
        setLoading(false);
      }
    };

    initAuth();

    if (!supabase.supabaseUrl.includes("placeholder-project")) {
      const { data: authListener } =
        supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
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
    // OLD MOCK REMOVED


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
