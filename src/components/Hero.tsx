import ReadyCook from '../assets/ready-cook.png';
import Wording from '../assets/wording.png';
import TenMin from '../assets/10-min-text.png';
import { useState, useEffect } from 'react';
import { getFreeShippingThreshold } from '../utils/cartConfig';

export default function Hero() {
  // Load all product images from assets (excluding BACK images)
  const imageModules = import.meta.glob('../assets/product_images/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP}', {
    eager: true,
    as: 'url',
  }) as Record<string, string>;
  
  // Filter out BACK images from the carousel
  const allImages = Object.values(imageModules);
  const images = allImages.filter(imageUrl => !imageUrl.includes('BACK.png'));

  // State for free shipping threshold
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);

  // Fetch free shipping threshold from cart config
  useEffect(() => {
    const fetchFreeShippingThreshold = async () => {
      try {
        const threshold = await getFreeShippingThreshold();
        setFreeShippingThreshold(threshold);
      } catch (error) {
        console.error('Error fetching free shipping threshold:', error);
        setFreeShippingThreshold(500); // Fallback to 500 if error
      }
    };

    fetchFreeShippingThreshold();
  }, []);

  // Animation config (horizontal). Adjust for mobile responsiveness
  const imageHeight = 200; // reduced height for mobile
  const itemWidth = 320; // reduced width for mobile
  const rollWidth = itemWidth * images.length; // total translate distance
  const durationSeconds = Math.max(5, images.length * 1.5); // speed based on count

  return (
    <div className="bg-gradient-to-br from-mimasa-cream via-mimasa-warm/30 to-mimasa-sage/20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Top row: hero content */}
          <div className="text-center py-2">
            <div className="flex flex-col items-center gap-4">
              {/* Main content row - stack vertically on mobile */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full">
                {/* Left section: Title and images */}
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <h2 className="text-lg sm:text-xl font-serif font-semibold text-mimasa-deep text-center">
                    Homemade Delicacies
                  </h2>
                  <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                    <img src={ReadyCook} alt="Ready to Cook" className="h-12 sm:h-16 w-auto" />
                    <img src={Wording} alt="Wording" className="h-10 sm:h-12 w-auto" />
                    <img src={TenMin} alt="Ready in 10 Minutes" className="h-12 sm:h-16 w-auto" />
                  </div>
                </div>
                
                {/* Right section: Free delivery badge - full width on mobile */}
                <div className="w-full sm:w-auto flex justify-center">
                  <div className="bg-gradient-to-r from-mimasa-secondary to-mimasa-primary text-white px-4 sm:px-6 py-2 rounded-full font-serif font-semibold text-xs sm:text-sm shadow-large hover:shadow-xl transition-all duration-300 text-center">
                    Free Delivery on Orders Above ₹{freeShippingThreshold}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: animated rolling product images */}
          <div className="w-full">
            <div
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-large bg-white/70 backdrop-blur-sm border border-mimasa-warm/20 max-w-full mx-auto"
              style={{ height: imageHeight + 12, maxWidth: '100%' }}
            >
              <div
                className="w-full flex items-center"
                style={{
                  width: rollWidth * 2, // space for duplicated sequence
                  animation: images.length > 0 ? `mf-scroll-x ${durationSeconds}s linear infinite` : 'none',
                }}
              >
                {[...images, ...images].map((src, idx) => (
                  <div key={idx} className="flex items-center justify-center" style={{ width: itemWidth, height: imageHeight + 32 }}>
                    <img src={src} alt="Product" style={{ height: imageHeight + 80 }} className="object-contain drop-shadow-lg" />
                  </div>
                ))}
              </div>
              {/* Keyframes for the horizontal rolling animation */}
              <style>
                {`@keyframes mf-scroll-x { 0% { transform: translateX(0); } 100% { transform: translateX(-${rollWidth}px); } }
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
                .animate-marquee { animation: marquee 20s linear infinite; }`}
              </style>
            </div>
          </div>

          {/* Marquee text section */}
          <div className="w-full overflow-hidden bg-gradient-to-r from-mimasa-primary/10 to-mimasa-secondary/10 rounded-xl sm:rounded-2xl py-2 sm:py-3 border border-mimasa-warm/30">
            <div className="flex animate-marquee whitespace-nowrap">
              <span className="text-xs sm:text-sm font-semibold text-mimasa-deep mx-2 sm:mx-4">
                Our USP are - The wet gravies retain authentic taste and aroma. No artificial flavors and colors. Affordable prices and available at leading retailers.
              </span>
              <span className="text-xs sm:text-sm font-semibold text-mimasa-deep mx-2 sm:mx-4">
                Our USP are - The wet gravies retain authentic taste and aroma. No artificial flavors and colors. Affordable prices and available at leading retailers.
              </span>
              <span className="text-xs sm:text-sm font-semibold text-mimasa-deep mx-2 sm:mx-4">
                Our USP are - The wet gravies retain authentic taste and aroma. No artificial flavors and colors. Affordable prices and available at leading retailers.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
