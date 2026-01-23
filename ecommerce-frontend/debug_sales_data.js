
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log("--- IMAGE SIZE AUDIT START ---");

    // Fetch just ID, Name and Images for all products
    // We need to iterate to find the big ones without crashing memory if possible
    // But 26 rows is small enough to fetch all.

    const { data: products, error } = await supabase.from('products').select('id, name, images');

    if (error) {
        console.error(error);
        return;
    }

    let maxLen = 0;
    let hugeCount = 0;
    let totalSize = 0;

    products.forEach(p => {
        if (Array.isArray(p.images)) {
            p.images.forEach((img, idx) => {
                const len = img ? img.length : 0;
                totalSize += len;
                if (len > maxLen) maxLen = len;
                if (len > 100000) { // > 100KB string
                    console.log(`[HUGE IMAGE] Product "${p.name}" (ID: ${p.id}) Image #${idx} size: ${(len / 1024).toFixed(2)} KB`);
                    hugeCount++;
                }
            });
        }
    });

    console.log(`\nMax Image String Length: ${maxLen} chars`);
    console.log(`Total Images Size (in JSON): ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Count of Huge Images (>100KB): ${hugeCount}`);

    console.log("--- IMAGE SIZE AUDIT END ---");
}

run();
