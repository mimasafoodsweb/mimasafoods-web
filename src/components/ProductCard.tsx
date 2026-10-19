import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Product } from '../types';
import { getProductImageUrl } from '../utils/images';
import { CATEGORY_SINGULAR, DietMark, dietKinds, PouchImage } from './heritage/ui';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const assetFront = getProductImageUrl(product.name.toUpperCase());
  const assetBack = getProductImageUrl(`${product.name.toUpperCase()} BACK`);
  const resolvedImg = assetFront || product.image_url;
  const backImage = assetBack || product.image_url;
  const images = [resolvedImg, backImage].filter(Boolean);
  const kinds = dietKinds(product.diet);
  const categoryLabel = CATEGORY_SINGULAR[product.category] || product.category;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsModalOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen]);

  const steps = (product.preparation_method || []).filter((s) => s && s.trim());
  const DEVA_NUM = ['१', '२', '३', '४', '५', '६', '७', '८', '९'];

  // Front pouch images are oversized transparent PNGs, so they need the crop; other URLs render as-is
  const renderWell = (src: string | undefined, cropped: boolean, alt: string, widthPct: number, top = 52) =>
    cropped ? (
      <PouchImage src={src} alt={alt} widthPct={widthPct} top={top} />
    ) : (
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-contain" />
    );

  return (
    <div className="h-full">
    <div className="h-card bg-heritage-card border border-heritage-line-2 rounded-md overflow-hidden group h-full flex flex-col">
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label={`View ${product.name}`}
        className="relative m-2 md:m-3.5 aspect-[1/1.05] bg-heritage-paper-2 rounded-t-full rounded-b-[4px] overflow-hidden block"
      >
        {renderWell(resolvedImg, !!assetFront, product.name, 205)}
        {product.category === 'marinade' && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-heritage-ink text-heritage-paper text-xs tracking-[0.14em] uppercase px-3 py-1 rounded-full">
            Marinade
          </span>
        )}
      </button>

      <div className="px-3 md:px-5 pt-1 md:pt-[18px] pb-3 md:pb-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 min-h-[20px]">
          <span className="font-deva text-base text-heritage-copper truncate">{product.name_devanagari || ''}</span>
          <span className="flex items-center gap-1 flex-none">
            {kinds.map((k) => <DietMark key={k} kind={k} size={14} />)}
          </span>
        </div>
        <h3 className="font-display font-semibold text-heritage-ink text-lg leading-[1.1] md:text-[25px] md:min-h-[56px] mt-1">
          {product.name}
        </h3>
        <p className="text-sm text-heritage-soft mt-1">{categoryLabel} · {product.weight}</p>

        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="font-display font-bold text-heritage-ink text-xl md:text-[28px]">₹{product.price}</span>
          <button
            onClick={() => onAddToCart(product)}
            aria-label={`Add ${product.name} to cart`}
            className="md:px-5 md:py-2 w-11 h-11 md:w-auto md:h-auto rounded-full border-[1.5px] border-heritage-copper text-heritage-copper font-semibold text-sm hover:bg-heritage-copper hover:text-heritage-paper transition-colors flex items-center justify-center"
          >
            <span className="md:hidden text-xl leading-none">+</span>
            <span className="hidden md:inline">Add to cart</span>
          </button>
        </div>
      </div>
    </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label={product.name}>
          <div className="absolute inset-0 bg-[#5B4636]/85" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-heritage-paper rounded-lg w-full max-w-[1000px] max-h-[94vh] overflow-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-11 h-11 rounded-full border border-heritage-line bg-heritage-paper flex items-center justify-center z-10 hover:bg-heritage-paper-2"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-heritage-ink" />
            </button>
            <div className="grid md:grid-cols-2">
              {/* Image side */}
              <div className="bg-heritage-paper-2 p-5 md:p-7">
                <div className="relative bg-heritage-copper overflow-hidden h-[340px] md:h-[470px] rounded-t-[160px] md:rounded-t-[240px] rounded-b-[4px]">
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-heritage-paper/90 hover:bg-heritage-paper flex items-center justify-center z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4 text-heritage-ink" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-heritage-paper/90 hover:bg-heritage-paper flex items-center justify-center z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4 text-heritage-ink" />
                      </button>
                    </>
                  )}
                  {currentImageIndex === 0 ? (
                    renderWell(images[0], !!assetFront, product.name, 260)
                  ) : (
                    <img src={images[currentImageIndex]} alt={`${product.name} back`} className="absolute left-1/2 top-1/2 h-[96%] -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex justify-center gap-3 mt-4">
                    {images.map((src, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-16 h-16 rounded overflow-hidden bg-heritage-paper border-2 ${index === currentImageIndex ? 'border-heritage-copper' : 'border-heritage-line'}`}
                        aria-label={`Go to image ${index + 1}`}
                      >
                        {index === 0 ? renderWell(src, !!assetFront, '', 260) : <img src={src} alt="" className="absolute inset-0 w-full h-full object-contain" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details side */}
              <div className="p-6 md:p-11 flex flex-col gap-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: kinds.length === 1 && kinds[0] === 'nonveg' ? '#8B1A1A' : '#2E7D32' }}>
                  {kinds.map((k) => <DietMark key={k} kind={k} size={16} />)}
                  <span>{kinds.length === 2 ? 'Veg / Non-veg' : kinds[0] === 'veg' ? 'Veg' : 'Non-veg'} · {categoryLabel} · {product.weight}</span>
                </div>
                {product.name_devanagari && <div className="font-deva text-[22px] text-heritage-copper">{product.name_devanagari}</div>}
                <h3 className="font-display font-semibold text-heritage-ink text-[34px] md:text-[44px] leading-[1.05]">{product.name}</h3>
                <div className="text-heritage-body space-y-3 max-h-[26vh] overflow-auto pr-1">
                  {(product.long_description || product.description || '').split('\n').map((para, idx) => (
                    <p key={idx} className="text-base leading-relaxed">{para}</p>
                  ))}
                </div>

                {steps.length > 0 && (
                  <div className="border-t border-heritage-line pt-4">
                    <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-heritage-gold mb-3">Method of preparation</div>
                    <ol className="space-y-3">
                      {steps.map((st, i) => (
                        <li key={i} className="flex gap-4 text-sm text-heritage-body">
                          <span className="font-deva text-[17px] text-heritage-gold w-4 flex-none">{DEVA_NUM[i] || i + 1}</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-4">
                  <span className="font-display font-bold text-heritage-ink text-[32px] md:text-[38px]">₹{product.price}</span>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-heritage-copper text-heritage-paper font-semibold rounded-full px-[34px] py-[15px] hover:bg-heritage-ink transition-colors"
                  >
                    Add to cart
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
