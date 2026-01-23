import { supabase } from "../../lib/supabase";

export async function getFaqs() {
    try {
        const { data, error } = await supabase
            .from('faqs')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Error fetching FAQs:", err);
        return [];
    }
}

export async function getAllFaqs() {
    try {
        const { data, error } = await supabase
            .from('faqs')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Error fetching all FAQs:", err);
        return [];
    }
}

export async function createFaq(faq) {
    try {
        const { data, error } = await supabase
            .from('faqs')
            .insert([faq])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error creating FAQ:", err);
        throw err;
    }
}

export async function updateFaq(id, updates) {
    try {
        const { data, error } = await supabase
            .from('faqs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Error updating FAQ:", err);
        throw err;
    }
}

export async function deleteFaq(id) {
    try {
        const { error } = await supabase
            .from('faqs')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("Error deleting FAQ:", err);
        throw err;
    }
}
