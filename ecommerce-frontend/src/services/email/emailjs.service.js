import emailjs from '@emailjs/browser';

// Ces IDs doivent être configurés dans votre dashboard EmailJS (https://www.emailjs.com/)
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Envoie un email de confirmation de commande via EmailJS
 * @param {Object} order - L'objet commande complet
 */
export const sendOrderEmail = async (order) => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("⚠️ EmailJS n'est pas configuré. Email non envoyé.");
    return;
  }

  try {
    const { id, user_email, total, shipping_address, items } = order;

    // On prépare les données pour le template EmailJS
    const templateParams = {
      order_id: String(id).slice(0, 8),
      user_name: `${shipping_address.firstName} ${shipping_address.lastName}`,
      user_email: user_email,
      total_amount: `${total.toLocaleString()} FCFA`,
      delivery_address: `${shipping_address.address}, ${shipping_address.city}`,
      items_summary: items.map(item => `${item.name} (x${item.quantity})`).join(", "),
      reply_to: "contact@tfexpress.com" // Votre email de contact
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log('📧 Email envoyé avec succès !', response.status, response.text);
    return response;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};
