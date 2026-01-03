import Razorpay from 'razorpay';
import { OrderData } from '../components/Checkout';

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  offer_id?: string | null;
  status: string;
  attempts: number;
  notes?: Record<string, any>;
  created_at: number;
}

export interface PaymentVerificationData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    pin_code: string;
  };
}

export class RazorpayService {
  private static instance: RazorpayService;
  private razorpay: Razorpay;

  private constructor() {
    // Initialize with your Razorpay credentials
    // In production, these should be environment variables
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX';
    const keySecret = import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'your_secret_key';
    
    // Debug logging - remove in production
    console.log('🔑 Razorpay Key ID:', keyId);
    console.log('🔑 Key ID length:', keyId.length);
    console.log('🔑 Key ID format check:', keyId.startsWith('rzp_test_') || keyId.startsWith('rzp_live_'));
    
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }

  public static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  /**
   * Create a Razorpay order
   * Step 2: Fires orders API
   */
  public async createOrder(request: CreateOrderRequest): Promise<RazorpayOrderResponse> {
    try {
      const order = await this.razorpay.orders.create(request);
      return {
        ...order,
        amount: typeof order.amount === 'string' ? parseInt(order.amount) : order.amount,
        amount_paid: typeof order.amount_paid === 'string' ? parseInt(order.amount_paid) : order.amount_paid,
        amount_due: typeof order.amount_due === 'string' ? parseInt(order.amount_due) : order.amount_due,
        created_at: typeof order.created_at === 'string' ? parseInt(order.created_at) : order.created_at
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify payment signature
   * Step 6: Verify the payment signature returned by Razorpay
   */
  public verifyPaymentSignature(
    paymentId: string,
    orderId: string,
    signature: string
  ): boolean {
    try {
      const crypto = require('crypto');
      const secret = import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'your_secret_key';
      
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  /**
   * Open Razorpay checkout modal
   * Step 4-5: Pass Order ID to checkout and handle payment
   */
  public openCheckout(
    orderId: string,
    amount: number,
    customerData: OrderData,
    onSuccess: (paymentData: PaymentVerificationData) => void,
    onFailure: (error: any) => void
  ): void {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX';
    
    // Debug logging - remove in production
    console.log('🔑 Checkout Razorpay Key ID:', keyId);
    console.log('🔑 Checkout Key ID length:', keyId.length);
    
    const options = {
      key: keyId,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Mimasa Foods',
      description: 'Order Payment',
      order_id: orderId,
      prefill: {
        name: customerData.customer_name,
        email: customerData.customer_email,
        contact: customerData.customer_phone
      },
      notes: {
        shipping_address: customerData.shipping_address,
        pin_code: customerData.pin_code
      },
      theme: {
        color: '#e74c3c' // Your brand color
      },
      modal: {
        ondismiss: function() {
          onFailure(new Error('Payment cancelled by user'));
        }
      },
      handler: function(response: PaymentVerificationData) {
        onSuccess(response);
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  }

  /**
   * Fetch payment details
   */
  public async fetchPayment(paymentId: string): Promise<any> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }
}

export default RazorpayService;
