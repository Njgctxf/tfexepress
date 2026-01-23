
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars. Run with 'node --env-file=.env debug-orders.js'");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
    // Check specific older order #26
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            items:order_items(*)
        `)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (orders && orders.length > 0) {
        const latest = orders[0];
        console.log(`Latest Order ID: ${latest.id}`);
        console.log(`Total: ${latest.total}`);
        console.log(`Items Found: ${latest.items?.length || 0}`);
        if (latest.items?.length > 0) {
            console.log("First Item:", latest.items[0]);
        } else {
            console.log("⚠️ No items found for this order! Checking unlinked items...");
            // Check if items exist but are not linked?
            const { data: looseItems } = await supabase.from('order_items').select('*').limit(5);
            console.log("Sample of ANY order_items in DB:", looseItems);
        }
    } else {
        console.log("No orders found.");
    }
    return;

}

checkOrders();
