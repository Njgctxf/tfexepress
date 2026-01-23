
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
    // Check site_settings
    const { data: settings, error } = await supabase
        .from('site_settings')
        .select('*');

    if (error) {
        console.log("Site Settings Table: NOT FOUND or Error", error.message);
    } else {
        console.log("Site Settings Found:", settings.length, "rows");
        settings.forEach(s => console.log(` - Key: ${s.key}`));
    }

    // Check if categories table exists (to replace categories.js)
    const { data: cats, error: catError } = await supabase.from('categories').select('count');
    if (catError) console.log("Categories Table: NOT FOUND or Error");
    else console.log("Categories Table: EXISTS");
}

checkSettings();

