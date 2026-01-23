const API_URL = "http://localhost:5000/api/reviews";

/**
 * Récupère les avis d'un produit
 */
export async function getProductReviews(productId) {
    try {
        const res = await fetch(`${API_URL}/${productId}`);
        if (!res.ok) {
            // Si 404 ou autre, on renvoie tableau vide pour ne pas casser l'UI
            if (res.status === 404) return [];
            throw new Error("Failed to fetch reviews");
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("API Error (getReviews):", error);
        return [];
    }
}

/**
 * Ajoute un avis
 */
export async function addReview(reviewData) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData)
        });

        if (!res.ok) throw new Error("Failed to add review");
        return await res.json();
    } catch (error) {
        console.error("API Error (addReview):", error);
        throw error;
    }
}
