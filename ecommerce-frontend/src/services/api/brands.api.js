import { supabase } from "../../lib/supabase";

export async function getBrands() {
    try {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('is_featured', { ascending: false }) // Featured first
            .order('name', { ascending: true }); // Then alphabetical

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Error fetching brands:", err);
        return [];
    }
}

export async function createBrand(brand) {
    try {
        const { data, error } = await supabase
            .from('brands')
            .insert([brand])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error creating brand:", err);
        throw err;
    }
}

export async function updateBrand(id, updates) {
    try {
        const { data, error } = await supabase
            .from('brands')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error updating brand:", err);
        throw err;
    }
}

export async function deleteBrand(id) {
    try {
        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("Error deleting brand:", err);
        throw err;
    }
}
