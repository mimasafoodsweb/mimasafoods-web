import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Power, PowerOff, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ManageDiscountDialog from './ManageDiscountDialog';

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  usage_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (discountId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: !currentStatus })
        .eq('id', discountId);

      if (error) throw error;

      setDiscounts(discounts.map(discount => 
        discount.id === discountId 
          ? { ...discount, is_active: !currentStatus }
          : discount
      ));
    } catch (error) {
      console.error('Error updating discount status:', error);
    }
  };

  const handleDelete = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', discountId);

      if (error) throw error;

      setDiscounts(discounts.filter(discount => discount.id !== discountId));
    } catch (error) {
      console.error('Error deleting discount code:', error);
    }
  };

  const handleAddDiscount = () => {
    setSelectedDiscount(null);
    setIsDialogOpen(true);
  };

  const handleEditDiscount = (discount: DiscountCode) => {
    setSelectedDiscount(discount);
    setIsDialogOpen(true);
  };

  const handleSaveDiscount = () => {
    fetchDiscounts();
    setIsDialogOpen(false);
    setSelectedDiscount(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDiscount(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(discounts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDiscounts = discounts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDiscountValue = (discount: DiscountCode) => {
    if (discount.discount_type === 'percentage') {
      return `${discount.discount_value}%`;
    }
    return `₹${discount.discount_value}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-mimasa-deep">Discount Codes Management</h2>
        <button 
          onClick={handleAddDiscount}
          className="bg-mimasa-primary text-white px-4 py-2 rounded-lg hover:bg-mimasa-primary/90 transition flex items-center gap-2"
        >
          <Plus size={16} /> Add New Discount
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 border-4 border-mimasa-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mimasa-deep text-lg font-medium">Loading discount codes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{discount.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{discount.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        discount.discount_type === 'percentage' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {discount.discount_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDiscountValue(discount)}
                      {discount.min_order_amount > 0 && (
                        <div className="text-xs text-gray-500">Min: ₹{discount.min_order_amount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {discount.usage_count}
                      {discount.usage_limit && (
                        <div className="text-xs text-gray-500">/ {discount.usage_limit}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(discount.expires_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        discount.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {discount.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditDiscount(discount)}
                          className="text-green-600 hover:text-green-900 transition"
                          title="Edit Discount"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(discount.id, discount.is_active)}
                          className={`${discount.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition`}
                          title={discount.is_active ? 'Deactivate Discount' : 'Activate Discount'}
                        >
                          {discount.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="text-red-600 hover:text-red-900 transition"
                          title="Delete Discount"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-mimasa-primary"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>

          {discounts.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">No discount codes</h3>
              <p className="mt-1 text-sm text-gray-500">No discount codes have been created yet.</p>
            </div>
          )}
        </div>
      )}
      
      <ManageDiscountDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        discount={selectedDiscount}
        onSave={handleSaveDiscount}
      />
    </div>
  );
}
