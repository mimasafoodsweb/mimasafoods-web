import { supabase } from '../lib/supabase';

export interface CartConfig {
  id: string;
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get cart configuration value by name
 */
export async function getCartConfigValue(name: string): Promise<string | null> {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }

    const { data, error } = await supabase
      .from('cart_config')
      .select('value')
      .eq('name', name)
      .single();

    if (error) {
      console.error(`Error fetching cart config '${name}':`, error);
      return null;
    }

    return data?.value || null;
  } catch (error) {
    console.error(`Error fetching cart config '${name}':`, error);
    return null;
  }
}

/**
 * Get shipping charge from cart configuration
 */
export async function getShippingCharge(): Promise<number> {
  const shippingValue = await getCartConfigValue('shipping');
  return shippingValue ? parseFloat(shippingValue) : 0;
}

/**
 * Get free shipping threshold from cart configuration
 */
export async function getFreeShippingThreshold(): Promise<number> {
  const thresholdValue = await getCartConfigValue('free_shipping');
  return thresholdValue ? parseFloat(thresholdValue) : 500;
}

/**
 * Get all cart configurations
 */
export async function getAllCartConfigs(): Promise<CartConfig[]> {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return [];
    }

    const { data, error } = await supabase
      .from('cart_config')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching cart configs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching cart configs:', error);
    return [];
  }
}

/**
 * Update cart configuration value (admin function)
 */
export async function updateCartConfig(name: string, value: string): Promise<boolean> {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return false;
    }

    const { error } = await supabase
      .from('cart_config')
      .upsert({ name, value }, { onConflict: 'name' });

    if (error) {
      console.error(`Error updating cart config '${name}':`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error updating cart config '${name}':`, error);
    return false;
  }
}
