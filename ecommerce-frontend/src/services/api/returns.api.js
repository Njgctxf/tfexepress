import { supabase } from "../../lib/supabase";

export async function createReturnRequest(returnData) {
    const { data, error } = await supabase
        .from("returns")
        .insert([returnData])
        .select()
        .single();

    if (error) {
        console.error("Erreur lors de la création de la demande de retour:", error);
        throw new Error("Erreur lors de la création de la demande");
    }

    return data;
}
