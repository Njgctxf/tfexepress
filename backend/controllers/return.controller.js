import { supabase } from "../config/supabase.js";
import { sendReturnRequestNotification } from "../services/email.service.js";

export async function createReturnRequest(req, res) {
    try {
        const { order_id, user_id, reason } = req.body;

        // 1. Insert Return
        const { data: newReturn, error } = await supabase
            .from("returns")
            .insert([{ order_id, user_id, reason, status: "En attente" }])
            .select()
            .single();

        if (error) throw error;

        // 2. Fetch User/Order Details for Email
        // Fetch profile to get name/email
        const { data: userProfile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", user_id)
            .single();

        // Fetch order to check status (Return vs Cancel)
        const { data: order } = await supabase
            .from("orders")
            .select("status")
            .eq("id", order_id)
            .single();

        // If order is Delivered -> "Retour", else "Annulation"
        const type = order?.status === 'Livré' ? 'Retour' : 'Annulation';

        // 3. Send Admin Email (Fire and forget)
        sendReturnRequestNotification({
            orderId: order_id,
            userName: userProfile?.full_name || "Client",
            userEmail: userProfile?.email || "Email inconnu",
            reason,
            type
        }).catch(err => console.error("Email notification error:", err));

        res.status(201).json(newReturn);

    } catch (err) {
        console.error("Create Return Error:", err);
        res.status(500).json({ message: "Erreur création retour", error: err.message });
    }
}
