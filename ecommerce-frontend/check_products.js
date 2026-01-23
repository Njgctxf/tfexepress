
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listProducts() {
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, category')
        .limit(10);

    if (error) console.error(error);
    else console.log("Actual Products:", products);
}

listProducts();

