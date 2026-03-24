import emailjs from '@emailjs/browser';

// Ces IDs doivent être configurés dans votre dashboard EmailJS (https://www.emailjs.com/)
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID; // Client
const ADMIN_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID; // Admin
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Envoie les emails de notification (Client et Admin) via EmailJS
 * @param {Object} order - L'objet commande complet
 */
export const sendOrderEmails = async (order) => {
  if (!SERVICE_ID || !PUBLIC_KEY) {
    console.warn("⚠️ EmailJS n'est pas configuré. Emails non envoyés.");
    return;
  }

  try {
    const { id, user_email, total, shipping_address, items, payment_method } = order;

    // Préparation des données communes
    const templateParams = {
      order_id: String(id).slice(0, 8),
      user_name: `${shipping_address.firstName} ${shipping_address.lastName}`,
      user_email: user_email,
      total_amount: `${total.toLocaleString()} FCFA`,
      delivery_address: `${shipping_address.address}, ${shipping_address.city}`,
      items_summary: items.map(item => `${item.name} (x${item.quantity})`).join(", "),
      payment_method: payment_method === 'cod' ? 'Paiement à la livraison' : 'Paiement en ligne',
      reply_to: "contact@tfexpress.com"
    };

    // 1. Envoyer au Client
    if (TEMPLATE_ID) {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log('📧 Email de confirmation envoyé au client.');
    }

    // 2. Envoyer à l'Administrateur
    if (ADMIN_TEMPLATE_ID) {
      // Pour l'admin, on peut ajouter plus de détails si besoin
      await emailjs.send(SERVICE_ID, ADMIN_TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log('🔔 Notification de nouvelle commande envoyée à l\'admin.');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Erreur EmailJS:', error);
    // On ne bloque pas le reste du site si l'email échoue
    return { success: false, error };
  }
};
