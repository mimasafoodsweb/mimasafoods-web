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
  private senderEmail: string = 'mimasafoods@gmail.com';
  private bccEmail: string = 'mimasafoods@gmail.com';

  private constructor() {
    // API key will come from environment variable
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send order confirmation email using BREVO API
   */
  public async sendOrderConfirmationEmail(orderData: OrderEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📄 Generating PDF invoice attachment...');
      const invoiceGenerator = InvoiceGenerator.getInstance();
      const pdfBase64 = await invoiceGenerator.generateInvoicePDF(orderData);

      console.log('📧 Preparing email content...');
      const htmlContent = this.generateOrderConfirmationEmail(orderData);

      console.log('📮 Sending email via BREVO API...');
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': import.meta.env.VITE_BREVO_API_KEY || '',
        },
        body: JSON.stringify({
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
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ BREVO API Error Response:', errorData);
        throw new Error(`BREVO API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      await response.json();
      
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
