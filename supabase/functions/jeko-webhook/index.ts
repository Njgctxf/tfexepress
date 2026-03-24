import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-jeko-signature')
    const webhookSecret = Deno.env.get('JEKO_WEBHOOK_SECRET')

    // Vérifier la signature du webhook
    const payload = await req.text()
    
    if (webhookSecret) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
      );
      
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(payload)
      );
      
      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      // Jeko signature might be prefixed or just raw hex. Usually raw hex.
      // Compare securely.
      if (signature !== computedSignature) {
        console.error("Invalid signature:", signature, "Expected:", computedSignature);
        throw new Error("Invalid webhook signature");
      }
    } else {
      console.warn("JEKO_WEBHOOK_SECRET is not set, skipping signature verification.");
    }

    const event = JSON.parse(payload)

    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Accepter plusieurs formats de succès potentiels
    if (event.type === 'payment.succeeded' || event.status === 'SUCCESS' || event.status === 'successful') {
      // Jeko utilise souvent 'reference' pour stocker notre Order ID
      const orderId = event.data?.reference || event.data?.order_id || event.reference;
      const paymentId = event.data?.id || event.id;

      // Mettre à jour la commande dans Supabase
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'Payé',
          payment_id: paymentId,
          metadata: {
            ...event.data,
            paid_at: new Date().toISOString(),
          },
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating order:', updateError)
        throw updateError
      }

      console.log(`Order ${orderId} marked as paid`)

      // --- ENVOI DES NOTIFICATIONS EMAILJS ---
      try {
        console.log("📨 Configuration des notifications emails...");
        
        // 1. Récupérer les articles pour l'email
        const { data: items } = await supabase
          .from('order_items')
          .select('name, quantity')
          .eq('order_id', orderId);

        const itemsSummary = items?.map((i: any) => `${i.name} (x${i.quantity})`).join(", ") || "Détails indisponibles";

        // Paramètres communs
        const templateParams = {
          order_id: String(orderId).slice(0, 8),
          user_name: updatedOrder.shipping_address?.firstName + " " + updatedOrder.shipping_address?.lastName,
          user_email: updatedOrder.user_email,
          total_amount: `${updatedOrder.total?.toLocaleString()} FCFA`,
          delivery_address: `${updatedOrder.shipping_address?.address}, ${updatedOrder.shipping_address?.city}`,
          items_summary: itemsSummary,
          payment_method: 'Paiement en ligne (Confirmé)',
          reply_to: "contact@tfexpress.com"
        };

        const serviceId = Deno.env.get('EMAILJS_SERVICE_ID') || "service_jq1iouj";
        const publicKey = Deno.env.get('EMAILJS_PUBLIC_KEY') || "WIpC2OpUrjJmjTM0N";
        const clientTemplateId = Deno.env.get('EMAILJS_TEMPLATE_ID') || "template_f3vpif6";
        const adminTemplateId = Deno.env.get('EMAILJS_ADMIN_TEMPLATE_ID') || "template_96y4d1o";

        // Fonction helper pour envoyer via l'API EmailJS
        const sendEmail = async (templateId: string) => {
          return await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: serviceId,
              template_id: templateId,
              user_id: publicKey,
              template_params: templateParams
            })
          });
        };

        // Envoi au client
        const clientRes = await sendEmail(clientTemplateId);
        if (clientRes.ok) console.log("✅ Email de confirmation envoyé au client.");
        
        // Envoi à l'admin
        const adminRes = await sendEmail(adminTemplateId);
        if (adminRes.ok) console.log("✅ Notification envoyée à l'administrateur.");

      } catch (emailErr) {
        console.error("❌ Erreur lors du processus EmailJS:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
