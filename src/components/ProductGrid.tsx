import { useMemo, useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { CATEGORY_LABELS, DietMark } from './heritage/ui';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

type Category = 'all' | 'gravy' | 'paste' | 'mix' | 'marinade';
type Diet = 'all' | 'veg' | 'nonveg';

const CATEGORIES: Category[] = ['all', 'gravy', 'paste', 'mix', 'marinade'];

const matchesDiet = (p: Product, diet: Diet) => {
  if (diet === 'all') return true;
  const d = p.diet || 'veg';
  return d === 'both' || d === diet;
};

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [category, setCategory] = useState<Category>('all');
  const [diet, setDiet] = useState<Diet>('all');
  const [showAll, setShowAll] = useState(false);

  // Category counts respect the active diet filter
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0, gravy: 0, paste: 0, mix: 0, marinade: 0 };
    products.filter((p) => matchesDiet(p, diet)).forEach((p) => {
      c.all += 1;
      if (p.category in c) c[p.category] += 1;
    });
    return c;
  }, [products, diet]);

  const filtered = useMemo(
    () => products.filter((p) => (category === 'all' || p.category === category) && matchesDiet(p, diet)),
    [products, category, diet]
  );

  const clear = () => { setCategory('all'); setDiet('all'); };

  return (
    <section className="max-w-[1240px] mx-auto px-5 py-14 md:py-24 scroll-mt-24" id="products">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
        <div className="max-w-2xl">
          <h2 className="font-display font-semibold text-[34px] leading-none md:text-[56px] text-heritage-ink mb-4">
            Authentic &amp; Traditional Culinary Range
          </h2>
          <p className="text-base md:text-lg text-heritage-body">
            Explore our authentic ready-to-cook gravies, curry pastes, and marinades—crafted with traditional recipes and premium ingredients.
          </p>
        </div>
        <p className="text-sm text-heritage-soft whitespace-nowrap">{filtered.length} products</p>
      </div>

      {/* Filter bar */}
      <div className="border-b border-heritage-line pb-5 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div role="tablist" aria-label="Category" className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
          {CATEGORIES.map((c) => {
            const disabled = c !== 'all' && counts[c] === 0;
            const active = category === c;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                disabled={disabled}
                onClick={() => { setCategory(c); setShowAll(false); }}
                className={[
                  'flex-none whitespace-nowrap font-body font-semibold text-sm md:text-[15px] transition-colors',
                  'min-h-[44px] md:min-h-0 md:h-10 px-4 md:px-5 rounded-full border',
                  active
                    ? 'bg-heritage-copper text-heritage-paper border-heritage-copper'
                    : disabled
                    ? 'bg-heritage-card text-[#BFAE97] border-heritage-line cursor-not-allowed'
                    : 'bg-heritage-card text-heritage-ink border-heritage-line hover:border-heritage-copper hover:text-heritage-copper',
                ].join(' ')}
              >
                {c === 'all' ? 'All' : CATEGORY_LABELS[c]} <span className="text-xs opacity-70">{counts[c]}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 md:flex gap-2">
          {([
            ['all', 'All dishes'],
            ['veg', 'Veg'],
            ['nonveg', 'Non-veg'],
          ] as [Diet, string][]).map(([d, label]) => (
            <button
              key={d}
              onClick={() => { setDiet(d); setShowAll(false); }}
              aria-pressed={diet === d}
              className={`inline-flex items-center justify-center gap-2 h-10 md:px-4 rounded-full border text-sm font-semibold transition-colors ${
                diet === d
                  ? 'bg-heritage-ink text-heritage-paper border-heritage-ink'
                  : 'bg-heritage-card text-heritage-ink border-heritage-line hover:border-heritage-ink'
              }`}
            >
              {d !== 'all' && <DietMark kind={d} size={14} />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-heritage-muted">
          <p className="text-lg mb-3">No products match these filters.</p>
          <button onClick={clear} className="text-heritage-copper underline font-semibold">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-7">
            {filtered.map((product, i) => (
              <div key={product.id} className={!showAll && i >= 6 ? 'md:block hidden' : ''}>
                <ProductCard product={product} onAddToCart={onAddToCart} />
              </div>
            ))}
          </div>
          {!showAll && filtered.length > 6 && (
            <div className="md:hidden mt-8 text-center">
              <button
                onClick={() => setShowAll(true)}
                className="min-h-[44px] px-7 rounded-full border-[1.5px] border-heritage-ink text-heritage-ink font-semibold hover:bg-heritage-ink hover:text-heritage-paper transition-colors"
              >
                View all {filtered.length} products
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
