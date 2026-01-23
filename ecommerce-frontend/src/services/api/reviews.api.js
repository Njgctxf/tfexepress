import { supabase } from "../../lib/supabase";

/**
 * Récupère les avis d'un produit
 */
export async function getProductReviews(productId) {
    try {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("product_id", productId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
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
        const { data, error } = await supabase
            .from("reviews")
            .insert([reviewData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("API Error (addReview):", error);
        throw error;
    }
}
