import { API_URL } from "./config";

export async function createReturnRequest(returnData) {
    const res = await fetch(`${API_URL}/returns`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(returnData),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la création de la demande");
    }

    return res.json();
}
