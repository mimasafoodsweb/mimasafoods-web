import { useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import Logo from '../assets/MimasaLogo.png';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export default function Header({ cartItemCount, onCartClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (section: string) => {
    // Close mobile menu when navigation item is clicked
    setIsMobileMenuOpen(false);
    
    // Smooth scroll to section
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-soft sticky top-0 z-50 border-b border-mimasa-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          {/* Logo and company name */}
          <div className="flex items-center">
            <img 
              src={Logo} 
              alt="Mimasa Foods Pvt. Ltd. logo" 
              className="h-14 sm:h-20 w-auto mr-2 sm:mr-4" 
            />
            <h1 className="text-base sm:text-xl lg:text-2xl font-serif font-semibold text-mimasa-deep tracking-wide leading-tight">
              Mimasa Foods Pvt. Ltd.
            </h1>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <button 
              onClick={() => handleNavClick('products')}
              className="text-mimasa-deep hover:text-mimasa-primary transition-colors font-medium text-sm sm:text-base"
            >
              Products
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className="text-mimasa-deep hover:text-mimasa-primary transition-colors font-medium text-sm sm:text-base"
            >
              About Us
            </button>
            <button 
              onClick={() => handleNavClick('contact')}
              className="text-mimasa-deep hover:text-mimasa-primary transition-colors font-medium text-sm sm:text-base"
            >
              Contact
            </button>
          </nav>

          {/* Cart button - always visible */}
          <button
            onClick={onCartClick}
            className="relative flex items-center space-x-1 sm:space-x-2 bg-mimasa-primary text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-mimasa-deep transition-all duration-300 shadow-medium hover:shadow-large font-medium text-xs sm:text-sm"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline font-medium">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-mimasa-accent text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-mimasa-warm/20 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-mimasa-deep" />
            ) : (
              <Menu className="w-6 h-6 text-mimasa-deep" />
            )}
          </button>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-mimasa-cream py-4">
            <nav className="flex flex-col space-y-3">
              <button 
                onClick={() => handleNavClick('products')}
                className="text-mimasa-deep hover:text-mimasa-primary transition-colors font-medium text-sm sm:text-base text-left px-4 py-2 rounded-lg hover:bg-mimasa-warm/20"
              >
                Products
              </button>
              <button 
                onClick={() => handleNavClick('about')}
                className="text-mimasa-deep hover:text-mimasa-primary transition-colors font-medium text-sm sm:text-base text-left px-4 py-2 rounded-lg hover:bg-mimasa-warm/20"
              >
                About Us
              </button>
              <button 
                onClick={() => handleNavClick('contact')}
                className="text-mimasa-deep hover:text-mimasa-primary transition-colors font-medium text-sm sm:text-base text-left px-4 py-2 rounded-lg hover:bg-mimasa-warm/20"
              >
                Contact
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
