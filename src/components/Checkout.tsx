import { useState, useEffect } from 'react';
import { X, CreditCard, Loader2, Tag, CheckCircle, XCircle } from 'lucide-react';
import { CartItem } from '../types';
import { getProductImageUrl } from '../utils/images';
import { createRazorpayOrder, verifyPayment, saveOrder } from '../utils/api';
import { PaymentVerificationData } from '../utils/razorpay';
import { getSessionId } from '../utils/session';
import { EmailService, OrderEmailData } from '../utils/emailService';
import { getShippingCharge, getFreeShippingThreshold } from '../utils/cartConfig';
import { validateDiscountCode, incrementDiscountUsage, DiscountValidationResult } from '../utils/discountService';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  isSubmitting: boolean;
  onPaymentSuccess: (orderNumber: string) => void;
  discountCode?: string;
  discountValidation?: DiscountValidationResult | null;
  appliedDiscountId?: string | null;
  onSetDiscountCode?: (code: string) => void;
  onSetDiscountValidation?: (validation: DiscountValidationResult | null) => void;
  onSetAppliedDiscountId?: (id: string | null) => void;
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
  discountCode = '',
  discountValidation = null,
  appliedDiscountId = null,
  onSetDiscountCode,
  onSetDiscountValidation,
  onSetAppliedDiscountId,
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
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const [shippingCharge, setShippingCharge] = useState(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);

  // Sync discount state with props when they change
  useEffect(() => {
    if (discountCode !== undefined) {
      // Input field will use the prop value directly
    }
  }, [discountCode]);

  useEffect(() => {
    if (discountValidation !== undefined) {
      // Validation will use the prop value directly
    }
  }, [discountValidation]);

  // Calculate total amount
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  // Fetch shipping configuration from cart config
  useEffect(() => {
    const fetchShippingConfig = async () => {
      try {
        const [charge, threshold] = await Promise.all([
          getShippingCharge(),
          getFreeShippingThreshold()
        ]);
        setShippingCharge(charge);
        setFreeShippingThreshold(threshold);
      } catch (error) {
        console.error('Error fetching shipping config:', error);
        setShippingCharge(0); // Fallback to 0 if error
        setFreeShippingThreshold(500); // Fallback to 500 if error
      } finally {
        // Loading complete
      }
    };

    fetchShippingConfig();
  }, []);

  // Calculate final amount with dynamic shipping and discount
  const discountAmount = discountValidation?.valid ? discountValidation.discount_amount : 0;
  const finalShippingCharge = totalAmount < freeShippingThreshold ? shippingCharge : 0;
  const finalAmount = totalAmount + finalShippingCharge - discountAmount;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setIsApplyingDiscount(true);
    onSetDiscountValidation?.(null);

    try {
      const result = await validateDiscountCode(discountCode.trim(), totalAmount);
      onSetDiscountValidation?.(result);

      if (result.valid) {
        onSetAppliedDiscountId?.(result.discount_id);
      } else {
        onSetAppliedDiscountId?.(null);
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      onSetDiscountValidation?.({
        valid: false,
        discount_amount: 0,
        message: 'Error validating discount code',
        discount_id: null
      });
      onSetAppliedDiscountId?.(null);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    onSetDiscountCode?.('');
    onSetDiscountValidation?.(null);
    onSetAppliedDiscountId?.(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    
    try {
      setIsProcessingPayment(true);
      
      // Step 1: Customer proceeds to pay
      // Step 2: Create Razorpay order
      const receipt = `order_${Date.now()}`;
      const orderRequest = {
        amount: finalAmount, // Use final amount including shipping and discount
        currency: 'INR',
        receipt,
        notes: {
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          shipping_address: formData.shipping_address,
          pin_code: formData.pin_code,
          subtotal: totalAmount,
          shipping_charge: finalShippingCharge,
          discount_amount: discountAmount,
          original_amount: totalAmount + finalShippingCharge,
          total_amount: finalAmount,
          discount_code: discountValidation?.valid ? discountCode : null,
          discount_code_id: appliedDiscountId
        }
      };
      
      // Create Razorpay order
      const orderResponse = await createRazorpayOrder(orderRequest);
      
      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.error || 'Failed to create payment order');
      }
      
      // Step 3: Order ID returned
      const razorpayOrderId = orderResponse.data.id;
      
      // Step 4-5: Open Razorpay checkout and handle payment
      await initiateRazorpayPayment(razorpayOrderId, finalAmount, formData, receipt);
      
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
        order_id: orderId, // Include order_id for Standard Checkout with signature verification
        prefill: {
          name: customerData.customer_name,
          email: customerData.customer_email,
          contact: customerData.customer_phone
        },
        notes: {
          shipping_address: customerData.shipping_address,
          pin_code: customerData.pin_code,
          order_receipt: receipt,
          order_id: orderId // Keep order_id in notes for reference
        },
        theme: {
          color: '#e74c3c'
        },
        modal: {
          ondismiss: function() {
            reject(new Error('Payment cancelled by user'));
          },
          escape: false,
          backdropclose: false,
          handleback: false
        },
        handler: async function(response: PaymentVerificationData) {
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
              payment_signature: response.razorpay_signature, // Add signature
              amount,
              items: cartItems,
              created_at: new Date().toISOString(),
              shippingCharge: finalShippingCharge, // Add dynamic shipping charge
              discountAmount: discountAmount, // Add discount amount
              originalAmount: totalAmount + finalShippingCharge, // Add original amount
              discountCodeId: appliedDiscountId, // Add discount code ID
              sessionId: getSessionId() // Add session ID for cart clearing
            };
            
            const saveResult = await saveOrder(orderData);
            
            if (!saveResult.success) {
              throw new Error(saveResult.error || 'Failed to save order');
            }

            // Increment discount usage count if discount was applied
            if (appliedDiscountId) {
              await incrementDiscountUsage(appliedDiscountId);
            }

            // Send order confirmation email
            const emailData: OrderEmailData = {
              orderNumber: saveResult.orderNumber || receipt,
              customerName: customerData.customer_name,
              customerEmail: customerData.customer_email,
              customerPhone: customerData.customer_phone,
              shippingAddress: customerData.shipping_address,
              pinCode: customerData.pin_code,
              items: cartItems,
              subtotal: totalAmount,
              shippingCharge: finalShippingCharge,
              discountAmount: discountAmount,
              totalAmount: finalAmount,
              paymentId: response.razorpay_payment_id,
              orderDate: new Date().toISOString()
            };

            // Send email asynchronously (don't block the UI)
            EmailService.getInstance().sendOrderConfirmationEmail(emailData)
              .then(emailResult => {
                if (!emailResult.success) {
                  console.error('Failed to send order confirmation email:', emailResult.error);
                }
              })
              .catch(error => {
                console.error('Error sending order confirmation email:', error);
              });
            
            // Payment successful - call success callback with actual order number
            onPaymentSuccess(saveResult.orderNumber || receipt);
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
                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  {finalShippingCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>₹{finalShippingCharge.toFixed(2)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-blue-600">₹{finalAmount.toFixed(2)}</span>
                  </div>
                  {finalShippingCharge > 0 && (
                    <div className="text-xs text-gray-500 text-center mt-2">
                      Add ₹{(freeShippingThreshold - totalAmount).toFixed(2)} more for free shipping!
                    </div>
                  )}
                  {finalShippingCharge === 0 && totalAmount > 0 && (
                    <div className="text-xs text-green-600 text-center mt-2 font-medium">
                      🎉 Free shipping applied!
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="text-xs text-green-600 text-center mt-2 font-medium">
                      🎉 Discount applied! You saved ₹{discountAmount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Discount Code Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Discount Code
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => onSetDiscountCode?.(e.target.value.toUpperCase())}
                      placeholder="Enter discount code"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all"
                      disabled={isApplyingDiscount || discountValidation?.valid}
                    />
                  </div>
                  {!discountValidation?.valid ? (
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={!discountCode.trim() || isApplyingDiscount}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isApplyingDiscount ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>

                {/* Discount Validation Result */}
                {discountValidation && (
                  <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                    discountValidation.valid 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {discountValidation.valid ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {discountValidation.valid ? 'Discount Applied!' : 'Invalid Discount Code'}
                      </p>
                      <p className="text-xs mt-1">
                        {discountValidation.message.includes('Minimum order amount not met') && discountValidation.min_order_amount
                          ? `${discountValidation.message} (Minimum: ₹${discountValidation.min_order_amount.toFixed(2)})`
                          : discountValidation.message
                        }
                      </p>
                      {discountValidation.valid && discountValidation.discount_amount > 0 && (
                        <p className="text-xs mt-1 font-semibold">
                          You saved ₹{discountValidation.discount_amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Minimum Order Amount Info */}
                {discountValidation?.valid && discountValidation.min_order_amount && discountValidation.min_order_amount > 0 && (
                  <div className="mt-3 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                    💡 Minimum order amount: ₹{discountValidation.min_order_amount.toFixed(2)}
                  </div>
                )}
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
                className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white font-bold rounded-full hover:from-orange-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl border-2 border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
