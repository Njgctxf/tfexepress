import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const AdminUIContext = createContext();

export function AdminUIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@tfexpress.com",
    role: "Super Admin",
    avatar: null,
    loading: true
  });

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from("admin_profiles")
          .select("*")
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        console.log("Profile fetched:", data, error);

        if (error) {
          console.warn("No admin profile found, using defaults.", error);
          setAdminProfile(prev => ({ ...prev, loading: false }));
        } else if (data) {
          setAdminProfile(prev => ({
            ...prev,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            role: data.role,
            avatar: data.avatar,
            id: data.id,
            loading: false
          }));
        } else {
          setAdminProfile(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
        setAdminProfile(prev => ({ ...prev, loading: false }));
      }
    }
    fetchProfile();
  }, []);

  // Function to update profile in DB and State
  const updateAdminProfile = async (newProfileData) => {
    // Optimistic UI update
    setAdminProfile(prev => ({ ...prev, ...newProfileData }));

    try {
      // Map frontend keys to DB snake_case columns
      // Build payload dynamically to allow partial updates
      const dbPayload = {};
      if (newProfileData.firstName !== undefined) dbPayload.first_name = newProfileData.firstName;
      if (newProfileData.lastName !== undefined) dbPayload.last_name = newProfileData.lastName;
      if (newProfileData.email !== undefined) dbPayload.email = newProfileData.email;
      if (newProfileData.avatar !== undefined) dbPayload.avatar = newProfileData.avatar;
      if (newProfileData.role !== undefined) dbPayload.role = newProfileData.role;

      console.log("Updating profile with payload:", dbPayload);

      // If we have an ID, update specific row. Else, upsert might create new if no ID.
      // Ideally we rely on the single row fetch logic or user auth, but here we assume single admin row or update by ID if present.
      let query = supabase.from("admin_profiles");

      // CASE 1: We know the ID -> Update
      if (adminProfile.id) {
        const { error } = await query.update(dbPayload).eq('id', adminProfile.id);
        if (error) throw error;
      }
      // CASE 2: No ID (Profile deleted or new) -> Insert
      else {
        // Also add email from auth if possible, or fallback to payload
        const { data: { user } } = await supabase.auth.getUser();
        const insertPayload = {
          ...dbPayload,
          email: dbPayload.email || user?.email || "admin@tfexpress.com",
          role: "Super Admin", // Default role
          id: user?.id // Try to link to Auth ID if possible
        };

        const { data, error } = await supabase.from("admin_profiles").insert([insertPayload]).select().single();

        if (error) throw error;

        if (data) {
          setAdminProfile(prev => ({ ...prev, id: data.id }));
        }
      }

    } catch (err) {
      console.error("Error updating admin profile:", err);
      alert("Erreur lors de la sauvegarde : " + (err.message || JSON.stringify(err)));
    }
  };

  // Function to update Supabase Auth (Email, Password)
  const updateUserAuth = async (updates) => {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  };

  /* --- SITE SETTINGS LOGIC --- */
  const [siteSettings, setSiteSettings] = useState({
    general: { siteName: "TFExpress", currency: "EUR", supportEmail: "" },
    shipping: { standard: 1000, freeThreshold: 50000 },
    payments: { stripeEnabled: false, paypalEnabled: false },
    loading: true
  });

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (data) {
        const newSettings = { ...siteSettings, loading: false };
        data.forEach(item => {
          if (item.key && item.value) {
            newSettings[item.key] = item.value;
          }
        });
        setSiteSettings(newSettings);
      } else {
        setSiteSettings(prev => ({ ...prev, loading: false }));
      }
    }
    fetchSettings();
  }, []);

  const updateSiteSettings = async (key, newValue) => {
    // 1. Optimistic Update
    setSiteSettings(prev => ({ ...prev, [key]: newValue }));

    // 2. Persist to DB
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value: newValue }, { onConflict: 'key' });

    if (error) {
      console.error("Error saving settings:", error);
      alert("Erreur sauvegarde configuration : " + error.message);
    }
  };

  return (
    <AdminUIContext.Provider value={{
      sidebarOpen, setSidebarOpen,
      adminProfile, setAdminProfile, updateAdminProfile, updateUserAuth,
      siteSettings, updateSiteSettings
    }}>
      {children}
    </AdminUIContext.Provider>
  );
}

export function useAdminUI() {
  return useContext(AdminUIContext);
}
