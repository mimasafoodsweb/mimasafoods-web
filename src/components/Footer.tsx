export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-[#FFAE01]">Mimasa Foods Pvt. Ltd.</h3>
            <p className="text-gray-400">
              Homemade Delicacy - Best Ready to Cook Gravy/Curry Paste
            </p>
          </div>

          <div id="about">
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <div className="space-y-2 text-gray-400">
              <p>201, Callisto Apt., JM Road</p>
              <p>Pune-411004, Maharashtra, India</p>
              <p>Email: mimasafoods@gmail.com</p>
              <p>Phone: +91 7709794918</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="#products" className="block text-gray-400 hover:text-[#FFAE01] transition-colors">
                Products
              </a>
              <a href="#about" className="block text-gray-400 hover:text-[#FFAE01] transition-colors">
                About Us
              </a>
              <a href="#contact" className="block text-gray-400 hover:text-[#FFAE01] transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Mimasa Foods Pvt. Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
