import ManageProductDialog from './ManageProductDialog';
import CartConfigSettings from './CartConfigSettings';
import { useState, useEffect } from 'react';
import { Package, ShoppingCart, BarChart3, LogOut, Menu, X, Edit, Power, PowerOff, Plus, Eye, Download, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Order, OrderItem } from '../types';
import { InvoiceGenerator } from '../utils/invoiceGenerator';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(10);

  useEffect(() => {
    if (activeMenu === 'products') {
      fetchProducts();
    } else if (activeMenu === 'orders') {
      fetchOrders();
    }
  }, [activeMenu]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    setCurrentOrderPage(1);
  }, [orderPageSize]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data: items, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(items || []);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderDetails(order.id!);
    setIsOrderModalOpen(true);
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      console.log('🔄 Starting download for order:', order.order_number);
      
      // Always fetch fresh order items for this specific order
      const { data: items, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', order.id!);

      if (error) throw error;
      
      const currentOrderItems = items || [];
      console.log('📦 Fetched order items:', currentOrderItems.length);
      
      // Calculate subtotal from order items
      const calculatedSubtotal = currentOrderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const shippingCharge = order.shipping_charge || 0;
      
      console.log('💰 Calculated amounts:', {
        subtotal: calculatedSubtotal,
        shipping: shippingCharge,
        total: order.total_amount
      });
      
      // Convert order to OrderEmailData format for InvoiceGenerator
      const orderEmailData = {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: order.shipping_address,
        pinCode: order.pin_code,
        orderDate: order.created_at || new Date().toISOString(),
        paymentId: order.id || '',
        subtotal: order.subtotal || calculatedSubtotal,
        shippingCharge: shippingCharge,
        totalAmount: order.total_amount,
        items: currentOrderItems.map(item => ({
          id: item.order_id + '_' + item.product_id, // Create a unique ID
          session_id: '', // Not needed for invoice
          product_id: item.product_id,
          quantity: item.quantity,
          product: {
            id: item.product_id,
            name: item.product_name,
            description: '',
            price: item.product_price,
            image_url: '',
            category: '',
            weight: '',
            stock_quantity: 0,
            is_active: true
          }
        }))
      };

      console.log('📄 Generating PDF with items:', orderEmailData.items.length);
      const invoiceGenerator = InvoiceGenerator.getInstance();
      const pdfBase64 = await invoiceGenerator.generateOptimizedPDF(orderEmailData);
      const invoiceFilename = invoiceGenerator.generateInvoiceFilename(order.order_number);
      
      // Convert base64 to blob and download
      const binaryString = atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = invoiceFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Invoice downloaded: ${invoiceFilename}`);
    } catch (error) {
      console.error('❌ Error downloading invoice:', error);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(products.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Order pagination calculations
  const totalOrderPages = Math.ceil(orders.length / orderPageSize);
  const orderStartIndex = (currentOrderPage - 1) * orderPageSize;
  const orderEndIndex = orderStartIndex + orderPageSize;
  const paginatedOrders = orders.slice(orderStartIndex, orderEndIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handleOrderPageChange = (page: number) => {
    setCurrentOrderPage(page);
  };

  const handleOrderPageSizeChange = (newPageSize: number) => {
    setOrderPageSize(newPageSize);
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, is_active: !currentStatus }
          : product
      ));
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const handleEditProduct = (productId: string) => {
    const productToEdit = products.find(p => p.id === productId);
    if (productToEdit) {
      setSelectedProduct(productToEdit);
      setIsDialogOpen(true);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setIsDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    console.log('Refreshing products after save...');
    await fetchProducts();
    console.log('Products refreshed, current count:', products.length);
    console.log('First product:', products[0]);
    setIsDialogOpen(false);
    setSelectedProduct(undefined);
  };

  const menuItems = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-mimasa-deep">Products Management</h2>
              <button 
                onClick={handleAddProduct}
                className="bg-mimasa-primary text-white px-4 py-2 rounded-lg hover:bg-mimasa-primary/90 transition flex items-center gap-2"
              >
                <Plus size={16} /> Add New Product
              </button>
            </div>
            
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-16 h-16 border-4 border-mimasa-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-mimasa-deep text-lg font-medium">Loading products...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.weight}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.stock_quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditProduct(product.id)}
                                className="text-blue-600 hover:text-blue-900 transition"
                                title="Edit Product"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleToggleProductStatus(product.id, product.is_active)}
                                className={`${product.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition`}
                                title={product.is_active ? 'Deactivate Product' : 'Activate Product'}
                              >
                                {product.is_active ? <PowerOff size={16} /> : <Power size={16} />}
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
              </div>
            )}
            <ManageProductDialog
              isOpen={isDialogOpen}
              onClose={() => {
                setIsDialogOpen(false);
                setSelectedProduct(undefined);
              }}
              product={selectedProduct}
              onSave={handleSaveProduct}
            />
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-mimasa-deep">Orders Management</h2>

            {isLoading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-16 h-16 border-4 border-mimasa-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-mimasa-deep text-lg font-medium">Loading orders...</p>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                      <p className="text-sm text-gray-600">Manage customer orders and view details</p>
                    </div>
                    {orders.length > 0 && (
                      <div className="text-sm text-gray-600">
                        Showing {orderStartIndex + 1} to {Math.min(orderEndIndex, orders.length)} of {orders.length} orders
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-mimasa-primary hover:text-mimasa-primary/80 font-medium text-sm underline"
                            >
                              {order.order_number}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(order.created_at || '').toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{order.total_amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : order.payment_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.payment_status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.payment_status || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewOrder(order)}
                                className="text-blue-600 hover:text-blue-900 transition"
                                title="View Order Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleDownloadInvoice(order)}
                                className="text-green-600 hover:text-green-900 transition"
                                title="Download Invoice"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Order Pagination Controls */}
                  {orders.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Show</span>
                        <select
                          value={orderPageSize}
                          onChange={(e) => handleOrderPageSizeChange(Number(e.target.value))}
                          className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-mimasa-primary"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-700">entries</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOrderPageChange(currentOrderPage - 1)}
                          disabled={currentOrderPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Previous
                        </button>
                        
                        <span className="text-sm text-gray-700">
                          Page {currentOrderPage} of {totalOrderPages}
                        </span>
                        
                        <button
                          onClick={() => handleOrderPageChange(currentOrderPage + 1)}
                          disabled={currentOrderPage === totalOrderPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  {orders.length === 0 && (
                    <div className="px-6 py-12 text-center">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                      <p className="mt-1 text-sm text-gray-500">No orders have been placed yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Details Modal */}
            {isOrderModalOpen && selectedOrder && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Order Details - {selectedOrder.order_number}</h3>
                    <button
                      onClick={() => setIsOrderModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Customer Information</h4>
                        <p className="text-sm text-gray-600">{selectedOrder.customer_name}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Shipping Address</h4>
                        <p className="text-sm text-gray-600">{selectedOrder.shipping_address}</p>
                        <p className="text-sm text-gray-600">PIN: {selectedOrder.pin_code}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orderItems.map((item: OrderItem, index: number) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">₹{item.product_price}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">₹{item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="flex justify-end pt-4 border-t">
                      <div className="text-right space-y-2">
                        <div className="flex justify-between gap-8">
                          <span className="text-sm text-gray-600">Subtotal:</span>
                          <span className="text-sm text-gray-900">₹{selectedOrder.subtotal || 0}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="text-sm text-gray-600">Shipping:</span>
                          <span className="text-sm text-gray-900">
                            {selectedOrder.shipping_charge ? `₹${selectedOrder.shipping_charge}` : 'FREE'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-8 pt-2 border-t">
                          <span className="text-lg font-medium text-gray-900">Total:</span>
                          <span className="text-lg font-medium text-gray-900">₹{selectedOrder.total_amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-mimasa-deep">Reports</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">Reports dashboard coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return <CartConfigSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-mimasa-cream flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`font-bold text-xl text-mimasa-deep ${!isSidebarOpen && 'hidden'}`}>
              Admin Panel
            </h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-mimasa-primary transition"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeMenu === item.id
                      ? 'bg-mimasa-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {isSidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={20} />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
}