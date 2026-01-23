import { supabase } from "../../lib/supabase";

export async function getBanners() {
    try {
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .eq('is_active', true)
            .order('id', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Error fetching banners:", err);
        return [];
    }
}

export async function createBanner(banner) {
    try {
        // Sanitize payload
        const payload = {
            ...banner,
            product_id: banner.product_id || null, // Convert '' to null
            link: banner.link || null
        };

        const { data, error } = await supabase
            .from('banners')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error creating banner:", err);
        throw err;
    }
}

export async function updateBanner(id, updates) {
    try {
        // Sanitize payload
        const payload = {
            ...updates,
            product_id: updates.product_id || null,
            link: updates.link || null
        };

        const { data, error } = await supabase
            .from('banners')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error updating banner:", err);
        throw err;
    }
}

export async function deleteBanner(id) {
    try {
        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("Error deleting banner:", err);
        throw err;
    }
}

export async function deleteAllBanners() {
    try {
        // Delete all rows where id is not null (which is all rows)
        const { error } = await supabase
            .from('banners')
            .delete()
            .neq('id', 0);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("Error deleting all banners:", err);
        throw err;
    }
}
