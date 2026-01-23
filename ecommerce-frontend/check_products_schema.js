
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) { process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    // Just get one row to see cols
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) console.error(error);
    else if (data.length > 0) console.log("Product keys:", Object.keys(data[0]));
    else console.log("Product table is empty.");

    const { data: all } = await supabase.from('products').select('id, name').limit(5);
    console.log("Sample Products:", all);
}

checkSchema();

