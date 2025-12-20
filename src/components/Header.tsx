import { ShoppingCart } from 'lucide-react';
import Logo from '../assets/MimasaLogo.png';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export default function Header({ cartItemCount, onCartClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-soft sticky top-0 z-50 border-b border-mimasa-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
            <img src={Logo} alt="Mimasa Foods Pvt. Ltd. logo" className="h-20 w-auto mr-4" />
            <h1 className="text-3xl font-serif font-semibold text-mimasa-deep tracking-wide">
              Mimasa Foods Pvt. Ltd.
            </h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#products" className="text-mimasa-deep hover:text-mimasa-primary transition-colors font-medium">
              Products
            </a>
            <a href="#about" className="text-mimasa-deep hover:text-mimasa-primary transition-colors font-medium">
              About Us
            </a>
            <a href="#contact" className="text-mimasa-deep hover:text-mimasa-primary transition-colors font-medium">
              Contact
            </a>
          </nav>

          <button
            onClick={onCartClick}
            className="relative flex items-center space-x-2 bg-mimasa-primary text-white px-6 py-3 rounded-full hover:bg-mimasa-deep transition-all duration-300 shadow-medium hover:shadow-large font-medium"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-mimasa-accent text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
