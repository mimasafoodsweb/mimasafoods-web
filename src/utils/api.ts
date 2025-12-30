import { CreateOrderRequest, RazorpayOrderResponse, PaymentVerificationData } from '../utils/razorpay';
import { supabase } from '../lib/supabase';

export interface OrderApiResponse {
  success: boolean;
  data?: RazorpayOrderResponse;
  error?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  verified: boolean;
  error?: string;
}

/**
 * API Service for Razorpay operations
 * These endpoints should be implemented on your backend server
 */

// Step 2: Fires orders API - Create Razorpay order
export async function createRazorpayOrder(request: CreateOrderRequest): Promise<OrderApiResponse> {
  try {
    // In production, this should call your backend API endpoint
    // const response = await fetch('/api/razorpay/create-order', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(request),
    // });
    
    // For development, we'll simulate the API call
    // Replace this with actual backend implementation
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response - in production, this comes from your backend
    const mockOrder: RazorpayOrderResponse = {
      id: `order_${Date.now()}`,
      entity: 'order',
      amount: request.amount * 100, // Razorpay expects amount in paise
      amount_paid: 0,
      amount_due: request.amount * 100,
      currency: request.currency,
      receipt: request.receipt,
      offer_id: null,
      status: 'created',
      attempts: 0,
      notes: request.notes || {},
      created_at: Math.floor(Date.now() / 1000)
    };
    
    return {
      success: true,
      data: mockOrder
    };
    
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: 'Failed to create payment order'
    };
  }
}

// Step 6: Verify payment signature using PostgreSQL function
export async function verifyPayment(paymentData: PaymentVerificationData): Promise<PaymentVerificationResponse> {
  try {
    console.log('Verifying payment:', paymentData);
    
    // For Classic Checkout (without order_id), we verify payment by checking payment details
    // For Standard Checkout (with order_id), we verify signature using PostgreSQL function
    
    if (paymentData.razorpay_order_id && paymentData.razorpay_signature) {
      // Standard Checkout - verify signature using Supabase Edge Function
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await supabase.functions.invoke('razorpay-verify-payment', {
        body: paymentData
      });
      
      if (error) {
        console.error('Supabase Edge Function error:', error);
        throw new Error(error.message || 'Payment verification service error');
      }
      
      console.log('Payment verification result:', data);
      
      return data as PaymentVerificationResponse;
    } else {
      // Classic Checkout - verify payment by fetching payment details
      console.log('Classic Checkout detected - verifying payment details');
      
      // For Classic Checkout, we'll consider payment valid if we have a payment_id
      // In production, you should make an API call to Razorpay to verify payment status
      // For now, we'll accept it as valid (you can enhance this later)
      
      return {
        success: true,
        verified: true,
        error: undefined
      };
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Payment verification failed'
    };
  }
}

// Save order details after successful payment
export async function saveOrder(orderData: any & { sessionId?: string }): Promise<{ success: boolean; error?: string; orderNumber?: string }> {
  try {
    console.log('Saving order to Supabase:', orderData);
    
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    // Calculate totals from order data
    const subtotal = orderData.items.reduce(
      (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
    const shippingCharge = subtotal < 500 ? 5 : 0;
    const totalAmount = subtotal + shippingCharge;

    // Generate order number
    const orderNumber = `MF${Date.now()}`;

    // Insert order into Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        shipping_address: orderData.shipping_address,
        pin_code: orderData.pin_code,
        subtotal: subtotal,
        shipping_charge: shippingCharge,
        total_amount: totalAmount,
        status: 'paid',
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: orderData.payment_id,
        razorpay_signature: orderData.payment_signature, // Add signature
        payment_status: 'completed',
        payment_method: 'razorpay',
        payment_amount: orderData.amount,
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error inserting order:', orderError);
      throw orderError;
    }

    console.log('Order inserted successfully:', order);

    // Insert order items
    const orderItems = orderData.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product?.name || '',
      product_price: item.product?.price || 0,
      quantity: item.quantity,
      subtotal: (item.product?.price || 0) * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
      throw itemsError;
    }

    console.log('Order items inserted successfully');

    // Clear cart items after successful order
    if (orderData.sessionId) {
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', orderData.sessionId);

      if (clearCartError) {
        console.error('Error clearing cart:', clearCartError);
        // Don't throw here as order is already saved
      } else {
        console.log('Cart cleared successfully from database');
      }
    }

    console.log('Order saved successfully to Supabase');
    return { success: true, orderNumber };
    
  } catch (error) {
    console.error('Error saving order to Supabase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save order'
    };
  }
}

export default {
  createRazorpayOrder,
  verifyPayment,
  saveOrder
};
