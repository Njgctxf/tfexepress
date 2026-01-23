import { supabase } from "../config/supabase.js";

/* ===== GET ALL PROFILES (ADMIN) ===== */
export async function getAllProfiles(req, res) {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*");

    if (error) throw error;
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

/* ===== GET MY PROFILE ===== */
export async function getMyProfile(req, res) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email requis" });

    // 1. Try to find profile
    let { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    // 2. If not found (or error PGRST116 for checks), create one
    if (!profile) {
      // Create new profile
      // Note: If 'profiles' table uses UUID for 'id' linked to auth.users, this insert might fail 
      // if we don't provide the valid UUID. 
      // But given we are in a migration context, we try to insert with email.
      const newProfile = {
        email,
        full_name: "",
        phone: "",
        address: "",
        city: "",
        loyalty_points: 0,
        loyalty_tier: "Bronze",
        created_at: new Date().toISOString()
      };

      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert([newProfile])
        .select()
        .single();

      if (insertError) {
        // If insert fails (likely due to missing user_id FK if table is strict), 
        // we might handle it. For now, we assume simple table or permissive RLS/Schema.
        throw insertError;
      }
      profile = created;
    }

    // Construct full_name for frontend consistency if missing
    if (profile && !profile.full_name && (profile.first_name || profile.last_name)) {
      profile.full_name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }

    // Split full_name into first/last for frontend separate inputs
    if (profile && profile.full_name && !profile.first_name && !profile.last_name) {
      const parts = profile.full_name.trim().split(' ');
      profile.first_name = parts[0];
      profile.last_name = parts.slice(1).join(' ') || "";
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

/* ===== UPDATE PROFILE ===== */
export async function updateProfile(req, res) {
  try {
    const { email } = req.body;
    const updates = req.body;
    // Sanitize updates
    const allowedFields = ["phone", "address", "city", "zip", "loyalty_points", "loyalty_tier"];
    const safeUpdates = {};

    // Check if we need to reconstruct full_name from first/last
    if (updates.first_name || updates.last_name) {
      const existingProfilePromise = supabase.from("profiles").select("full_name").eq("email", email).single();
      // We can optimize by just using what we have. 
      // Ideally we fetch current to merge, but let's assume if sent, we use it.
      // However, to keep it simple and robust:

      let firstName = updates.first_name || "";
      let lastName = updates.last_name || "";

      // If one is missing in updates, we might want to fetch existing, 
      // but typically the frontend form sends the whole state.
      // If the frontend sends empty strings, we respect that.

      safeUpdates.full_name = `${firstName} ${lastName}`.trim();
    } else if (updates.full_name) {
      safeUpdates.full_name = updates.full_name;
    }

    // copy other fields, EXCLUDING first_name/last_name as they don't exist in DB
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && !['first_name', 'last_name', 'full_name'].includes(key)) {
        safeUpdates[key] = updates[key];
      }
    });

    console.log("Updating profile for:", email, "Payload:", safeUpdates);

    // Try update
    const { data, error } = await supabase
      .from("profiles")
      .update(safeUpdates)
      .eq("email", email)
      .select()
      .single();

    if (error) {
      console.error("Supabase Update Error:", error);
      throw error;
    }

    // Construct full_name for response
    if (data && !data.full_name && (data.first_name || data.last_name)) {
      data.full_name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    }

    // Split full_name into first/last for frontend separate inputs
    if (data && data.full_name) {
      const parts = data.full_name.trim().split(' ');
      data.first_name = parts[0];
      data.last_name = parts.slice(1).join(' ') || "";
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour", error: error.message });
  }
}

/* ===== DELETE ACCOUNT ===== */
export async function deleteAccount(req, res) {
  try {
    const { user_id } = req.body; // Expecting Supabase Auth UUID

    if (!user_id) return res.status(400).json({ message: "User ID requis" });

    // 1. Delete from Auth (requires Service Role)
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id);

    if (authError) throw authError;

    // 2. Profile will likely cascade, or we can leave it for analytics
    res.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ message: "Erreur suppression compte", error: error.message });
  }
}
