import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DiscountCode {
  id?: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  expires_at: string;
  is_active: boolean;
}

interface ManageDiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  discount: DiscountCode | null;
  onSave: () => void;
}

export default function ManageDiscountDialog({ isOpen, onClose, discount, onSave }: ManageDiscountDialogProps) {
  const [formData, setFormData] = useState<DiscountCode>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    expires_at: '',
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (discount) {
      setFormData({
        ...discount,
        expires_at: discount.expires_at ? new Date(discount.expires_at).toISOString().split('T')[0] : '',
        max_discount_amount: discount.max_discount_amount || 0,
        usage_limit: discount.usage_limit || 0,
      });
    } else {
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_order_amount: 0,
        max_discount_amount: 0,
        usage_limit: 0,
        expires_at: '',
        is_active: true,
      });
    }
    setError('');
  }, [discount, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        max_discount_amount: formData.max_discount_amount > 0 ? formData.max_discount_amount : null,
        usage_limit: formData.usage_limit > 0 ? formData.usage_limit : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      };

      console.log('🔍 Saving discount data:', submitData);

      if (discount?.id) {
        // Update existing discount
        console.log('📝 Updating discount with ID:', discount.id);
        const { data, error } = await supabase
          .from('discount_codes')
          .update(submitData)
          .eq('id', discount.id)
          .select();

        console.log('📊 Update response:', { data, error });

        if (error) {
          console.error('❌ Supabase update error:', error);
          throw error;
        }
      } else {
        // Create new discount
        console.log('➕ Creating new discount');
        const { data, error } = await supabase
          .from('discount_codes')
          .insert(submitData)
          .select();

        console.log('📊 Insert response:', { data, error });

        if (error) {
          console.error('❌ Supabase insert error:', error);
          throw error;
        }
      }

      console.log('✅ Discount saved successfully');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('❌ Error saving discount:', error);
      setError(error.message || 'Failed to save discount code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {discount ? 'Edit Discount Code' : 'Add New Discount Code'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="e.g., SAVE20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mimasa-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mimasa-primary"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Optional description for this discount code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mimasa-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">
                  {formData.discount_type === 'percentage' ? '%' : '₹'}
                </span>
                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mimasa-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mimasa-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.discount_type === 'percentage' ? 'Maximum Discount Amount' : 'Usage Limit'}
              </label>
              <div className="relative">
                {formData.discount_type === 'percentage' ? (
                  <>
                    <span className="absolute left-3 top-2 text-gray-500">₹</span>
                    <input
                      type="number"
                      name="max_discount_amount"
                      value={formData.max_discount_amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="No limit"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mimasa-primary"
                    />
                  </>
                ) : (
                  <input
                    type="number"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={handleChange}
                    min="0"
                    placeholder="No limit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mimasa-primary"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mimasa-primary"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-mimasa-primary focus:ring-mimasa-primary border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-mimasa-primary text-white rounded-md hover:bg-mimasa-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : discount ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
