
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkProductsSchema() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error("Error fetching products:", error);
  } else {
    console.log("Product columns:", Object.keys(data[0] || {}));
  }
}

checkProductsSchema();
