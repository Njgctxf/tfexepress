import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  /* eslint-disable react-hooks/exhaustive-deps */
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  // Load favorites on mount or user change
  useEffect(() => {
    if (user) {
      // Load from Supabase
      fetchUserFavorites();
    } else {
      // Load from LocalStorage
      const saved = localStorage.getItem("favorites");
      if (saved) setFavorites(JSON.parse(saved));
      else setFavorites([]);
    }
  }, [user]);

  // Sync to LocalStorage only if guest
  useEffect(() => {
    if (!user) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites, user]);

  async function fetchUserFavorites() {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("product:products(*)") // Assuming relation
        .eq("user_id", user.id);

      if (error) throw error;

      // Flatten structure if needed, or mapped correctly
      // Data shape: [{ product: { id: 1, ... } }, ...]
      const formatted = data.map(item => item.product).filter(Boolean);
      setFavorites(formatted);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  }

  const toggleFavorite = async (product) => {
    const exists = favorites.find((p) => p.id === product.id);

    // Optimistic Update
    setFavorites((prev) => {
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, product];
    });

    if (user) {
      // Sync with Supabase
      try {
        if (exists) {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", product.id);
        } else {
          await supabase
            .from("favorites")
            .insert([{ user_id: user.id, product_id: product.id }]);
        }
      } catch (err) {
        console.error("Error syncing favorite:", err);
        // Rollback if needed (skipped for simplicity/ux speed)
      }
    }
  };

  const isFavorite = (id) => {
    return favorites.some((p) => p.id === id);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
