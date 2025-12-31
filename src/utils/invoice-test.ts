import { InvoiceGenerator } from './invoiceGenerator';
import { OrderEmailData } from './email';

// Test data for PDF invoice generation
const testOrderData: OrderEmailData = {
  orderNumber: 'TEST-10270',
  customerName: 'Wasim Imam',
  customerEmail: 'wasim@example.com',
  customerPhone: '9876543210',
  shippingAddress: '123 Test Street\nTest Area\nTest City, Test State',
  pinCode: '123456',
  items: [
    {
      id: '1',
      session_id: 'test_session',
      product_id: '1',
      quantity: 2,
      product: {
        id: '1',
        name: 'BUTTER CHICKEN',
        price: 299.00,
        description: 'Delicious butter chicken curry',
        category: 'curry',
        image_url: '',
        weight: '250g',
        stock_quantity: 50,
        is_active: true
      }
    },
    {
      id: '2',
      session_id: 'test_session',
      product_id: '2',
      quantity: 1,
      product: {
        id: '2',
        name: 'PANEER BUTTER MASALA',
        price: 249.00,
        description: 'Creamy paneer curry',
        category: 'curry',
        image_url: '',
        weight: '250g',
        stock_quantity: 30,
        is_active: true
      }
    },
    {
      id: '3',
      session_id: 'test_session',
      product_id: '3',
      quantity: 1,
      product: {
        id: '3',
        name: 'VEG KOLHAPURI',
        price: 199.00,
        description: 'Spicy vegetable curry',
        category: 'curry',
        image_url: '',
        weight: '250g',
        stock_quantity: 40,
        is_active: true
      }
    },
    {
      id: '4',
      session_id: 'test_session',
      product_id: '4',
      quantity: 1,
      product: {
        id: '4',
        name: 'MUTTON ROGAN JOSH',
        price: 399.00,
        description: 'Traditional mutton curry',
        category: 'curry',
        image_url: '',
        weight: '300g',
        stock_quantity: 20,
        is_active: true
      }
    }
  ],
  subtotal: 1345.00,
  shippingCharge: 0,
  totalAmount: 1345.00,
  paymentId: 'pay_test_123456789',
  orderDate: new Date('2025-09-28').toISOString()
};

/**
 * Test function to verify PDF invoice generation
 * Run this function to test the PDF generation before integration
 */
export async function testPDFInvoiceGeneration(): Promise<void> {
  console.log('🧪 Testing PDF Invoice Generation...');
  
  try {
    const invoiceGenerator = InvoiceGenerator.getInstance();
    
    console.log('📄 Generating optimized PDF invoice...');
    const pdfBase64 = await invoiceGenerator.generateOptimizedPDF(testOrderData);
    const filename = invoiceGenerator.generateInvoiceFilename(testOrderData.orderNumber);
    
    console.log('✅ PDF generated successfully!');
    console.log('📁 Filename:', filename);
    console.log('📏 Size:', pdfBase64.length, 'characters');
    console.log('📊 Approximate size:', Math.round(pdfBase64.length * 0.75 / 1024), 'KB');
    
    // Create download link for testing (in browser environment)
    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = filename;
      link.click();
      console.log('📥 PDF download initiated');
    }
    
    console.log('\n📋 Test Order Summary:');
    console.log('  Order Number:', testOrderData.orderNumber);
    console.log('  Customer:', testOrderData.customerName);
    console.log('  Items:', testOrderData.items.length);
    console.log('  Total Amount:', `₹${testOrderData.totalAmount.toFixed(2)}`);
    console.log('  Payment ID:', testOrderData.paymentId);
    
  } catch (error) {
    console.error('❌ Error testing PDF generation:', error);
    
    if (error instanceof Error) {
      console.log('\n🔧 Troubleshooting Tips:');
      if (error.message.includes('jsPDF')) {
        console.log('• Make sure jsPDF is properly installed');
        console.log('• Check if browser supports PDF generation');
      }
      if (error.message.includes('canvas')) {
        console.log('• Canvas context might be unavailable');
        console.log('• Try running in a browser environment');
      }
    }
  }
}

// Uncomment the following line to test PDF generation
// testPDFInvoiceGeneration();
