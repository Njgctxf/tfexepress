import { API_URL } from "./config";

export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_URL}/stats/dashboard`);
    if (!response.ok) {
        throw new Error("Erreur réseau");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};
