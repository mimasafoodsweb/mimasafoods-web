import { ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { getProductImageUrl } from '../utils/images';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const resolvedImg = getProductImageUrl(product.name) || product.image_url;
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden h-72">
        <img
          src={resolvedImg}
          alt={product.name}
          className="w-full h-full object-cover scale-110 group-hover:scale-115 transition-transform duration-500 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        />
        {product.category === 'marinade' && (
          <div className="absolute top-4 right-4 bg-[#FFAE01] text-white px-3 py-1 rounded-full text-sm font-semibold">
            Marinade
          </div>
        )}
      </div>

      <div className="px-6 pt-3 pb-5">
        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-1">
          <div>
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
            <span className="text-gray-500 text-sm ml-2">{product.weight}</span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="bg-[#FFAE01] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#e69d00] transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg text-sm"
          >
            <span>Add</span>
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-[94%] md:w-[1000px] overflow-hidden">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gray-50">
                <img src={resolvedImg} alt={product.name} className="w-full h-[40vh] md:h-[45vh] object-cover" />
              </div>
              <div className="p-6 w-full max-w-xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>
                <div className="text-gray-700 leading-relaxed mb-4 space-y-3 max-h-[50vh] md:max-h-[60vh] overflow-auto pr-1">
                  {(product.long_description || product.description || '').split('\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-gray-500 text-sm ml-2">{product.weight}</span>
                  </div>
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      setIsModalOpen(false);
                    }}
                    className="bg-[#FFAE01] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#e69d00] transition-all duration-300 flex items-center space-x-2 text-sm"
                  >
                    <span>Add</span>
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
