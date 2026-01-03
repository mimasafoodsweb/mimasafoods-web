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
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  private constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send order confirmation email using Supabase Edge Function
   */
  public async sendOrderConfirmationEmail(orderData: OrderEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📄 Generating PDF invoice on client side...');
      const invoiceGenerator = InvoiceGenerator.getInstance();
      const pdfBase64 = await invoiceGenerator.generateInvoicePDF(orderData);

      console.log('📧 Sending email via Supabase Edge Function...');
      
      // Call Supabase Edge Function
      const { error } = await this.callEdgeFunction('send-order-email', {
        orderData,
        pdfAttachment: pdfBase64
      });

      if (error) {
        console.error('❌ Edge Function Error:', error);
        throw new Error(`Edge Function error: ${error.message}`);
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

  /**
   * Generic method to call Supabase Edge Functions
   */
  private async callEdgeFunction(functionName: string, payload: any): Promise<{ data: any; error: any }> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to call edge function') 
      };
    }
  }
}

export default EmailService;
