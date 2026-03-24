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
    const jekoApiKey = "jeko_d471e4f96212dfb0b81bc5ac9b51cf07cfbe4e8a86f4fd323a948afab0206c9b";
    const jekoKeyId = "b84aaf2e-b8de-4b6d-bd00-d1def66cae59";
    const jekoStoreId = "b84aaf2e-b8de-4b6d-bd00-d1def66cae59"; // Store ID UUID correct

    // URL correcte pour Jeko (Confirmée par doc)
    const jekoUrl = "https://api.jeko.africa/partner_api/payment_requests";

    console.log("Appel Jeko vers:", jekoUrl);
    console.log("Avec Key ID:", jekoKeyId ? "OUI" : "NON");
    console.log("Avec API Key (len):", jekoApiKey ? jekoApiKey.length : 0);

    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': jekoApiKey,
      'X-API-KEY-ID': jekoKeyId,
    };

    const body = {
      amountCents: Math.round(amount * 100), // Jeko requires amount in cents (XOF * 100)
      currency: 'XOF',
      reference: `TFX-${orderId.toString()}`, // Prefix to ensure minimum 5 characters
      storeId: "31260f00-ca93-4e6d-9b00-4061fcb149f7", // Correct Store ID from Jeko API
      paymentDetails: {
        type: "redirect",
        data: {
          paymentMethod: "wave", // Default to Wave if not specified, user can change on Jeko page often
          successUrl: `${(req.headers.get('origin') && !req.headers.get('origin').includes('localhost')) ? req.headers.get('origin') : 'https://tfexpresss.com'}/order-success?order_id=${orderId}`,
          errorUrl: `${(req.headers.get('origin') && !req.headers.get('origin').includes('localhost')) ? req.headers.get('origin') : 'https://tfexpresss.com'}/checkout`,
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
