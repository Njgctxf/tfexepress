
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBanners() {
    console.log("Checking banners table...");
    const { data: banners, error } = await supabase
        .from('banners')
        .select('*')
        .limit(3);

    if (error) {
        console.error("Banners Error:", error.message);
    } else {
        console.log("Banners found:", banners.length, "sample items");
        if (banners.length > 0) console.log(banners[0]);
    }
}

checkBanners();

