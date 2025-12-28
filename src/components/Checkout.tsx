import { useState } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { CartItem } from '../types';
import { getProductImageUrl } from '../utils/images';
import { createRazorpayOrder, verifyPayment, saveOrder } from '../utils/api';
import { PaymentVerificationData } from '../utils/razorpay';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  isSubmitting: boolean;
  onPaymentSuccess: (orderNumber: string) => void;
}

export interface OrderData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  pin_code: string;
}

export default function Checkout({
  isOpen,
  onClose,
  cartItems,
  isSubmitting,
  onPaymentSuccess,
}: CheckoutProps) {
  const [formData, setFormData] = useState<OrderData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    pin_code: '',
  });

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    
    try {
      setIsProcessingPayment(true);
      
      // Step 1: Customer proceeds to pay
      // Step 2: Create Razorpay order
      const receipt = `order_${Date.now()}`;
      const orderRequest = {
        amount: totalAmount,
        currency: 'INR',
        receipt,
        notes: {
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          shipping_address: formData.shipping_address,
          pin_code: formData.pin_code,
        }
      };
      
      const orderResponse = await createRazorpayOrder(orderRequest);
      
      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.error || 'Failed to create payment order');
      }
      
      // Step 3: Order ID returned
      const razorpayOrderId = orderResponse.data.id;
      
      // Step 4-5: Open Razorpay checkout and handle payment
      await initiateRazorpayPayment(razorpayOrderId, totalAmount, formData, receipt);
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const initiateRazorpayPayment = (
    orderId: string,
    amount: number,
    customerData: OrderData,
    receipt: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX',
        amount: amount * 100, // Convert to paise
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
          color: '#e74c3c'
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          }
        },
        handler: async (response: PaymentVerificationData) => {
          try {
            // Step 6: Verify payment signature
            const verificationResult = await verifyPayment(response);
            
            if (!verificationResult.success || !verificationResult.verified) {
              throw new Error(verificationResult.error || 'Payment verification failed');
            }
            
            // Save order details after successful payment
            const orderData = {
              ...customerData,
              order_id: orderId,
              payment_id: response.razorpay_payment_id,
              amount,
              items: cartItems,
              created_at: new Date().toISOString()
            };
            
            const saveResult = await saveOrder(orderData);
            
            if (!saveResult.success) {
              throw new Error(saveResult.error || 'Failed to save order');
            }
            
            // Payment successful - call success callback
            onPaymentSuccess(receipt);
            resolve();
            
          } catch (error) {
            console.error('Payment processing error:', error);
            reject(error);
          }
        }
      };
      
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-[mimasa-primary]" />
              <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {cartItems.map((item) => {
                  const resolvedImg = item.product?.name ? getProductImageUrl(item.product.name.toUpperCase()) || item.product?.image_url : item.product?.image_url;
                  return (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                          <img
                            src={resolvedImg}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-900 font-medium text-sm">
                            {item.product?.name}
                          </span>
                          <span className="text-gray-500 text-xs ml-2">
                            × {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">
                        ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-2 border-t flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[mimasa-primary]">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Delivery Information
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[mimasa-primary] focus:ring-2 focus:ring-[mimasa-primary] focus:ring-opacity-20 outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[mimasa-primary] focus:ring-2 focus:ring-[mimasa-primary] focus:ring-opacity-20 outline-none transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[mimasa-primary] focus:ring-2 focus:ring-[mimasa-primary] focus:ring-opacity-20 outline-none transition-all"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shipping Address *
                </label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[mimasa-primary] focus:ring-2 focus:ring-[mimasa-primary] focus:ring-opacity-20 outline-none transition-all resize-none"
                  placeholder="Complete delivery address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PIN Code *
                </label>
                <input
                  type="text"
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[mimasa-primary] focus:ring-2 focus:ring-[mimasa-primary] focus:ring-opacity-20 outline-none transition-all"
                  placeholder="6-digit PIN code"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isProcessingPayment}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-mimasa-accent to-mimasa-primary text-white font-bold rounded-full hover:from-mimasa-primary hover:to-mimasa-accent transition-all shadow-lg hover:shadow-xl border-2 border-mimasa-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : isSubmitting ? (
                  'Placing Order...'
                ) : (
                  'Pay with Razorpay'
                )}
              </button>
            </div>
            
            {paymentError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{paymentError}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
