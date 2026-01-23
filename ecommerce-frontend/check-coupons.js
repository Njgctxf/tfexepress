
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listCoupons() {
    console.log("Fetching coupons...");
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) {
        console.error("Error fetching coupons:", error);
    } else {
        console.log("Coupons found:", data);
    }
}

listCoupons();
