import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { amount, currency, receipt, notes } = await req.json()

    // Validate required fields
    if (!amount || !currency) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: amount, currency'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Razorpay credentials from environment variables
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    
    console.log('Environment check - Key ID exists:', !!keyId)
    console.log('Environment check - Key Secret exists:', !!keySecret)
    console.log('Key ID format:', keyId ? keyId.substring(0, 10) + '...' : 'null')
    
    if (!keyId || !keySecret) {
      console.error('Razorpay credentials not configured')
      return new Response(
        JSON.stringify({
          error: 'Razorpay payment service not configured'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prepare order options for Razorpay (with auto-capture enabled)
    const orderOptions = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
      payment_capture: 1 // Auto-capture payment immediately
    }

    console.log('Creating Razorpay order with options:', orderOptions)

    // Create order using Razorpay API
    console.log('Making request to Razorpay API...')
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderOptions)
    })

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json().catch(() => ({}))
      console.error('Razorpay API error:', errorData)
      return new Response(
        JSON.stringify({
          error: errorData.error?.description || 'Failed to create Razorpay order'
        }),
        { 
          status: razorpayResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const orderData = await razorpayResponse.json()
    console.log('Razorpay order created successfully:', orderData)

    return new Response(
      JSON.stringify(orderData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in razorpay-create-order function:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
