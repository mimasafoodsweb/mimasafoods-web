import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

interface ManageProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSave: () => void;
}

export default function ManageProductDialog({ isOpen, onClose, product, onSave }: ManageProductDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    long_description: '',
    price: 0,
    image_url: '',
    category: '',
    weight: '',
    stock_quantity: 0,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Category options
  const categories = [
    { value: 'gravy', label: 'Gravy' },
    { value: 'marinade', label: 'Marinade' },
    { value: 'powder', label: 'Powder' }
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        long_description: product.long_description || '',
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        weight: product.weight,
        stock_quantity: product.stock_quantity,
        is_active: product.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        long_description: '',
        price: 0,
        image_url: '',
        category: '',
        weight: '',
        stock_quantity: 0,
        is_active: true
      });
    }
    setError('');
  }, [product, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setIsLoading(true);
    setError('');

    try {
      // First, test if we can read from the database
      console.log('Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id, name')
        .limit(1);
      console.log('Database test:', { testData, testError });

      if (!formData.name || !formData.description || !formData.image_url || !formData.category || !formData.weight) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare data for submission
      const submitData = {
        name: formData.name,
        description: formData.description,
        long_description: formData.long_description,
        price: formData.price,
        image_url: formData.image_url,
        category: formData.category,
        weight: formData.weight,
        stock_quantity: formData.stock_quantity,
        is_active: formData.is_active
      };

      console.log('Submitting data to database:', submitData);

      if (product) {
        console.log('Updating product with ID:', product.id, 'Type:', typeof product.id);

        // First check if product exists
        const { data: existingProduct, error: checkError } = await supabase
          .from('products')
          .select('id, name')
          .eq('id', product.id)
          .single();
        console.log('Product existence check:', { existingProduct, checkError });

        if (checkError || !existingProduct) {
          throw new Error(`Product with ID ${product.id} not found: ${checkError?.message || 'Unknown error'}`);
        }

        console.log('Product exists, proceeding with update...');

        // Check authentication status
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);

        // Try update without .select() first
        const { error: updateError } = await supabase
          .from('products')
          .update(submitData)
          .eq('id', product.id);

        console.log('Update without select:', { updateError });

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }

        // Now verify the update worked
        const { data: verifyData, error: verifyError } = await supabase
          .from('products')
          .select('id, name, description')
          .eq('id', product.id)
          .single();

        console.log('Verification after update:', { verifyData, verifyError });

        if (verifyError) {
          throw new Error(`Update may have failed - verification error: ${verifyError.message}`);
        }

        if (!verifyData) {
          throw new Error('Update verification failed - product not found after update');
        }

        // Check if the data was actually updated
        const dataChanged = verifyData.name !== submitData.name ||
                           verifyData.description !== submitData.description;
        console.log('Data changed:', dataChanged);

        if (!dataChanged) {
          console.warn('Update completed but data may not have changed');
        }
      } else {
        console.log('Inserting new product');
        const { data, error } = await supabase
          .from('products')
          .insert([submitData])
          .select();
        console.log('Insert response:', { data, error });
        if (error) throw error;
      }

      console.log('Product saved successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mimasa-primary focus:border-transparent outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mimasa-primary focus:border-transparent outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
              <textarea
                name="long_description"
                value={formData.long_description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mimasa-primary focus:border-transparent outline-none"
                placeholder="Detailed product description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mimasa-primary focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mimasa-primary focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mimasa-primary focus:border-transparent outline-none"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (e.g., 1kg, 500g) *</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 1kg, 500g"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mimasa-primary focus:border-transparent outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
              <input
                type="text"  // Changed from "url" to "text" to remove URL validation
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="Enter image URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mimasa-primary focus:border-transparent outline-none"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-mimasa-primary focus:ring-mimasa-primary border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Product is active
              </label>
            </div>
          </div>

          <div className="pt-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mimasa-primary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-mimasa-primary hover:bg-mimasa-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mimasa-primary flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {product ? 'Update Product' : 'Add Product'}
                    </>
                  )}
                </button>
              </div>
            </div>
        </form>
      </div>
    </div>
  );
}