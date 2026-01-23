import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// --- CONFIGURATION ---
// IMPORTANT: User must add EMAIL_USER and EMAIL_PASS to .env
const transporter = nodemailer.createTransport({
  service: "gmail", // Or use 'host' and 'port' for other providers
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '',
  },
});

/* VERIFY TRANSPORTER */
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email Transporter Error:", error);
  } else {
    console.log("✅ Server is ready to take our messages");
  }
});

/**
 * Send Order Confirmation Email
 * @param {Object} order - The order object from Supabase
 */
export const sendOrderConfirmation = async (order) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ EMAIL_USER or EMAIL_PASS missing in .env. Email not sent.");
    return;
  }
  console.log(`[Email] Attempting to send confirmation to ${order.user_email}...`);

  const { id, items, total, shipping_address, payment_method } = order;

  // Build Items HTML
  const itemsHtml = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px;">
        <img src="${item.image || 'https://placehold.co/50'}" alt="${item.name}" width="50" style="border-radius: 5px;" />
      </td>
      <td style="padding: 10px;">
        <div style="font-weight: bold; color: #333;">${item.name}</div>
        <div style="font-size: 12px; color: #888;">${item.variant || 'Standard'}</div>
      </td>
      <td style="padding: 10px; text-align: center;">x${item.qty}</td>
      <td style="padding: 10px; text-align: right;">${(item.price * item.qty).toLocaleString()} F</td>
    </tr>
  `
    )
    .join("");

  const shipping = order.shipping_cost !== undefined ? order.shipping_cost : (payment_method === 'express' ? 3000 : 1500);
  const finalTotal = total; // Total from DB already includes shipping
  const subTotal = finalTotal - shipping;
  const date = new Date().toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // HTML Template
  const mailOptions = {
    from: `"TFExpress" <${process.env.EMAIL_USER}>`,
    to: order.user_email,
    bcc: process.env.EMAIL_USER, // Admin receives a copy
    subject: `Confirmation de commande #${String(id).slice(0, 8)} - TFExpress`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        
        <!-- HEADER -->
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">TFExpress</h1>
        </div>

        <!-- INTRO -->
        <div style="padding: 20px; text-align: center;">
          <h2 style="color: #000;">Merci pour votre commande !</h2>
          <p style="color: #555;">Bonjour <strong>${shipping_address.firstName}</strong>,</p>
          <p>Votre commande a bien été reçue et est en cours de traitement.</p>
          <p style="background-color: #f9f9f9; display: inline-block; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
            Commande #${String(id).slice(0, 8)}
          </p>
        </div>

        <!-- DETAILS -->
        <div style="padding: 20px;">
          <h3 style="border-bottom: 2px solid #000; padding-bottom: 10px;">Détails de la commande</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>

          <!-- TOTALS -->
          <div style="margin-top: 20px; text-align: right;">
             <p>Sous-total: <strong>${subTotal.toLocaleString()} F</strong></p>
             <p>Livraison: <strong>${shipping.toLocaleString()} F</strong></p>
             <h3 style="color: #000; font-size: 20px;">Total: ${finalTotal.toLocaleString()} FCFA</h3>
          </div>
        </div>

        <!-- SHIPPING INFO -->
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 10px; margin: 20px;">
          <h3 style="margin-top: 0;">📦 Adresse de livraison</h3>
          <p style="margin: 5px 0;">${shipping_address.firstName} ${shipping_address.lastName}</p>
          <p style="margin: 5px 0;">${shipping_address.address}</p>
          <p style="margin: 5px 0;">${shipping_address.city} - ${shipping_address.phone}</p>
        </div>

        <!-- FOOTER -->
        <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>Si vous avez des questions, répondez simplement à cet email.</p>
          <p>&copy; ${new Date().getFullYear()} TFExpress. Tous droits réservés.</p>
        </div>

      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email confirmation sent to ${order.user_email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

/**
 * Send Order Status Update Email
 * @param {Object} order - The order object
 */
export const sendOrderStatusUpdate = async (order) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  console.log(`[Email] Sending status update (${order.status}) to ${order.user_email}...`);

  const { id, status, tracking_number, tracking_url, shipping_address } = order;
  const firstName = shipping_address?.firstName || "Client";

  let statusMessage = "";
  let color = "#333";

  switch (status) {
    case "Expédié":
      statusMessage = "Votre commande est en route ! 🚚";
      color = "#2563eb"; // Blue
      break;
    case "Livré":
      statusMessage = "Votre commande a été livrée ! 🎉";
      color = "#16a34a"; // Green
      break;
    case "Annulé":
      statusMessage = "Votre commande a été annulée.";
      color = "#dc2626"; // Red
      break;
    default:
      statusMessage = `Le statut de votre commande est : ${status}`;
  }

  const mailOptions = {
    from: `"TFExpress" <${process.env.EMAIL_USER}>`,
    to: order.user_email,
    subject: `Mise à jour commande #${String(id).slice(0, 8)}: ${status} - TFExpress`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">TFExpress</h1>
        </div>

        <div style="padding: 20px; text-align: center;">
          <h2 style="color: ${color};">${statusMessage}</h2>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p>Nous vous informons d'une mise à jour concernant votre commande.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <p style="font-size: 18px; font-weight: bold; margin: 0;">Statut actuel : ${status}</p>
          </div>

          ${tracking_number ? `
            <div style="margin-top: 20px;">
              <p>📦 <strong>Numéro de suivi :</strong> ${tracking_number}</p>
              ${tracking_url ? `<a href="${tracking_url}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px;">Suivre mon colis</a>` : ''}
            </div>
          ` : ''}
        </div>

        <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>&copy; ${new Date().getFullYear()} TFExpress. Tous droits réservés.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Status Update Email sent to ${order.user_email}`);
  } catch (error) {
    console.error("❌ Error sending status email:", error);
  }
};

/**
 * Send Return Request Notification to Admin
 * @param {Object} data - Return data
 */
export const sendReturnRequestNotification = async ({ orderId, userName, userEmail, reason, type }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  console.log(`[Email] Sending return notification to Admin for Order #${orderId}...`);

  const mailOptions = {
    from: `"TFExpress System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to Admin
    subject: `⚠️ Nouvelle demande de ${type} - #${String(orderId).slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #dc2626;">Nouvelle demande de ${type}</h2>
        <p>Un client vient de demander un ${type} pour sa commande.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Commande :</strong> #${orderId}</p>
          <p><strong>Client :</strong> ${userName || 'Inconnu'} (${userEmail || 'N/A'})</p>
          <p><strong>Motif :</strong></p>
          <blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 10px; color: #555;">
            ${reason}
          </blockquote>
        </div>

        <p><a href="http://localhost:5173/admin/returns" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Gérer dans l'Admin</a></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Return Notification sent to Admin`);
  } catch (error) {
    console.error("❌ Error sending return notification:", error);
  }
};
