import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderData } = await req.json()
    
    console.log('📧 Processing order email for:', orderData.orderNumber)
    
    // Get BREVO API key from environment variables (secure)
    const brevoApiKey = Deno.env.get('VITE_BREVO_API_KEY')
    
    if (!brevoApiKey) {
      console.error('❌ BREVO API key not configured in Edge Function environment')
      throw new Error('Email service configuration error')
    }

    // Generate email content
    const htmlContent = generateEmailContent(orderData)
    console.log('✅ Email content generated')

    // Generate simple PDF invoice
    const pdfBase64 = await generateSimplePDF(orderData)
    console.log('✅ PDF invoice generated')

    // Send email using BREVO API
    console.log('📮 Sending email via BREVO API...')
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: 'Mimasa Foods',
          email: 'mimasafoods@gmail.com',
        },
        to: [
          {
            email: orderData.customerEmail,
            name: orderData.customerName,
          },
        ],
        bcc: [
          {
            email: 'mimasafoods@gmail.com',
            name: 'Mimasa Foods',
          },
        ],
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        htmlContent: htmlContent,
        attachment: [
          {
            content: pdfBase64,
            name: `Invoice_${orderData.orderNumber}.pdf`,
            type: 'application/pdf',
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ BREVO API Error:', errorData)
      throw new Error(`Email service temporarily unavailable`)
    }

    const result = await response.json()
    console.log('✅ Email sent successfully:', result.messageId || 'success')

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('❌ Error sending email:', error.message)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to send order confirmation email'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Generate professional PDF invoice
async function generateSimplePDF(orderData: any): Promise<string> {
  // Create a professional PDF using proper PDF structure
  // This mimics the jsPDF output but works in Deno environment
  
  const pageWidth = 595; // A4 width in points
  const pageHeight = 842; // A4 height in points
  const margin = 56; // 20mm margin in points
  
  let yPosition = margin;
  
  // Build PDF content with proper structure
  let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${pageWidth} ${pageHeight}]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
/F2 6 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${5000}
>>
stream
BT
/F1 18 Tf
56 750 Td
(Mimasa Foods Pvt Ltd) Tj
/F2 10 Tf
0 -15 Td
(Plot no 3, Kshitij, Sanjwat CHS,669/2, Bibwewadi, Pune Maharashtra, India, Pin: 411037) Tj
0 -10 Td
(GST: 27AAAPM1234C1ZV | PAN: AAAPM1234C) Tj
/F1 12 Tf
200 720 Td
(INVOICE) Tj
/F2 10 Tf
400 0 Td
(Order Number: ${orderData.orderNumber}) Tj
0 -12 Td
(Date: ${new Date(orderData.orderDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}) Tj
-400 24 Td
/F1 12 Tf
0 -30 Td
(Bill To:) Tj
/F2 10 Tf
0 -8 Td
(${orderData.customerName}) Tj
0 -6 Td
(${orderData.customerEmail}) Tj
0 -6 Td
(${orderData.customerPhone}) Tj
0 -6 Td`;

  // Add address lines
  const addressLines = orderData.shippingAddress.split('\n');
  addressLines.forEach(line => {
    pdfContent += `\n(${line}) Tj\n0 -6 Td`;
  });
  
  pdfContent += `\n(${orderData.pinCode}) Tj
/F1 12 Tf
0 -20 Td
(Order Items) Tj
/F2 10 Tf
0 -12 Td
(Product) Tj
100 0 Td
(Qty) Tj
20 0 Td
(Price (INR)) Tj
30 0 Td
(Total (INR)) Tj
-150 8 Td`;

  // Add table line
  pdfContent += `\n56 ${yPosition + 100} m
${pageWidth - 56} ${yPosition + 100} l
S
0 8 Td`;

  // Add items
  let itemY = yPosition + 108;
  orderData.items.forEach((item: any) => {
    const productName = (item.product?.name || 'Product').substring(0, 40); // Truncate long names
    const quantity = item.quantity;
    const unitPrice = item.product?.price || 0;
    const totalPrice = unitPrice * quantity;
    
    pdfContent += `\n(${productName}) Tj
100 0 Td
(${quantity}) Tj
20 0 Td
(${unitPrice.toFixed(2)}) Tj
30 0 Td
(${totalPrice.toFixed(2)}) Tj
-150 6 Td`;
    itemY += 6;
  });

  // Add table bottom line
  pdfContent += `\n56 ${itemY} m
${pageWidth - 56} ${itemY} l
S
0 20 Td
/F1 12 Tf
(Order Summary) Tj
/F2 10 Tf
0 -12 Td
120 0 Td
(Subtotal:) Tj
60 0 Td
(${orderData.subtotal.toFixed(2)}) Tj
-180 8 Td`;

  if (orderData.shippingCharge > 0) {
    pdfContent += `\n120 0 Td
(Shipping:) Tj
60 0 Td
(${orderData.shippingCharge.toFixed(2)}) Tj
-180 8 Td`;
  } else {
    pdfContent += `\n120 0 Td
(Shipping:) Tj
60 0 Td
(FREE) Tj
-180 8 Td`;
  }

  // Add total line
  pdfContent += `\n176 ${yPosition + 250} m
236 ${yPosition + 250} l
S
0 8 Td
/F1 12 Tf
(Total Amount:) Tj
/F2 10 Tf
20 0 Td
(${orderData.totalAmount.toFixed(2)}) Tj
-20 30 Td
(Payment ID: ${orderData.paymentId}) Tj
0 -8 Td
(Payment Method: Razorpay) Tj
0 400 Td
/F2 8 Tf
(Thank you for choosing Mimasa Foods Pvt Ltd!) Tj
0 6 Td
(mimasafoods@gmail.com | +91 84217 94918) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000004500 00000 n 
0000004600 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
4700
%%EOF`;

  // Convert to base64 properly
  try {
    // Use proper encoding for PDF content
    const encoder = new TextEncoder()
    const uint8Array = encoder.encode(pdfContent)
    return btoa(String.fromCharCode(...uint8Array))
  } catch (error) {
    console.error('Error encoding PDF:', error)
    // Fallback to simple base64 encoding
    return btoa(pdfContent.replace(/[^\x00-\xFF]/g, '?'))
  }
}

// Generate email content
function generateEmailContent(orderData: any): string {
  const orderDate = new Date(orderData.orderDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const itemsList = orderData.items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.product?.name || 'Product'}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Rs.${(item.product?.price || 0).toFixed(2)}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Rs.${((item.product?.price || 0) * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - ${orderData.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #ff6b35; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #ff6b35; margin-bottom: 10px; }
        .order-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th { background: #ff6b35; color: white; padding: 10px; text-align: left; }
        .table td { padding: 10px; border: 1px solid #ddd; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Mimasa Foods</div>
          <h2>Order Confirmation</h2>
          <p>Thank you for your order! We're preparing it with care.</p>
        </div>
        
        <div class="order-info">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Payment ID:</strong> ${orderData.paymentId}</p>
        </div>

        <div class="order-info">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${orderData.customerName}</p>
          <p><strong>Email:</strong> ${orderData.customerEmail}</p>
          <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
          <p><strong>Shipping Address:</strong> ${orderData.shippingAddress}, ${orderData.pinCode}</p>
        </div>

        <h3>Order Items</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div class="total">
          <p>Subtotal: Rs.${orderData.subtotal.toFixed(2)}</p>
          <p>Shipping: ${orderData.shippingCharge > 0 ? `Rs.${orderData.shippingCharge.toFixed(2)}` : 'FREE'}</p>
          <p><strong>Total Amount: Rs.${orderData.totalAmount.toFixed(2)}</strong></p>
        </div>

        <div class="footer">
          <p>Thank you for choosing Mimasa Foods!</p>
          <p>If you have any questions, please contact us at mimasafoods@gmail.com</p>
          <p>Homemade delicacy with authentic Indian flavors</p>
        </div>
      </div>
    </body>
    </html>
  `
}