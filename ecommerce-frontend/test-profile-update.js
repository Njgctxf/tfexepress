
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://dqikchghdgdcfbgdrlro.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaWtjaGdoZGdkY2ZiZ2RybHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTEyMjEsImV4cCI6MjA4MzEyNzIyMX0.re1Ztp_Ya-2ZNty2OF_VM9nOAofF7tw67lJ3v-U9-lw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    console.log("1. Fetching first profile...");
    const { data: profile, error: fetchError } = await supabase
        .from('admin_profiles')
        .select('*')
        .limit(1)
        .single();

    if (fetchError) {
        console.error("Fetch Error:", fetchError);
        return;
    }
    console.log("Current Profile found:", profile.first_name);

    const newName = "Test-" + Math.floor(Math.random() * 1000);
    console.log("2. Updating first name to:", newName);

    const { data: updated, error: updateError } = await supabase
        .from('admin_profiles')
        .update({ first_name: newName })
        .eq('id', profile.id)
        .select()
        .single();

    if (updateError) {
        console.error("Update Error (RLS?):", updateError);
        console.log("It seems RLS is blocking the update for anon/authenticated user.");
        return;
    }
    console.log("Update Success. New Data:", updated);

    // Revert
    // await supabase.from('admin_profiles').update({ ...profile }).eq('id', profile.id);
}

testUpdate();
