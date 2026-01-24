// Test script for send-order-email Supabase Edge Function
// Run with: node test-send-email.js

const testOrderData = {
  orderData: {
    orderNumber: 'MF_TEST_2025_001',
    orderDate: new Date().toISOString(),
    paymentId: 'pay_test_123456789',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com', // Change to your email for testing
    customerPhone: '+91 9876543210',
    shippingAddress: '123 Test Street, Test Area',
    pinCode: '411001',
    items: [
      {
        product: {
          name: 'Butter Chicken',
          price: 299.00
        },
        quantity: 2
      },
      {
        product: {
          name: 'Paneer Tikka Masala',
          price: 249.00
        },
        quantity: 1
      }
    ],
    subtotal: 847.00,
    shippingCharge: 0.00,
    discountAmount: 50.00, // Test discount amount
    totalAmount: 797.00
  },
  pdfAttachment: 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9MZW5ndGggMTAwLj4+PnN0cmVhbQpCVAoKZW5kc3RyZWFtCmVuZG9iagoyIDAgb2JqCjw8L1R5cGUvUGFnZS9QYXJlbnQgMSAwIFIvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXT4+CmVuZG9iagoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1syIDAgUl0+PgplbmRvYmoKNCAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMyAwIFI+PgplbmRvYmoKNSAwIG9iago8PC9DcmVhdG9yKHRlc3QpL1Byb2R1Y2VyKHRlc3QpPj4KZW5kb2JqCnhyZWYKNSAwCjYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTczIDAwMDAwIG4gCjAwMDAwMDAyMzEgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDUvUm9vdCA0IDAgUi9JbmZvIDUgMCBSPj4Kc3RhcnR4cmVmCjI2NgolJUVPRgo=' // Base64 encoded minimal PDF for testing
};

async function testSendEmail() {
  try {
    console.log('🧪 Testing send-order-email Edge Function...');
    console.log('📧 Test data:', {
      orderNumber: testOrderData.orderData.orderNumber,
      customerEmail: testOrderData.orderData.customerEmail,
      subtotal: testOrderData.orderData.subtotal,
      discountAmount: testOrderData.orderData.discountAmount,
      totalAmount: testOrderData.orderData.totalAmount
    });

    // Replace with your Supabase URL and Anon Key
    const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
    const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

    const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Response:', result);
    } else {
      console.error('❌ Failed to send email:', result);
      console.error('🔍 Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing email function:', error);
  }
}

// Instructions for running this test:
console.log(`
📋 To test the send-order-email Edge Function:

1. Update the following variables in this script:
   - supabaseUrl: Your Supabase project URL
   - supabaseAnonKey: Your Supabase anon key
   - customerEmail: Your email address to receive the test email

2. Deploy the updated Edge Function:
   cd /Users/vijaykumardixit/mimasa-website/mimasafoods-web
   supabase functions deploy send-order-email

3. Run this test:
   node test-send-email.js

4. Check your email for the test order confirmation with discount display!

📧 Expected email content should show:
   Subtotal: Rs.847.00
   Shipping: FREE
   Discount: -Rs.50.00    ← Should appear in green
   Total Amount: Rs.797.00
`);

// Uncomment to run the test after updating the variables
// testSendEmail();
