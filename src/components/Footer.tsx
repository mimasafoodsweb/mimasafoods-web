export default function Footer() {
  return (
    <footer className="bg-mimasa-deep text-white py-16 mt-24" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-3xl font-serif font-semibold mb-6 text-mimasa-secondary">Mimasa Foods Pvt. Ltd.</h3>
            <p className="text-mimasa-cream leading-relaxed">
              Homemade Delicacy - Best Ready to Cook Gravy/Curry Paste
            </p>
          </div>

          <div id="about">
            <h4 className="text-xl font-serif font-semibold mb-6 text-mimasa-warm">Contact Us</h4>
            <div className="space-y-3 text-mimasa-cream">
              <p>201, Callisto Apt., JM Road</p>
              <p>Pune-411004, Maharashtra, India</p>
              <p>Email: mimasafoods@gmail.com</p>
              <p>Phone: +91 7709794918</p>
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
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-mimasa-primary/30 text-center text-mimasa-cream">
          <p className="font-medium">&copy; {new Date().getFullYear()} Mimasa Foods Pvt. Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
