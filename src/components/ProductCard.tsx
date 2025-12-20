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
    <div className="bg-white rounded-3xl shadow-soft hover:shadow-large transition-all duration-300 overflow-hidden group border border-mimasa-cream/50">
      <div className="relative overflow-hidden h-56">
        <img
          src={resolvedImg}
          alt={product.name}
          className="w-full h-full object-cover scale-125 group-hover:scale-130 transition-transform duration-500 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        />
        {product.category === 'marinade' && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-mimasa-secondary to-mimasa-primary text-white px-4 py-2 rounded-full text-sm font-serif font-semibold shadow-medium">
            Marinade
          </div>
        )}
      </div>

      <div className="px-6 pt-4 pb-6">
        <h3 className="text-xl font-serif font-semibold text-mimasa-deep mb-2 line-clamp-2 min-h-[3.5rem] leading-tight">
          {product.name}
        </h3>

        <p className="text-mimasa-deep/70 text-sm mb-3 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-1">
          <div>
            <span className="text-2xl font-serif font-bold text-mimasa-primary">₹{product.price}</span>
            <span className="text-mimasa-deep/60 text-sm ml-2 font-medium">{product.weight}</span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="bg-gradient-to-r from-mimasa-primary to-mimasa-deep text-white font-semibold px-5 py-2.5 rounded-full hover:from-mimasa-deep hover:to-mimasa-primary transition-all duration-300 flex items-center space-x-2 shadow-medium hover:shadow-large text-sm"
          >
            <span>Add</span>
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-mimasa-deep/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-large max-w-5xl w-[94%] md:w-[1000px] overflow-hidden border border-mimasa-cream">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 hover:bg-white shadow-medium hover:shadow-large transition-all duration-200"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-mimasa-deep" />
            </button>
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-mimasa-cream to-mimasa-warm/30">
                <img src={resolvedImg} alt={product.name} className="w-full h-[40vh] md:h-[45vh] object-cover" />
              </div>
              <div className="p-8 w-full max-w-xl mx-auto">
                <h3 className="text-3xl font-serif font-semibold text-mimasa-deep mb-4">{product.name}</h3>
                <div className="text-mimasa-deep/80 leading-relaxed mb-6 space-y-4 max-h-[50vh] md:max-h-[60vh] overflow-auto pr-2">
                  {(product.long_description || product.description || '').split('\n').map((para, idx) => (
                    <p key={idx} className="text-base">{para}</p>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-serif font-bold text-mimasa-primary">₹{product.price}</span>
                    <span className="text-mimasa-deep/60 text-base ml-3 font-medium">{product.weight}</span>
                  </div>
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      setIsModalOpen(false);
                    }}
                    className="bg-gradient-to-r from-mimasa-primary to-mimasa-deep text-white font-semibold px-6 py-3 rounded-full hover:from-mimasa-deep hover:to-mimasa-primary transition-all duration-300 flex items-center space-x-2 text-base shadow-medium hover:shadow-large"
                  >
                    <span>Add</span>
                    <ShoppingCart className="w-5 h-5" />
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
