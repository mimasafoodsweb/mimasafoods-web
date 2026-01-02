import { useState } from 'react';
import PolicyModal from './PolicyModal';

export default function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const policies = {
    privacy: {
      title: 'Privacy Policy',
      content: `At Mimasa Foods, we respect your privacy and are committed to protecting your personal information in compliance with applicable laws in India. We collect personal details such as name, email, phone number, and delivery address only to process orders, communicate with you, and provide customer service. We do not sell or disclose your personal information to third parties except as necessary to fulfill your orders or comply with legal obligations.
We use industry-standard technical safeguards to protect your data from unauthorized access. By using our website and services, you consent to the collection and use of your personal information as outlined in this policy. You may choose not to provide certain information, but this may limit your ability to use parts of the site or complete purchases.
We may periodically update this Privacy Policy to reflect changes in legal requirements or our business practices. Continued use of the site constitutes acceptance of such updates. For any privacy-related concerns or requests (including data correction or deletion), you can contact us at mimasafoods@gmail.com. (Mimasa Foods)`
    },
    terms: {
      title: 'Terms and Conditions',
      content: `At Mimasa Foods Private Limited ("Mimasa Foods", "we", "us" or "our"), we are committed to delivering high-quality ready-to-cook food products to customers across India. By accessing or placing an order through our website, you agree to be bound by these Terms and Conditions, including all policies referenced herein. We reserve the right to modify or update these Terms at any time without prior notice, and such changes will be effective immediately upon posting on the website.
Our products are sold subject to availability and acceptance of your order by us. Prices, offers, promotions, and specifications are subject to change without notice and at our sole discretion. We endeavor to ensure accurate product information, but do not guarantee that all descriptions, pricing, or availability posted are error-free. Your use of the website and orders placed on the site are governed by applicable laws in India, and by using the site you expressly consent to the exclusive jurisdiction of courts in India for any disputes.
Customers are responsible for providing accurate contact and delivery information. We may refuse service, limit quantities, or cancel orders that appear fraudulent, violate law, or are placed in bad faith. In the event of a cancellation by us, you will be notified and any amount paid will be refunded in accordance with our refund procedures.`
    },
    shipping: {
      title: 'Shipping Policy',
      content: `Mimasa Foods offers shipping of our ready-to-cook food products throughout India. We strive to dispatch orders promptly upon receipt of payment confirmation. Shipping charges, if any, will be displayed at checkout and may vary based on your location and order value. Free delivery is offered on orders above ₹500, unless otherwise specified.
Delivery timelines depend on your location and partner logistics providers; typical delivery estimates will be communicated at the time of order placement. While we endeavor to meet all estimated delivery times, delays may occur due to carrier issues, natural events, or other circumstances beyond our control. Risk of loss and title for products pass to you upon delivery.
If a delivery attempt fails due to an incorrect address provided by you or unavailability at the delivery location, additional delivery charges may apply for re-delivery. All shipments are subject to our standard packaging and handling procedures to ensure product integrity. (Mimasa Foods)`
    },
    refunds: {
      title: 'Cancellations and Refunds',
      content: `At Mimasa Foods, we aim for complete customer satisfaction while maintaining operational efficiency. Approval and/or acceptance of cancellation requests will be at the sole discretion of Mimasa management. Cancellation requests maybe  made before the order is dispatched; once the product has left our facility, cancellation may not be possible. If a cancellation is accepted, the refund will be issued to the original mode of payment in accordance with applicable banking timelines.
Refunds are processed only for cancelled orders or instances where products are found damaged, defective, or materially different from description. To request a refund, please contact our customer support within 48 hours of delivery with order details and supporting evidence. Once approved, refunds will be completed within a reasonable period.
Please note that custom offers, bundled promotions, or certain perishable items may have specific cancellation and refund conditions, which will be clearly communicated at the time of purchase.`
    }
  };

  const openModal = (policyType: string) => {
    setActiveModal(policyType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <footer className="bg-mimasa-deep text-white py-16 mt-24" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-3xl font-serif font-semibold mb-6 text-mimasa-secondary">Mimasa Foods Pvt. Ltd.</h3>
            <p className="text-mimasa-cream leading-relaxed">
              Homemade Delicacy - Best Ready to Cook Gravy/Curry Paste
            </p>
            <p className="text-mimasa-cream leading-relaxed mt-2">
              FSSAI License No: 11525080000418
            </p>
            <p className="text-mimasa-cream leading-relaxed mt-2">
              GSTIN: 27AAPCM6971L1ZK
            </p>
          </div>

          <div>
            <h4 className="text-xl font-serif font-semibold mb-6 text-mimasa-warm">Contact Us</h4>
            <div className="space-y-3 text-mimasa-cream">
              <p>Mimasa Foods Pvt Ltd</p>
              <p>Plot no 3, Kshitij,</p>
              <p>Sanjwat CHS,669/2,</p>
              <p>Bibwewadi,</p>
              <p>Pune Maharashtra -411037</p>
              <p>Email: mimasafoods@gmail.com</p>
              <p>Phone: +91 8421794918</p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-serif font-semibold mb-6 text-mimasa-warm">Quick Links</h4>
            <div className="space-y-3">
              <a href="#products" className="block text-mimasa-cream hover:text-mimasa-secondary transition-colors font-medium">
                Products
              </a>
              <a href="#about" className="block text-mimasa-cream hover:text-mimasa-secondary transition-colors font-medium">
                About Us
              </a>
              <a href="#contact" className="block text-mimasa-cream hover:text-mimasa-secondary transition-colors font-medium">
                Contact
              </a>
              <button 
                onClick={() => openModal('privacy')}
                className="block text-mimasa-cream hover:text-mimasa-secondary transition-colors font-medium text-left"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => openModal('terms')}
                className="block text-mimasa-cream hover:text-mimasa-secondary transition-colors font-medium text-left"
              >
                Terms and Conditions
              </button>
              <button 
                onClick={() => openModal('shipping')}
                className="block text-mimasa-cream hover:text-mimasa-secondary transition-colors font-medium text-left"
              >
                Shipping Policy
              </button>
              <button 
                onClick={() => openModal('refunds')}
                className="block text-mimasa-cream hover:text-mimasa-secondary transition-colors font-medium text-left"
              >
                Cancellations and Refunds
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-mimasa-primary/30 text-mimasa-cream">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="font-medium">&copy; {new Date().getFullYear()} Mimasa Foods Pvt. Ltd. All rights reserved.</p>
            <p className="font-medium mt-4 sm:mt-0">
              Powered by <a href="https://www.futurefocusit.solutions" target="_blank" rel="noopener noreferrer" className="text-mimasa-secondary hover:text-mimasa-warm transition-colors">Future Focus IT Solutions</a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Policy Modals */}
      {Object.entries(policies).map(([key, policy]) => (
        <PolicyModal
          key={key}
          isOpen={activeModal === key}
          onClose={closeModal}
          title={policy.title}
          content={policy.content}
        />
      ))}
    </footer>
  );
}
