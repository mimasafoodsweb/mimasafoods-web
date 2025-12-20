import { CheckCircle, Package } from 'lucide-react';

interface OrderSuccessProps {
  isOpen: boolean;
  orderNumber: string;
  onClose: () => void;
}

export default function OrderSuccess({
  isOpen,
  orderNumber,
  onClose,
}: OrderSuccessProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h2>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Package className="w-5 h-5 text-[mimasa-primary]" />
              <span className="text-gray-600 font-medium">Order Number</span>
            </div>
            <p className="text-2xl font-bold text-[mimasa-primary]">{orderNumber}</p>
          </div>

          <p className="text-gray-600 mb-8">
            Thank you for your order! We'll send a confirmation email shortly
            with tracking details.
          </p>

          <button
            onClick={onClose}
            className="w-full bg-[mimasa-primary] text-white font-bold py-4 rounded-full hover:bg-[mimasa-deep] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}
