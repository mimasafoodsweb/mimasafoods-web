import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          error: 'Missing required payment verification fields'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Razorpay key secret from environment variables
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET not configured')
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          error: 'Payment verification service not configured'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate the expected signature
    const encoder = new TextEncoder()
    const keyData = encoder.encode(keySecret)
    const messageData = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`)
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', key, messageData)
    const generated_signature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Verify the signature
    const isVerified = generated_signature === razorpay_signature

    console.log('Payment verification:', {
      razorpay_order_id,
      razorpay_payment_id,
      signature_match: isVerified,
      received_signature: razorpay_signature.substring(0, 10) + '...',
      generated_signature: generated_signature.substring(0, 10) + '...'
    })

    // Additionally verify payment status with Razorpay
    let paymentStatus = 'unknown'
    if (isVerified && razorpay_payment_id) {
      try {
        const keyId = Deno.env.get('RAZORPAY_KEY_ID')
        const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
        
        if (keyId && keySecret) {
          const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
            headers: {
              'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`
            }
          })
          
          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json()
            paymentStatus = paymentData.status
            console.log('Payment status from Razorpay:', paymentStatus)
          }
        }
      } catch (error) {
        console.error('Error fetching payment status:', error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: isVerified,
        payment_status: paymentStatus,
        error: isVerified ? undefined : 'Invalid payment signature'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        verified: false,
        error: 'Payment verification failed'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
