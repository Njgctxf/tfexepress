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
    const jekoApiKey = Deno.env.get('JEKO_API_KEY')
    const jekoKeyId = Deno.env.get('JEKO_KEY_ID')
    const jekoStoreId = Deno.env.get('JEKO_STORE_ID')

    if (!jekoApiKey || !jekoKeyId || !jekoStoreId) {
      throw new Error('Jeko credentials not configured')
    }

    // Créer la session de paiement Jeko
    const jekoResponse = await fetch('https://api.jeko.io/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': jekoApiKey,
        'X-Key-ID': jekoKeyId,
      },
      body: JSON.stringify({
        store_id: jekoStoreId,
        amount: Math.round(amount * 100), // Convertir en centimes
        currency: 'XOF',
        customer_email: customerEmail,
        order_id: orderId.toString(),
        success_url: `${req.headers.get('origin')}/order-success?order_id=${orderId}`,
        cancel_url: `${req.headers.get('origin')}/checkout`,
        webhook_url: `${req.headers.get('origin')}/supabase/functions/v1/jeko-webhook`,
      }),
    })

    if (!jekoResponse.ok) {
      const errorData = await jekoResponse.text()
      console.error('Jeko API Error:', errorData)
      throw new Error(`Jeko API error: ${jekoResponse.status}`)
    }

    const jekoData = await jekoResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: jekoData.checkout_url,
        sessionId: jekoData.id,
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
