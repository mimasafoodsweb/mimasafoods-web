import { ShoppingCart } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export default function Header({ cartItemCount, onCartClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Mimasa Foods
            </h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#products" className="text-gray-700 hover:text-[#FFAE01] transition-colors">
              Products
            </a>
            <a href="#about" className="text-gray-700 hover:text-[#FFAE01] transition-colors">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-[#FFAE01] transition-colors">
              Contact
            </a>
          </nav>

          <button
            onClick={onCartClick}
            className="relative flex items-center space-x-2 bg-[#FFAE01] text-white px-6 py-3 rounded-full hover:bg-[#e69d00] transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
