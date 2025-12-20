import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden h-64">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.category === 'marinade' && (
          <div className="absolute top-4 right-4 bg-[#FFAE01] text-white px-3 py-1 rounded-full text-sm font-semibold">
            Marinade
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
            <span className="text-gray-500 text-sm ml-2">{product.weight}</span>
          </div>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="w-full bg-[#FFAE01] text-white font-semibold py-3 rounded-full hover:bg-[#e69d00] transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
