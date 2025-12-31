import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib@1.17.1'

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

// Generate professional PDF invoice using pdf-lib
async function generateSimplePDF(orderData: any): Promise<string> {
  try {
    console.log('📄 Generating professional PDF with pdf-lib...');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a blank page
    const page = pdfDoc.addPage([595, 842]); // A4 size in points
    const { width, height } = page.getSize();
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Set margins
    const margin = 56;
    let yPosition = height - margin;
    
    // Company Header
    page.drawText('Mimasa Foods Pvt Ltd', {
      x: margin,
      y: yPosition,
      size: 18,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 15;
    page.drawText('Plot no 3, Kshitij, Sanjwat CHS,669/2, Bibwewadi, Pune Maharashtra, India, Pin: 411037', {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 10;
    page.drawText('GST: 27AAAPM1234C1ZV | PAN: AAAPM1234C', {
      x: margin,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Invoice title centered
    yPosition -= 30;
    const invoiceText = 'INVOICE';
    const invoiceWidth = helveticaBoldFont.widthOfTextAtSize(invoiceText, 12);
    page.drawText(invoiceText, {
      x: (width - invoiceWidth) / 2,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    // Order details on the right
    yPosition -= 8;
    const orderNumber = `Order Number: ${orderData.orderNumber}`;
    page.drawText(orderNumber, {
      x: width - margin - 150,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 12;
    const orderDate = `Date: ${new Date(orderData.orderDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
    page.drawText(orderDate, {
      x: width - margin - 150,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Bill To section
    yPosition -= 25;
    page.drawText('Bill To:', {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 10;
    page.drawText(orderData.customerName, {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 6;
    page.drawText(orderData.customerEmail, {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 6;
    page.drawText(orderData.customerPhone, {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Handle multi-line address
    const addressLines = orderData.shippingAddress.split('\n');
    addressLines.forEach((line: string) => {
      yPosition -= 6;
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    });
    
    yPosition -= 6;
    page.drawText(orderData.pinCode, {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Order Items Table
    yPosition -= 20;
    page.drawText('Order Items', {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 15;
    
    // Table headers
    page.drawText('Product', {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Qty', {
      x: margin + 100,
      y: yPosition,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Price (INR)', {
      x: margin + 120,
      y: yPosition,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Total (INR)', {
      x: margin + 150,
      y: yPosition,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    // Table line
    yPosition -= 8;
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 8;
    
    // Table items
    orderData.items.forEach((item: any) => {
      const productName = item.product?.name || 'Product';
      const quantity = item.quantity;
      const unitPrice = item.product?.price || 0;
      const totalPrice = unitPrice * quantity;
      
      // Handle long product names
      const maxNameWidth = 95;
      let nameToDraw = productName;
      if (helveticaFont.widthOfTextAtSize(productName, 10) > maxNameWidth) {
        // Truncate long names
        nameToDraw = productName.substring(0, 35) + '...';
      }
      
      page.drawText(nameToDraw, {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(quantity.toString(), {
        x: margin + 100,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(unitPrice.toFixed(2), {
        x: margin + 120,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(totalPrice.toFixed(2), {
        x: margin + 150,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 8;
    });
    
    // Table bottom line
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
    
    // Summary Section
    page.drawText('Order Summary', {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 15;
    
    // Right-align summary values
    const subtotalText = `Subtotal:`;
    const subtotalValue = `${orderData.subtotal.toFixed(2)}`;
    page.drawText(subtotalText, {
      x: margin + 120,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    const subtotalValueWidth = helveticaFont.widthOfTextAtSize(subtotalValue, 10);
    page.drawText(subtotalValue, {
      x: margin + 180 - subtotalValueWidth,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 8;
    
    const shippingText = 'Shipping:';
    page.drawText(shippingText, {
      x: margin + 120,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    const shippingValue = orderData.shippingCharge > 0 ? 
      `${orderData.shippingCharge.toFixed(2)}` : 'FREE';
    const shippingValueWidth = helveticaFont.widthOfTextAtSize(shippingValue, 10);
    page.drawText(shippingValue, {
      x: margin + 180 - shippingValueWidth,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Total line
    yPosition -= 8;
    page.drawLine({
      start: { x: margin + 115, y: yPosition },
      end: { x: margin + 180, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 10;
    const totalText = 'Total Amount:';
    page.drawText(totalText, {
      x: margin + 120,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    const totalValue = `${orderData.totalAmount.toFixed(2)}`;
    const totalValueWidth = helveticaBoldFont.widthOfTextAtSize(totalValue, 12);
    page.drawText(totalValue, {
      x: margin + 180 - totalValueWidth,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    // Payment Information
    yPosition -= 25;
    page.drawText(`Payment ID: ${orderData.paymentId}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 8;
    page.drawText('Payment Method: Razorpay', {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Footer
    yPosition = 50;
    page.drawText('Thank you for choosing Mimasa Foods Pvt Ltd!', {
      x: margin,
      y: yPosition,
      size: 8,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 6;
    page.drawText('mimasafoods@gmail.com | +91 84217 94918', {
      x: margin,
      y: yPosition,
      size: 8,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...pdfBytes));
    
    console.log('✅ Professional PDF generated with pdf-lib');
    return base64;
    
  } catch (error) {
    console.error('❌ Error generating PDF with pdf-lib:', error);
    throw new Error('Failed to generate professional PDF');
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