import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dqikchghdgdcfbgdrlro.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaWtjaGdoZGdkY2ZiZ2RybHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTEyMjEsImV4cCI6MjA4MzEyNzIxMX0.eU7qL-rWof3A85Cj8Q3fS9R_oH-b7U0Lq4L3V5H7s-I";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variables Supabase manquantes");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
