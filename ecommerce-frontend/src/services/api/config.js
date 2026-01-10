// Configuration de l'URL de l'API backend
export const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// URL de base pour les uploads
export const UPLOADS_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5000";

