import { EmailService, OrderEmailData } from './email';
import { CartItem } from '../types';

// Test data for email functionality
const testOrderData: OrderEmailData = {
  orderNumber: 'TEST-ORDER-001',
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerPhone: '9876543210',
  shippingAddress: '123 Test Street, Test Area\nTest City, Test State',
  pinCode: '123456',
  items: [
    {
      id: '1',
      product: {
        id: '1',
        name: 'Test Product 1',
        price: 299.99,
        description: 'Test description',
        category: 'test',
        image_url: ''
      },
      quantity: 2
    },
    {
      id: '2',
      product: {
        id: '2',
        name: 'Test Product 2',
        price: 199.99,
        description: 'Test description 2',
        category: 'test',
        image_url: ''
      },
      quantity: 1
    }
  ] as CartItem[],
  subtotal: 799.97,
  shippingCharge: 70,
  totalAmount: 869.97,
  paymentId: 'pay_test_123456789',
  orderDate: new Date().toISOString()
};

/**
 * Test function to verify email service functionality
 * Run this function to test the email service before deployment
 */
export async function testEmailService(): Promise<void> {
  console.log('Testing BREVO Email Service...');
  
  try {
    const emailService = EmailService.getInstance();
    const result = await emailService.sendOrderConfirmationEmail(testOrderData);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Test email sent to:', testOrderData.customerEmail);
      console.log('BCC email sent to: mimasafoods@gmail.com');
    } else {
      console.error('❌ Failed to send email:', result.error);
      
      if (result.error?.includes('API key is not configured')) {
        console.log('\n📝 To fix this issue:');
        console.log('1. Make sure you have VITE_BREVO_API_KEY in your .env.local file');
        console.log('2. Get your API key from: https://app.brevo.com/settings/keys/api');
        console.log('3. Add it to your environment: VITE_BREVO_API_KEY=your_actual_api_key');
      }
    }
  } catch (error) {
    console.error('❌ Error testing email service:', error);
  }
}

// Uncomment the following line to test the email service
// testEmailService();
