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
    const signature = req.headers.get('x-jeko-signature')
    const webhookSecret = Deno.env.get('JEKO_WEBHOOK_SECRET')

    // Vérifier la signature du webhook
    const payload = await req.text()
    
    // TODO: Implémenter la vérification de signature si Jeko le supporte
    // Pour l'instant, on fait confiance au webhook

    const event = JSON.parse(payload)

    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (event.type === 'payment.succeeded') {
      const orderId = event.data.order_id
      const paymentId = event.data.id

      // Mettre à jour la commande dans Supabase
      const { error } = await supabase
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

      if (error) {
        console.error('Error updating order:', error)
        throw error
      }

      console.log(`Order ${orderId} marked as paid`)
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
