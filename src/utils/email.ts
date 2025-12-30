import { CartItem } from '../types';
import { InvoiceGenerator } from './invoiceGenerator';

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  pinCode: string;
  items: CartItem[];
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  paymentId: string;
  orderDate: string;
}

export class EmailService {
  private static instance: EmailService;
  private apiKey: string;
  private senderEmail: string = 'mimasafoods@gmail.com';
  private bccEmail: string = 'mimasafoods@gmail.com';

  private constructor() {
    this.apiKey = import.meta.env.VITE_BREVO_API_KEY || '';
    console.log('BREVO API Key from env:', import.meta.env.VITE_BREVO_API_KEY ? 'Found' : 'Not found');
    console.log('Available VITE env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
    
    if (!this.apiKey) {
      console.warn('BREVO API key not found in environment variables');
      console.warn('Please add VITE_BREVO_API_KEY to your .env.local file');
    } else {
      console.log('🔑 BREVO API Key loaded (first 10 chars):', this.apiKey.substring(0, 10) + '...');
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Estimate email size to avoid exceeding BREVO limits
   */
  private estimateEmailSize(htmlContent: string, pdfBase64: string): number {
    const base64Size = pdfBase64.length * 0.75; // Base64 is ~33% larger than binary
    const htmlSize = new Blob([htmlContent]).size;
    const jsonOverhead = 2048; // Estimated JSON structure overhead
    const attachmentOverhead = 1024; // Attachment metadata overhead
    
    return base64Size + htmlSize + jsonOverhead + attachmentOverhead;
  }

  /**
   * Send order confirmation email using BREVO API
   */
  public async sendOrderConfirmationEmail(orderData: OrderEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('BREVO API key is not configured');
      }

      console.log('📄 Generating PDF invoice attachment...');
      const invoiceGenerator = InvoiceGenerator.getInstance();
      
      // Generate PDF invoice
      const pdfBase64 = await invoiceGenerator.generateInvoicePDF(orderData);
      const invoiceFilename = invoiceGenerator.generateInvoiceFilename(orderData.orderNumber);
      
      console.log('✅ PDF invoice generated, size:', pdfBase64.length, 'characters');

      const emailContent = this.generateOrderConfirmationEmail(orderData);
      
      // Check email size before sending
      const estimatedSize = this.estimateEmailSize(emailContent, pdfBase64);
      console.log('📊 Estimated email size:', Math.round(estimatedSize / 1024 / 1024 * 100) / 100, 'MB');
      
      let finalPdfBase64 = pdfBase64;
      if (estimatedSize > 19 * 1024 * 1024) { // 19MB to stay under 20MB limit
        console.warn('⚠️  Email size too large, using text-only PDF...');
        // Generate a smaller PDF without logo
        finalPdfBase64 = await invoiceGenerator.generateOptimizedPDF(orderData);
        console.log('✅ Optimized PDF generated, size:', finalPdfBase64.length, 'characters');
      }
      
      // Debug: Log complete email content
      console.log('=== BREVO EMAIL DEBUG INFORMATION ===');
      console.log('📧 Email Configuration:');
      console.log('  From:', this.senderEmail);
      console.log('  To:', orderData.customerEmail);
      console.log('  BCC:', this.bccEmail);
      console.log('  Subject:', `Order Confirmation - ${orderData.orderNumber}`);
      console.log('  Attachment:', invoiceFilename);
      
      console.log('\n📋 Order Data:');
      console.log('  Order Number:', orderData.orderNumber);
      console.log('  Customer Name:', orderData.customerName);
      console.log('  Customer Email:', orderData.customerEmail);
      console.log('  Customer Phone:', orderData.customerPhone);
      console.log('  Payment ID:', orderData.paymentId);
      console.log('  Order Date:', orderData.orderDate);
      console.log('  Items Count:', orderData.items.length);
      console.log('  Subtotal:', `₹${orderData.subtotal.toFixed(2)}`);
      console.log('  Shipping:', `₹${orderData.shippingCharge.toFixed(2)}`);
      console.log('  Total:', `₹${orderData.totalAmount.toFixed(2)}`);
      
      console.log('\n📦 Order Items:');
      orderData.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.product?.name || 'Product'} x${item.quantity} = ₹${((item.product?.price || 0) * item.quantity).toFixed(2)}`);
      });
      
      console.log('\n📄 Complete Email HTML Content:');
      console.log('--- START EMAIL HTML ---');
      console.log(emailContent);
      console.log('--- END EMAIL HTML ---');
      
      console.log('\n🔗 BREVO API Request:');
      const requestBody = {
        sender: {
          name: 'Mimasa Foods',
          email: this.senderEmail,
        },
        to: [
          {
            email: orderData.customerEmail,
            name: orderData.customerName,
          },
        ],
        bcc: [
          {
            email: this.bccEmail,
          },
        ],
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        htmlContent: emailContent,
        attachment: [
          {
            name: invoiceFilename,
            content: finalPdfBase64,
          },
        ],
      };
      
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('API Endpoint: https://api.brevo.com/v3/smtp/email');
      console.log('API Key (first 10 chars):', this.apiKey.substring(0, 10) + '...');
      
      // Check if we're in test mode
      const isTestEmail = orderData.customerEmail.includes('test') || orderData.customerEmail.includes('example');
      if (isTestEmail) {
        console.log('⚠️  Test email detected - this might not be delivered in production');
      }
      
      console.log('=== END BREVO EMAIL DEBUG ===\n');

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ BREVO API Error Response:', errorData);
        throw new Error(`BREVO API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ BREVO API Success Response:', result);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  /**
   * Generate HTML content for order confirmation email
   */
  private generateOrderConfirmationEmail(orderData: OrderEmailData): string {
    const orderDate = new Date(orderData.orderDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const itemsHtml = orderData.items.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left;">
          <div style="font-weight: 600; color: #1f2937;">${item.product?.name || 'Product'}</div>
          <div style="font-size: 14px; color: #6b7280;">Quantity: ${item.quantity}</div>
        </td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #1f2937;">
          ₹${((item.product?.price || 0) * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Mimasa Foods</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .total-section { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
          .highlight { color: #8B4513; font-weight: bold; }
          .thank-you { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for choosing Mimasa Foods</p>
        </div>

        <div class="content">
          <div class="order-info">
            <h2 style="color: #8B4513; margin-top: 0;">Order Details</h2>
            <p><strong>Order Number:</strong> <span class="highlight">${orderData.orderNumber}</span></p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Payment ID:</strong> ${orderData.paymentId}</p>
          </div>

          <div class="order-info">
            <h3 style="color: #8B4513; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${orderData.customerName}</p>
            <p><strong>Email:</strong> ${orderData.customerEmail}</p>
            <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
            <p><strong>Shipping Address:</strong><br>${orderData.shippingAddress.replace(/\n/g, '<br>')}</p>
            <p><strong>PIN Code:</strong> ${orderData.pinCode}</p>
          </div>

          <div class="order-info">
            <h3 style="color: #8B4513; margin-top: 0;">Order Items</h3>
            <table class="table">
              <thead>
                <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 12px; text-align: left; font-weight: 600;">Product</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <h3 style="color: #8B4513; margin-top: 0;">Order Summary</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">₹${orderData.subtotal.toFixed(2)}</td>
              </tr>
              ${orderData.shippingCharge > 0 ? `
                <tr>
                  <td style="padding: 8px 0;">Shipping Charge:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">₹${orderData.shippingCharge.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr style="border-top: 2px solid #8B4513;">
                <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #8B4513;">Total Amount:</td>
                <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #8B4513;">₹${orderData.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="thank-you">
            <h3 style="color: #8B4513; margin-top: 0;">What's Next?</h3>
            <p style="margin: 10px 0;">📦 Your order is being processed and will be shipped soon.</p>
            <p style="margin: 10px 0;">📧 You'll receive tracking details once your order is dispatched.</p>
            <p style="margin: 10px 0;">📄 Your invoice is attached to this email as a PDF.</p>
            <p style="margin: 10px 0;">📞 For any queries, contact us at mimasafoods@gmail.com</p>
          </div>

          <div class="footer">
            <p style="margin: 0;">Warm regards,</p>
            <p style="margin: 5px 0;"><strong>Team Mimasa Foods</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              This is an automated email. Please do not reply to this message.<br>
              For support, contact us at mimasafoods@gmail.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default EmailService;
