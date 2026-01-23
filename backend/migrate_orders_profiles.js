import { supabase } from "./config/supabase.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORDERS_PATH = path.join(__dirname, "data/orders.json");
const PROFILES_PATH = path.join(__dirname, "data/profiles.json");

/* 
  Orders Schema (Supabase):
  id (bigint), created_at, user_email, total, status, items (jsonb)
  
  JSON Orders: { id: "ord_123", user_email, items, total, status, created_at, ... }
  
  Strategy:
  - JSON IDs are strings. DB IDs are BigInt. 
  - We cannot keep "ord_123". We will Insert without ID and let DB generate new BigInt IDs.
  - We retain created_at to keep history order.
*/

async function migrateOrders() {
    if (!fs.existsSync(ORDERS_PATH)) return;
    console.log("Migrating orders...");

    const rawOrders = JSON.parse(fs.readFileSync(ORDERS_PATH, "utf8"));

    // Transform
    const ordersToInsert = rawOrders.map(o => ({
        // id: Let DB generate
        created_at: o.created_at || new Date().toISOString(),
        user_email: o.user_email,
        total: o.total,
        status: o.status || 'En cours',
        items: o.items || []
    }));

    if (ordersToInsert.length === 0) return;

    const { error } = await supabase.from("orders").insert(ordersToInsert);

    if (error) console.error("Error migrating orders:", error);
    else console.log(`Migrated ${ordersToInsert.length} orders.`);
}

/* 
  Profiles Schema:
  id (uuid, linked to auth?), email, full_name, etc.
  
  JSON Profiles: { id: "usr_123", email, ... }
  
  Strategy:
  - We match by Email. 
  - If a profile with that email exists in DB, update it.
  - If not, insert it (but ID is usually FK to Auth).
  - If Supabase 'profiles' table has NO Foreign Key constraint on ID, we can generate a random UUID or let it be if it's serial.
  - In 'update_dashboard_schema.sql', 'profiles' usually references 'auth.users'.
  - Creating a profile for a user that doesn't exist in Auth might fail if there's a constraint.
  - However, we will TRY to Upsert by Email.
*/

async function migrateProfiles() {
    if (!fs.existsSync(PROFILES_PATH)) return;
    console.log("Migrating profiles...");

    const rawProfiles = JSON.parse(fs.readFileSync(PROFILES_PATH, "utf8"));

    for (const p of rawProfiles) {
        if (!p.email) continue;

        // Prepare update payload
        const updateData = {
            full_name: p.full_name || p.name || "",
            phone: p.phone || "",
            address: p.address || "",
            city: p.city || "",
            loyalty_points: p.loyalty_points || 0,
            loyalty_tier: p.loyalty_tier || "Bronze"
        };

        // Try update first (assuming user might have logged in and created a bare row)
        const { data: existing } = await supabase.from("profiles").select("id").eq("email", p.email).single();

        if (existing) {
            await supabase.from("profiles").update(updateData).eq("email", p.email);
        } else {
            // If not exists, we can't easily insert if ID is strictly auth.uid().
            // We will skip creating orphan profiles to avoid Auth desync. 
            // User will get a new profile when they log in (handled by controller).
            console.log(`Skipping profile for ${p.email} (User not found in DB). Data will be refreshed on next edit.`);
        }
    }
    console.log("Profiles migration step complete.");
}

async function run() {
    await migrateOrders();
    await migrateProfiles();
}

run();
