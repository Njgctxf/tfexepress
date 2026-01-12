import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/profiles.json");

/* ===== GET ALL PROFILES (ADMIN) ===== */
export async function getAllProfiles(req, res) {
  try {
    if (!fs.existsSync(DATA_PATH)) {
        return res.json([]);
    }
    const profiles = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
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

    if (!fs.existsSync(DATA_PATH)) {
        fs.writeFileSync(DATA_PATH, JSON.stringify([]));
    }
    const profiles = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    
    let profile = profiles.find(p => p.email === email);
    
    // Create lazy profile if not exists
    if (!profile) {
        profile = {
            id: `usr_${Date.now()}`,
            email,
            full_name: "",
            phone: "",
            address: "",
            city: "",
            loyalty_points: 0,
            loyalty_tier: "Bronze",
            created_at: new Date().toISOString()
        };
        profiles.push(profile);
        fs.writeFileSync(DATA_PATH, JSON.stringify(profiles, null, 2));
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

/* ===== UPDATE PROFILE ===== */
export async function updateProfile(req, res) {
  try {
    const { email } = req.body; // Identity by email since Auth is external
    const updates = req.body;

    if (!email) return res.status(400).json({ message: "Email requis" });

    const profiles = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    const index = profiles.findIndex(p => p.email === email);

    if (index === -1) {
        // Create
        const newProfile = {
            id: `usr_${Date.now()}`,
            created_at: new Date().toISOString(),
            loyalty_points: 0,
            loyalty_tier: "Bronze",
            ...updates
        };
        profiles.push(newProfile);
        fs.writeFileSync(DATA_PATH, JSON.stringify(profiles, null, 2));
        return res.json(newProfile);
    }

    // Update
    profiles[index] = { ...profiles[index], ...updates };
    fs.writeFileSync(DATA_PATH, JSON.stringify(profiles, null, 2));
    
    res.json(profiles[index]);
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour" });
  }
}
