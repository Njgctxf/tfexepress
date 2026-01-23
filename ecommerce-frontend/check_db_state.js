
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
    console.log("Checking brands table...");
    const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .limit(3);

    if (brandsError) {
        console.error("Brands Error:", brandsError.message);
    } else {
        console.log("Brands found:", brands.length, brands);
    }

    console.log("\nChecking products table schema...");
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('brand') // Try to select 'brand' explicitly
        .limit(1);

    if (prodError) {
        console.error("Products Schema Error (brand column might be missing):", prodError.message);
    } else {
        console.log("Products 'brand' column verified.");
    }
}

checkDB();

