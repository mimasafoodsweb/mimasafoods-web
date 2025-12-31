import jsPDF from 'jspdf';
import { OrderEmailData } from './email';
import { LogoLoader } from './logo-loader';

export interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
  logoPath: string;
}

export class InvoiceGenerator {
  private static instance: InvoiceGenerator;
  private companyInfo: CompanyInfo;

  private constructor() {
    this.companyInfo = {
      name: 'Mimasa Foods Pvt Ltd',
      address: 'Plot no 3, Kshitij, Sanjwat CHS,669/2, Bibwewadi, Pune Maharashtra, India, Pin: 411037',
      email: 'mimasafoods@gmail.com',
      phone: '+91 84217 94918',
      logoPath: '/public/MimasaLogo.jpg'
    };
  }

  public static getInstance(): InvoiceGenerator {
    if (!InvoiceGenerator.instance) {
      InvoiceGenerator.instance = new InvoiceGenerator();
    }
    return InvoiceGenerator.instance;
  }

  /**
   * Generate optimized PDF without logo to reduce size
   */
  public async generateOptimizedPDF(orderData: OrderEmailData): Promise<string> {
    try {
      console.log('📄 Generating optimized PDF (no logo) for order:', orderData.orderNumber);
      
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Set margins
      const margin = 20;
      
      let yPosition = margin;

      // Header with logo on left, company info on right
      try {
        // Logo on left side - moved up slightly
        const logoSize = 20; // 20mm x 20mm for smaller square logo
        const logoX = margin;
        const logoY = yPosition - 5; // Move logo up by 5mm
        
        if (typeof window !== 'undefined') {
          // Browser environment - try to load actual logo
          try {
            const logoBase64 = await LogoLoader.getMimasaLogo();
            pdf.addImage(logoBase64, 'JPEG', logoX, logoY, logoSize, logoSize);
            console.log('✅ Added small square Mimasa logo');
          } catch (logoError) {
            console.warn('⚠️  Could not load logo, using text-only header');
            // Fallback to text
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text(this.companyInfo.name, margin, yPosition);
          }
        } else {
          // Node.js environment - no logo available
          console.log('📄 Node.js environment - using text-only header');
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(this.companyInfo.name, margin, yPosition);
        }
        
        // Company name and address in right column
        const companyInfoX = margin + logoSize + 10; // 10mm spacing from logo
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(this.companyInfo.name, companyInfoX, yPosition);
        
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(this.companyInfo.address, companyInfoX, yPosition);
        
      } catch (error) {
        console.warn('⚠️  Could not add logo, using text-only header:', error);
        // Fallback to text-only header
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(this.companyInfo.name, margin, yPosition);
        
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(this.companyInfo.address, margin, yPosition);
      }
      
      yPosition += 15;

      // Invoice details centered
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const invoiceText = 'INVOICE';
      const invoiceTextWidth = pdf.getTextWidth(invoiceText);
      pdf.text(invoiceText, (pageWidth - invoiceTextWidth) / 2, yPosition);
      
      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Order Number: ${orderData.orderNumber}`, pageWidth - margin - 50, yPosition);
      
      yPosition += 6;
      pdf.text(`Date: ${new Date(orderData.orderDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, pageWidth - margin - 50, yPosition);

      yPosition += 15;

      // Billing and Shipping Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', margin, yPosition);
      
      yPosition += 7;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(orderData.customerName, margin, yPosition);
      
      yPosition += 5;
      pdf.text(orderData.customerEmail, margin, yPosition);
      
      yPosition += 5;
      pdf.text(orderData.customerPhone, margin, yPosition);
      
      yPosition += 5;
      // Handle multi-line address
      const addressLines = orderData.shippingAddress.split('\n');
      addressLines.forEach(line => {
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 5;
      pdf.text(`${orderData.pinCode}`, margin, yPosition);

      // Order Items Table
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order Items', margin, yPosition);
      
      yPosition += 10;
      
      // Table headers
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Product', margin, yPosition);
      pdf.text('Qty', margin + 100, yPosition);
      pdf.text('Price (INR)', margin + 120, yPosition);
      pdf.text('Total (INR)', margin + 150, yPosition);
      
      yPosition += 7;
      
      // Table line
      pdf.setLineWidth(0.1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 7;
      
      // Table items
      pdf.setFont('helvetica', 'normal');
      orderData.items.forEach((item) => {
        const productName = item.product?.name || 'Product';
        const quantity = item.quantity;
        const unitPrice = item.product?.price || 0;
        const totalPrice = unitPrice * quantity;
        
        // Handle long product names
        const maxNameWidth = 95;
        const nameLines = this.splitText(pdf, productName, maxNameWidth);
        
        nameLines.forEach((line, lineIndex) => {
          pdf.text(line, margin, yPosition);
          if (lineIndex === 0) {
            pdf.text(quantity.toString(), margin + 100, yPosition);
            pdf.text(`${unitPrice.toFixed(2)}`, margin + 120, yPosition);
            pdf.text(`${totalPrice.toFixed(2)}`, margin + 150, yPosition);
          }
          yPosition += 5;
        });
        
        yPosition += 2;
      });
      
      // Table bottom line
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 15;
      
      // Summary Section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order Summary', margin, yPosition);
      
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Subtotal:', margin + 120, yPosition);
      pdf.text(`${orderData.subtotal.toFixed(2)}`, margin + 150, yPosition);
      
      yPosition += 7;
      
      if (orderData.shippingCharge > 0) {
        pdf.text('Shipping:', margin + 120, yPosition);
        pdf.text(`${orderData.shippingCharge.toFixed(2)}`, margin + 150, yPosition);
        yPosition += 7;
      } else {
        pdf.text('Shipping:', margin + 120, yPosition);
        pdf.text('FREE', margin + 150, yPosition);
        yPosition += 7;
      }
      
      // Total line
      pdf.setLineWidth(0.2);
      pdf.line(margin + 115, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 7;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Total Amount:', margin + 120, yPosition);
      pdf.text(`${orderData.totalAmount.toFixed(2)}`, margin + 150, yPosition);
      
      // Payment Information
      yPosition += 20;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Payment ID: ${orderData.paymentId}`, margin, yPosition);
      
      yPosition += 7;
      pdf.text('Payment Method: Razorpay', margin, yPosition);
      
      // Company Footer (Optimized PDF)
      yPosition = pageHeight - 30;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Thank you for choosing Mimasa Foods Pvt Ltd!', margin, yPosition);
      
      yPosition += 5;
      pdf.text(`${this.companyInfo.email} | ${this.companyInfo.phone}`, margin, yPosition);
      
      // Convert PDF to base64
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      console.log('✅ Optimized PDF invoice generated successfully');
      
      return pdfBase64;
    } catch (error) {
      console.error('❌ Error generating optimized PDF invoice:', error);
      throw new Error('Failed to generate optimized PDF invoice');
    }
  }

  /**
   * Generate PDF invoice as base64 string for email attachment
   */
  public async generateInvoicePDF(orderData: OrderEmailData): Promise<string> {
    try {
      console.log('📄 Generating PDF invoice for order:', orderData.orderNumber);
      
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Set margins
      const margin = 20;
      
      let yPosition = margin;

      // Header Section with Logo and Company Info
      try {
        // Try to load the actual logo
        let logoBase64: string;
        
        if (typeof window !== 'undefined') {
          // Browser environment - try to load actual image
          try {
            logoBase64 = await LogoLoader.getMimasaLogo();
            console.log('✅ Loaded actual Mimasa logo');
          } catch (logoError) {
            console.warn('⚠️  Could not load actual logo, using text fallback:', logoError);
            logoBase64 = LogoLoader.createTextLogo();
          }
        } else {
          // Server environment - use text fallback
          logoBase64 = LogoLoader.createTextLogo();
        }
        
        // Add logo to PDF with better aspect ratio
        pdf.addImage(logoBase64, 'PNG', margin, yPosition, 40, 25); // Increased size for better quality
        
        // Company name next to logo
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(this.companyInfo.name, margin + 50, yPosition + 10);
        
        // Company address below company name
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const addressLines = this.splitText(pdf, this.companyInfo.address, pageWidth - margin - 40);
        addressLines.forEach((line, index) => {
          pdf.text(line, margin + 50, yPosition + 18 + (index * 5));
        });
        
        // GST and PAN below address
        yPosition += 18 + (addressLines.length * 5);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('GST: 27AAAPM1234C1ZV | PAN: AAAPM1234C', margin + 50, yPosition);
        
        yPosition += 10;
        
      } catch (error) {
        console.warn('⚠️  Could not add logo, using text-only header:', error);
        // Fallback to text-only header
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(this.companyInfo.name, margin, yPosition);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(this.companyInfo.address, margin, yPosition + 7);
        
        pdf.setFontSize(9);
        pdf.text('GST: 27AAAPM1234C1ZV | PAN: AAAPM1234C', margin, yPosition + 14);
        
        yPosition += 30;
      }

      // Invoice details centered
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const invoiceText = 'INVOICE';
      const invoiceTextWidth = pdf.getTextWidth(invoiceText);
      pdf.text(invoiceText, (pageWidth - invoiceTextWidth) / 2, yPosition);
      
      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Order Number: ${orderData.orderNumber}`, pageWidth - margin - 50, yPosition);
      
      yPosition += 6;
      pdf.text(`Date: ${new Date(orderData.orderDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, pageWidth - margin - 50, yPosition);

      yPosition += 15;

      // Billing and Shipping Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', margin, yPosition);
      
      yPosition += 7;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(orderData.customerName, margin, yPosition);
      
      yPosition += 5;
      pdf.text(orderData.customerEmail, margin, yPosition);
      
      yPosition += 5;
      pdf.text(orderData.customerPhone, margin, yPosition);
      
      yPosition += 5;
      // Handle multi-line address
      const addressLines = orderData.shippingAddress.split('\n');
      addressLines.forEach(line => {
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 5;
      pdf.text(`${orderData.pinCode}`, margin, yPosition);

      // Order Items Table
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order Items', margin, yPosition);
      
      yPosition += 10;
      
      // Table headers
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Product', margin, yPosition);
      pdf.text('Qty', margin + 100, yPosition);
      pdf.text('Price (INR)', margin + 120, yPosition);
      pdf.text('Total (INR)', margin + 150, yPosition);
      
      yPosition += 7;
      
      // Table line
      pdf.setLineWidth(0.1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 7;
      
      // Table items
      pdf.setFont('helvetica', 'normal');
      orderData.items.forEach((item) => {
        const productName = item.product?.name || 'Product';
        const quantity = item.quantity;
        const unitPrice = item.product?.price || 0;
        const totalPrice = unitPrice * quantity;
        
        // Handle long product names
        const maxNameWidth = 95;
        const nameLines = this.splitText(pdf, productName, maxNameWidth);
        
        nameLines.forEach((line, lineIndex) => {
          pdf.text(line, margin, yPosition);
          if (lineIndex === 0) {
            pdf.text(quantity.toString(), margin + 100, yPosition);
            pdf.text(`${unitPrice.toFixed(2)}`, margin + 120, yPosition);
            pdf.text(`${totalPrice.toFixed(2)}`, margin + 150, yPosition);
          }
          yPosition += 5;
        });
        
        yPosition += 2;
      });
      
      // Table bottom line
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 15;
      
      // Summary Section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Order Summary', margin, yPosition);
      
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Subtotal:', margin + 120, yPosition);
      pdf.text(`${orderData.subtotal.toFixed(2)}`, margin + 150, yPosition);
      
      yPosition += 7;
      
      if (orderData.shippingCharge > 0) {
        pdf.text('Shipping:', margin + 120, yPosition);
        pdf.text(`${orderData.shippingCharge.toFixed(2)}`, margin + 150, yPosition);
        yPosition += 7;
      } else {
        pdf.text('Shipping:', margin + 120, yPosition);
        pdf.text('FREE', margin + 150, yPosition);
        yPosition += 7;
      }
      
      // Total line
      pdf.setLineWidth(0.2);
      pdf.line(margin + 115, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 7;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Total Amount:', margin + 120, yPosition);
      pdf.text(`${orderData.totalAmount.toFixed(2)}`, margin + 150, yPosition);
      
      // Payment Information
      yPosition += 20;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Payment ID: ${orderData.paymentId}`, margin, yPosition);
      
      yPosition += 7;
      pdf.text('Payment Method: Razorpay', margin, yPosition);
      
      // Company Footer (Regular PDF)
      yPosition = pageHeight - 30;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Thank you for choosing Mimasa Foods Pvt Ltd!', margin, yPosition);
      
      yPosition += 5;
      pdf.text(`${this.companyInfo.email} | ${this.companyInfo.phone}`, margin, yPosition);
      
      // Convert PDF to base64
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      console.log('✅ PDF invoice generated successfully');
      
      return pdfBase64;
    } catch (error) {
      console.error('❌ Error generating PDF invoice:', error);
      throw new Error('Failed to generate PDF invoice');
    }
  }

  /**
   * Split text into multiple lines if it exceeds max width
   */
  private splitText(pdf: jsPDF, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const words = text.split(' ');
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = pdf.getTextWidth(testLine);
      
      if (testWidth > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  /**
   * Generate filename for invoice
   */
  public generateInvoiceFilename(orderNumber: string): string {
    return `Invoice_${orderNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  }
}

export default InvoiceGenerator;