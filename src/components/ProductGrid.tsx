import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="products">
      <div className="text-center mb-12">
        <h3 className="text-4xl font-bold text-gray-900 mb-3">🌶 Authentic & Traditional Culinary Range</h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our authentic ready-to-cook gravies, curry pastes, and marinades—crafted with traditional recipes and premium ingredients.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
