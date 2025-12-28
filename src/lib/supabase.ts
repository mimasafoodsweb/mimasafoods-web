import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo data for when Supabase is not configured
const demoProducts = [
  {
    id: '1',
    name: 'Butter Chicken Gravy',
    description: 'Rich and creamy tomato-based curry',
    long_description: 'Authentic North Indian butter chicken gravy made with premium ingredients. Perfect for restaurant-quality taste at home.',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1601010490056-5f2b8c9e6b3f?w=400',
    category: 'gravy',
    weight: '250g',
    stock_quantity: 50,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Tandoori Marinade',
    description: 'Spicy yogurt-based marinade',
    long_description: 'Traditional tandoori marinade with perfect blend of spices. Ideal for chicken, paneer, and vegetables.',
    price: 85,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    category: 'marinade',
    weight: '200g',
    stock_quantity: 30,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

if (isDemoMode) {
  console.warn('Running in demo mode - Supabase credentials not found');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export { demoProducts };
