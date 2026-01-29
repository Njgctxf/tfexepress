import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, amount, customerEmail } = await req.json()

    // Initialiser Jeko
    // TODO: REMETTRE LES VARIABLES D'ENVIRONNEMENT APRÈS LE TEST
    const jekoApiKey = "jeko_48bb71b5493073e34ad58442f3f13fc8c85119207509f8cbf49e5752c0546ac1";
    const jekoKeyId = "1d5be1ce-0dc9-47ea-8216-b9e7773b3472";
    const jekoStoreId = "Tfexpress"; // Ou s'assurer que c'est bien l'ID du store et pas son nom

    // URL correcte pour Jeko (Confirmée par doc)
    const jekoUrl = "https://api.jeko.africa/partner_api/payment_requests";

    console.log("Appel Jeko vers:", jekoUrl);
    console.log("Avec Key ID:", jekoKeyId ? "OUI" : "NON");
    console.log("Avec API Key (len):", jekoApiKey ? jekoApiKey.length : 0);

    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': jekoApiKey,
      // 'X-API-KEY-ID': jekoKeyId, // On retire cet ID qui semble causer l'erreur 401
    };

    const body = {
      amountCents: Math.round(amount), 
      currency: 'XOF',
      reference: orderId.toString(),
      storeId: jekoStoreId,
      paymentDetails: {
        type: "redirect",
        data: {
          // On laisse le choix à l'utilisateur
          successUrl: `${req.headers.get('origin')}/order-success?order_id=${orderId}`,
          errorUrl: `${req.headers.get('origin')}/checkout`,
        }
      }
    };

    // Créer la session de paiement Jeko
    const response = await fetch(jekoUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Jeko API Error:', errorData)
      throw new Error(`Jeko API error: ${response.status} - ${errorData}`)
    }

    const jekoData = await response.json()

    // Adapter selon la réponse réelle de Jeko (souvent 'url' ou 'checkoutUrl')
    const checkoutUrl = jekoData.paymentUrl || jekoData.url || jekoData.redirectUrl || jekoData.data?.paymentUrl;

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: checkoutUrl,
        sessionId: jekoData.id || jekoData.reference,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
