// Google Analytics utilities
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics measurement ID not found');
    return;
  }

  // gtag is already loaded in index.html, so we just need to configure it
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
    });
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// E-commerce tracking
interface EcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

export const trackPurchase = (transactionId: string, value: number, items: EcommerceItem[]) => {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  
  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'INR',
    items: items,
  });
};

export const trackAddToCart = (productName: string, productId: string, price: number) => {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  
  window.gtag('event', 'add_to_cart', {
    currency: 'INR',
    value: price,
    items: [{
      item_id: productId,
      item_name: productName,
      price: price,
      quantity: 1
    }]
  });
};

export const trackBeginCheckout = (value: number, items: EcommerceItem[]) => {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  
  window.gtag('event', 'begin_checkout', {
    currency: 'INR',
    value: value,
    items: items,
  });
};
