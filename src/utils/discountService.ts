import { supabase } from '../lib/supabase';

export interface DiscountValidationResult {
  valid: boolean;
  discount_amount: number;
  message: string;
  discount_id: string | null;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  min_order_amount?: number;
  max_discount_amount?: number;
}

export const validateDiscountCode = async (code: string, orderAmount: number): Promise<DiscountValidationResult> => {
  try {
    const { data, error } = await supabase
      .rpc('validate_discount_code', {
        code_input: code,
        order_amount: orderAmount
      });

    if (error) throw error;

    if (data && data.length > 0) {
      const result = data[0];
      
      // Try to fetch discount details for min_order_amount, but don't fail if it doesn't work
      let minOrderAmount = 0;
      try {
        const { data: discountDetails } = await supabase
          .from('discount_codes')
          .select('min_order_amount')
          .eq('code', code)
          .single();
        
        minOrderAmount = discountDetails?.min_order_amount || 0;
      } catch (detailError) {
        console.warn('Could not fetch discount details:', detailError);
        // Use a default or extract from the validation message if possible
        const match = result.message.match(/Minimum order amount not met.*?₹([\d.]+)/);
        if (match) {
          minOrderAmount = parseFloat(match[1]);
        }
      }

      return {
        valid: result.valid,
        discount_amount: parseFloat(result.discount_amount) || 0,
        message: result.message,
        discount_id: result.discount_id,
        min_order_amount: minOrderAmount
      };
    }

    return {
      valid: false,
      discount_amount: 0,
      message: 'Invalid discount code',
      discount_id: null
    };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return {
      valid: false,
      discount_amount: 0,
      message: 'Error validating discount code',
      discount_id: null
    };
  }
};

export const incrementDiscountUsage = async (discountId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .rpc('increment_discount_usage', {
        discount_id: discountId
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error incrementing discount usage:', error);
    return false;
  }
};

export const getDiscountCodeDetails = async (code: string) => {
  try {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching discount code details:', error);
    return null;
  }
};
