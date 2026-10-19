import { useEffect, useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { getFreeShippingThreshold } from '../utils/cartConfig';
import { CartItem } from '../types';
import { getProductImageUrl } from '../utils/images';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartProps) {
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);
  useEffect(() => {
    getFreeShippingThreshold().then(setFreeShippingThreshold).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const progress = freeShippingThreshold > 0 ? Math.min(100, (totalAmount / freeShippingThreshold) * 100) : 100;
  const qualifies = totalAmount >= freeShippingThreshold;

  return (
    <>
      <div
        className="fixed inset-0 bg-[#5B4636]/85 z-50"
        onClick={onClose}
      />

      <div className="heritage fixed right-0 top-0 h-full w-full max-w-md bg-heritage-paper shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 h-[92px] border-b border-heritage-line flex-none">
          <h2 className="font-display text-[32px] font-semibold text-heritage-ink">
            Your Cart <span className="font-body text-base font-normal text-heritage-soft">({totalItems})</span>
          </h2>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full border border-heritage-line flex items-center justify-center hover:bg-heritage-paper-2 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-heritage-ink" />
          </button>
        </div>

        {cartItems.length > 0 && (
          <div className="bg-heritage-paper-3 border-b border-heritage-line px-6 py-4 flex-none">
            <p className={`text-sm font-semibold mb-2 ${qualifies ? 'text-heritage-veg' : 'text-heritage-copper'}`}>
              {qualifies
                ? 'You qualify for FREE delivery!'
                : `Add ₹${(freeShippingThreshold - totalAmount).toFixed(2)} more for FREE delivery`}
            </p>
            <div className="h-1.5 rounded-full bg-heritage-line-2 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-heritage-copper transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto text-heritage-line mb-4" />
              <p className="text-heritage-muted text-lg">Your cart is empty</p>
              <button
                onClick={onClose}
                className="mt-4 text-heritage-copper hover:text-heritage-ink font-semibold underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-heritage-line">
              {cartItems.map((item) => {
                const assetImg = item.product?.name ? getProductImageUrl(item.product.name.toUpperCase()) : undefined;
                const img = assetImg || item.product?.image_url;
                return (
                  <div key={item.id} className="flex gap-4 py-5">
                    <div className="relative w-[84px] h-24 flex-none bg-heritage-paper-2 rounded-t-[42px] rounded-b-[3px] overflow-hidden">
                      {assetImg ? (
                        <img src={img} alt={item.product?.name} className="absolute left-1/2 top-[52%] w-[250%] max-w-none -translate-x-1/2 -translate-y-1/2" />
                      ) : (
                        <img src={img} alt={item.product?.name} className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-[21px] font-semibold text-heritage-ink leading-tight">
                        {item.product?.name}
                      </h3>
                      <p className="text-[13px] text-heritage-soft mt-1">
                        {item.product?.weight} · ₹{item.product?.price}
                      </p>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="inline-flex items-center h-9 rounded-full border border-heritage-input-border">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="w-9 h-9 flex items-center justify-center hover:text-heritage-copper"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-7 text-center font-semibold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center hover:text-heritage-copper"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-heritage-nonveg underline text-sm font-medium min-h-[44px]"
                        >
                          Remove
                        </button>
                        <span className="ml-auto font-display text-xl font-bold text-heritage-ink">
                          ₹{((item.product?.price || 0) * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-heritage-line bg-heritage-card px-6 pt-5 pb-6 flex-none">
            <div className="flex justify-between text-heritage-muted pb-4 border-b border-heritage-line">
              <span>Items ({totalItems})</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline py-4">
              <span className="font-display text-2xl font-semibold text-heritage-ink">Total</span>
              <span className="font-display text-[30px] font-bold text-heritage-ink">₹{totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full h-[54px] rounded-full bg-heritage-copper text-heritage-paper font-semibold hover:bg-heritage-ink transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
