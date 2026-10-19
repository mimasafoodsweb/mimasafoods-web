import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { CartItem } from '../types';
import { getProductImageUrl } from '../utils/images';
import { createRazorpayOrder, verifyPayment, saveOrder } from '../utils/api';
import { PaymentVerificationData } from '../utils/razorpay';
import { getSessionId } from '../utils/session';
import { EmailService, OrderEmailData } from '../utils/emailService';
import { getShippingCharge, getFreeShippingThreshold } from '../utils/cartConfig';
import { validateDiscountCode, incrementDiscountUsage, getDiscountCodeDetails, DiscountValidationResult } from '../utils/discountService';
import { useSiteConfig, resolveOfferCode } from '../utils/siteConfig';

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

  // Seasonal offer hint (informational only; the code is never auto-applied)
  const siteConfig = useSiteConfig();
  const seasonalCode = resolveOfferCode(siteConfig.offerBanner, siteConfig.offerCode);
  const [seasonalPercent, setSeasonalPercent] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    setSeasonalPercent(null);
    if (!seasonalCode) return;
    getDiscountCodeDetails(seasonalCode).then((d) => {
      if (alive && d && d.discount_type === 'percentage') setSeasonalPercent(Number(d.discount_value));
    });
    return () => { alive = false; };
  }, [seasonalCode]);

  // Calculate final amount with dynamic shipping and discount
  const discountAmount = discountValidation?.valid ? discountValidation.discount_amount : 0;
  // Free shipping is judged on the amount AFTER discount (items total - discount)
  const amountAfterDiscount = totalAmount - discountAmount;
  const finalShippingCharge = amountAfterDiscount < freeShippingThreshold ? shippingCharge : 0;
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
              console.log('🏷️ Incrementing usage for discount ID:', appliedDiscountId);
              const usageResult = await incrementDiscountUsage(appliedDiscountId);
              console.log('📈 Usage increment result:', usageResult);
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

  const fieldCls =
    'w-full h-[50px] px-4 bg-heritage-card border border-heritage-input-border rounded-md text-base text-heritage-ink placeholder:text-heritage-soft/70 focus:outline-none focus:border-heritage-copper';
  const labelCls = 'block text-sm font-semibold text-heritage-body mb-1.5';

  return (
    <>
      <div
        className="fixed inset-0 bg-[#5B4636]/85 z-50"
        onClick={onClose}
      />

      <div className="heritage fixed inset-0 flex items-center justify-center z-50 p-3 md:p-4 pointer-events-none">
        <div className="pointer-events-auto bg-heritage-paper rounded-lg shadow-2xl w-full max-w-[1120px] max-h-[94vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-heritage-paper border-b border-heritage-line px-5 md:px-10 h-[72px] md:h-[92px] flex items-center justify-between">
            <h2 className="font-display text-[30px] md:text-[36px] font-semibold text-heritage-ink">Checkout</h2>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full border border-heritage-line flex items-center justify-center hover:bg-heritage-paper-2 transition-colors"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5 text-heritage-ink" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1.15fr_1fr]">
            {/* Delivery Information */}
            <div className="px-5 md:px-10 py-8 space-y-5">
              <h3 className="font-display text-[26px] font-semibold text-heritage-ink">Delivery Information</h3>

              <div>
                <label className={labelCls}>Full Name *</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  className={fieldCls}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    required
                    className={fieldCls}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className={labelCls}>Contact Number *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className={fieldCls}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Shipping Address *</label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className={`${fieldCls} h-[100px] py-3 resize-none`}
                  placeholder="Complete delivery address"
                />
              </div>

              <div>
                <label className={labelCls}>PIN Code *</label>
                <input
                  type="text"
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  className={`${fieldCls} max-w-[240px]`}
                  placeholder="6-digit PIN code"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-heritage-paper-2 px-5 md:px-10 py-8 space-y-5">
              <h3 className="font-display text-[26px] font-semibold text-heritage-ink">Order Summary</h3>

              <div className="space-y-3">
                {cartItems.map((item) => {
                  const resolvedImg = item.product?.name ? getProductImageUrl(item.product.name.toUpperCase()) || item.product?.image_url : item.product?.image_url;
                  const cropped = !!(item.product?.name && getProductImageUrl(item.product.name.toUpperCase()));
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-[52px] h-[52px] rounded bg-heritage-paper overflow-hidden flex-none">
                        {cropped ? (
                          <img src={resolvedImg} alt={item.product?.name} className="absolute left-1/2 top-[52%] w-[260%] max-w-none -translate-x-1/2 -translate-y-1/2" />
                        ) : (
                          <img src={resolvedImg} alt={item.product?.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 text-sm text-heritage-ink font-medium">
                        {item.product?.name}
                        <span className="text-heritage-soft font-normal ml-1">× {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-heritage-ink text-sm">
                        ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Discount Code Section */}
              <div className="border-t border-heritage-line pt-5">
                <p className="text-sm font-semibold text-heritage-ink">Discount Code</p>
                {seasonalCode && (
                  <p className="text-[13px] text-heritage-copper mt-1">
                    Seasonal offer: use <span className="font-mono">{seasonalCode}</span>{seasonalPercent ? ` for ${seasonalPercent}% off` : ''}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => onSetDiscountCode?.(e.target.value.toUpperCase())}
                    placeholder="ENTER DISCOUNT CODE"
                    aria-label="Discount code"
                    className="flex-1 min-w-0 h-[46px] px-4 bg-heritage-card border border-heritage-input-border rounded-md text-[15px] focus:outline-none focus:border-heritage-copper disabled:opacity-60"
                    disabled={isApplyingDiscount || discountValidation?.valid}
                  />
                  {!discountValidation?.valid ? (
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={!discountCode.trim() || isApplyingDiscount}
                      className="h-[46px] px-5 rounded-md border-[1.5px] border-heritage-ink text-heritage-ink font-semibold hover:bg-heritage-ink hover:text-heritage-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      className="h-[46px] px-5 rounded-md border-[1.5px] border-heritage-nonveg text-heritage-nonveg font-semibold hover:bg-heritage-nonveg hover:text-heritage-paper transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>

                {/* Discount Validation Result */}
                {discountValidation && (
                  <div className={`mt-3 p-3 rounded-md flex items-center gap-2 ${
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
                {discountValidation?.valid && (discountValidation.min_order_amount ?? 0) > 0 && (
                  <div className="mt-3 text-xs text-heritage-muted bg-heritage-paper p-2 rounded">
                    💡 Minimum order amount: ₹{(discountValidation.min_order_amount ?? 0).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-heritage-line pt-4 space-y-2.5 text-[15px]">
                <div className="flex justify-between">
                  <span className="text-heritage-muted">Subtotal</span>
                  <span className="text-heritage-ink">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-heritage-muted">Shipping</span>
                  {finalShippingCharge > 0 ? (
                    <span className="text-heritage-ink">₹{finalShippingCharge.toFixed(2)}</span>
                  ) : (
                    <span className="text-heritage-veg font-semibold">Free</span>
                  )}
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-heritage-veg">Discount</span>
                    <span className="text-heritage-veg">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-3">
                  <span className="font-display text-2xl font-semibold text-heritage-ink">Total</span>
                  <span className="font-display text-[32px] font-bold text-heritage-ink">₹{finalAmount.toFixed(2)}</span>
                </div>
                {finalShippingCharge > 0 && (
                  <div className="text-xs text-heritage-soft text-center">
                    Add ₹{(freeShippingThreshold - amountAfterDiscount).toFixed(2)} more for free shipping!
                  </div>
                )}
                {finalShippingCharge === 0 && totalAmount > 0 && (
                  <div className="text-xs text-heritage-veg text-center font-medium">
                    🎉 Free shipping applied!
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="text-xs text-heritage-veg text-center font-medium">
                    🎉 Discount applied! You saved ₹{discountAmount.toFixed(2)}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isProcessingPayment}
                className="w-full h-14 rounded-full bg-heritage-copper text-heritage-paper font-semibold hover:bg-heritage-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              <div className="text-center">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="underline text-heritage-muted hover:text-heritage-ink text-sm min-h-[44px]"
                >
                  Cancel
                </button>
              </div>

              {paymentError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm font-medium">{paymentError}</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
