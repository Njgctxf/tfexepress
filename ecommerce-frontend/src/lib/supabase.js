import { createClient } from "@supabase/supabase-js";

// On utilise des valeurs par défaut pour éviter que l'application ne plante si les variables .env sont absentes
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseUrl = (rawUrl && rawUrl.startsWith("http")) ? rawUrl : "https://placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

