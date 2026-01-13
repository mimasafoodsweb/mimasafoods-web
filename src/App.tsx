import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase, isDemoMode, demoProducts } from './lib/supabase';
import { Product, CartItem } from './types';
import { getSessionId } from './utils/session';
import { trackAddToCart, trackBeginCheckout, trackPurchase } from './utils/analytics';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import AnalyticsTracker from './components/AnalyticsTracker';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = getSessionId();

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
    
    // Handle GitHub Pages SPA redirect
    const redirect = sessionStorage.getItem('spa-redirect');
    if (redirect) {
      sessionStorage.removeItem('spa-redirect');
      const path = redirect.split('?')[0].split('#')[0];
      const search = redirect.includes('?') ? '?' + redirect.split('?')[1].split('#')[0] : '';
      const hash = redirect.includes('#') ? '#' + redirect.split('#')[1] : '';
      
      // Navigate to the intended route
      window.history.replaceState(null, '', path + search + hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      if (isDemoMode) {
        setProducts(demoProducts);
        return;
      }
      
      const { data, error } = await supabase!
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      if (isDemoMode) {
        setCartItems([]);
        return;
      }
      
      const { data, error } = await supabase!
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('session_id', sessionId);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      if (isDemoMode) {
        alert('Demo mode: Cart functionality is not available. This is a static demo.');
        return;
      }
      
      const existingItem = cartItems.find(
        (item) => item.product_id === product.id
      );

      if (existingItem) {
        await handleUpdateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        const { data, error } = await supabase!
          .from('cart_items')
          .insert({
            session_id: sessionId,
            product_id: product.id,
            quantity: 1,
          })
          .select('*, product:products(*)')
          .single();

        if (error) throw error;
        setCartItems([...cartItems, data]);
      }

      setIsCartOpen(true);
      
      // Track add to cart event
      trackAddToCart(product.name, product.id, product.price);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart. Please try again.');
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      if (isDemoMode) return;
      
      const { error } = await supabase!
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      if (isDemoMode) return;
      
      const { error } = await supabase!
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setCartItems(cartItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    
    // Track begin checkout event
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const items = cartItems.map(item => ({
      item_id: item.product_id,
      item_name: item.product?.name || 'Unknown',
      price: item.product?.price || 0,
      quantity: item.quantity
    }));
    trackBeginCheckout(cartTotal, items);
  };

  const handlePaymentSuccess = (orderNumber: string) => {
    setIsCheckoutOpen(false);
    setOrderNumber(orderNumber);
    setIsOrderSuccessOpen(true);
    
    // Track purchase event - note: this would ideally be called with the actual cart data before clearing
    // For now, we'll track the order completion
    trackPurchase(orderNumber, 0, []); // This should be enhanced with actual order data
    
    // Clear cart after successful payment
    setCartItems([]);
  };

  const handleCloseOrderSuccess = () => {
    setIsOrderSuccessOpen(false);
    setOrderNumber('');
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mimasa-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mimasa-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mimasa-deep text-lg font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AnalyticsTracker />
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-mimasa-cream">
              <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />
              <Hero />
              <ProductGrid products={products} onAddToCart={handleAddToCart} />
              <AboutUs />
              <Footer />

              <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
              />

              <Checkout
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cartItems={cartItems}
                isSubmitting={false}
                onPaymentSuccess={handlePaymentSuccess}
              />

              <OrderSuccess
                isOpen={isOrderSuccessOpen}
                orderNumber={orderNumber}
                onClose={handleCloseOrderSuccess}
                paymentId={undefined} // Will be passed from Checkout in future
                amount={undefined} // Will be passed from Checkout in future
                paymentDate={new Date().toISOString()} // Current date
              />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
