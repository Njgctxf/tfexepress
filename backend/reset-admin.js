import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetAdmin() {
  const newEmail = "riootagameur@gmail.com";
  const newPassword = "Aa2004.com";

  console.log("--- RÉINITIALISATION ADMIN TFEXPRESS ---");

  try {
    const {
      data: { users },
      error: listError,
    } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = users.find((u) => u.email === newEmail);

    let userId;

    if (existingUser) {
      console.log(`✅ Utilisateur ${newEmail} trouvé. Mise à jour...`);
      const { data: updated, error: updateError } =
        await supabase.auth.admin.updateUserById(existingUser.id, {
          password: newPassword,
          email_confirm: true,
        });
      if (updateError) throw updateError;
      userId = existingUser.id;
    } else {
      console.log(`🆕 Création de l'admin ${newEmail}...`);
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: newEmail,
          password: newPassword,
          email_confirm: true,
        });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    console.log("🛡️ Vérification des droits admin...");
    // Essayer de forcer l'admin dans la table 'profiles'
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: newEmail,
        role: "admin",
        full_name: "Super Admin",
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.warn("⚠️ Note: Table profiles introuvable ou différente.", profileError.message);
    } else {
      console.log('✅ Profil admin forcé à "admin".');
    }

    console.log("\n✨ OPÉRATION TERMINÉE !");
    console.log(`Email : ${newEmail}`);
    console.log(`Mot de passe : ${newPassword}`);
  } catch (error) {
    console.error("❌ ERREUR :", error.message);
  }
}

resetAdmin();
