import { CartItem } from '../types';
import { supabase } from '../lib/supabase';

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

  private constructor() {
    // Simplified constructor - API key is now handled by Edge Function
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
  // private estimateEmailSize(htmlContent: string, pdfBase64: string): number {
  //   const base64Size = pdfBase64.length * 0.75; // Base64 is ~33% larger than binary
  //   const htmlSize = htmlContent.length;
  //   const jsonOverhead = 2048; // Estimated JSON structure overhead
  //   const attachmentOverhead = 1024; // Attachment metadata overhead
  //   
  //   return base64Size + htmlSize + jsonOverhead + attachmentOverhead;
  // }

  /**
   * Send order confirmation email using secure Edge Function
   */
  public async sendOrderConfirmationEmail(orderData: OrderEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('� Sending order confirmation email via secure Edge Function...');
      
      // Use secure Edge Function instead of direct API call
      const { error } = await supabase.functions.invoke('send-order-email', {
        body: { orderData }
      });

      if (error) {
        console.error('Error calling send-order-email Edge Function:', error);
        throw new Error(error.message);
      }

      console.log('✅ Email sent successfully via Edge Function');
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }
}

export default EmailService;
