import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
    return useContext(SiteSettingsContext);
};

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        siteName: "TFExpress",
        supportEmail: "contact@tfexpress.com",
        supportPhone: "",
        siteAddress: "",
        currency: "EUR",
        facebook: "",
        instagram: "",
        tiktok: "",
        youtube: "",
        twitter: "",
        linkedin: "",
        pinterest: "",
        snapchat: "",
        loading: true
    });

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'general')
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching general settings:", error);
                return;
            }

            if (data?.value) {
                setSettings(prev => ({
                    ...prev,
                    ...data.value,
                    loading: false
                }));
            } else {
                setSettings(prev => ({ ...prev, loading: false }));
            }
        } catch (err) {
            console.error("Unexpected error fetching settings:", err);
            setSettings(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchSettings();

        // Subscribe to changes
        const channel = supabase
            .channel('public:site_settings')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'site_settings', filter: 'key=eq.general' },
                (payload) => {
                    if (payload.new && payload.new.value) {
                        setSettings(prev => ({
                            ...prev,
                            ...payload.new.value
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <SiteSettingsContext.Provider value={settings}>
            {children}
        </SiteSettingsContext.Provider>
    );
};
