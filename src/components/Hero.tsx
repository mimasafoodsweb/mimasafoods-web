import ReadyCook from '../assets/ready-cook.png';
import Wording from '../assets/wording.png';
import TenMin from '../assets/10-min-text.png';

export default function Hero() {
  // Load all product images from assets
  const imageModules = import.meta.glob('../assets/product_images/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP}', {
    eager: true,
    as: 'url',
  }) as Record<string, string>;
  const images = Object.values(imageModules);

  // Animation config (horizontal). Increase image size by ~20%.
  const imageHeight = 280; // optimized height for row layout
  const itemWidth = 420; // increased width since we have full width available in row layout
  const rollWidth = itemWidth * images.length; // total translate distance
  const durationSeconds = Math.max(5, images.length * 1.5); // speed based on count

  return (
    <div className="bg-gradient-to-br from-mimasa-cream via-mimasa-warm/30 to-mimasa-sage/20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Top row: hero content */}
          <div className="text-center py-2">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-8 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <h2 className="text-2xl font-serif font-semibold text-mimasa-deep whitespace-nowrap">
                    Homemade Delicacies
                  </h2>
                  <img src={ReadyCook} alt="Ready to Cook" className="h-16 w-auto" />
                  <img src={Wording} alt="Wording" className="h-12 w-auto" />
                  <img src={TenMin} alt="Ready in 10 Minutes" className="h-16 w-auto" />
                </div>
                <div className="bg-gradient-to-r from-mimasa-secondary to-mimasa-primary text-white px-6 py-2 rounded-full font-serif font-semibold text-base shadow-large hover:shadow-xl transition-all duration-300 whitespace-nowrap">
                  Free Delivery on Orders Above ₹500
                </div>
              </div>
            </div>

          </div>

          {/* Bottom row: animated rolling product images */}
          <div className="w-full">
            <div
              className="relative overflow-hidden rounded-3xl shadow-large bg-white/70 backdrop-blur-sm border border-mimasa-warm/20 max-w-full mx-auto"
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
                    <img src={src} alt="Product" style={{ height: imageHeight + 120 }} className="object-contain drop-shadow-lg" />
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
          <div className="w-full overflow-hidden bg-gradient-to-r from-mimasa-primary/10 to-mimasa-secondary/10 rounded-2xl py-3 border border-mimasa-warm/30">
            <div className="flex animate-marquee whitespace-nowrap">
              <span className="text-lg font-semibold text-mimasa-deep mx-4">
                Our USP are - The wet gravies retain authentic taste and aroma. No added preservatives. Affordable prices and available at leading retailers.
              </span>
              <span className="text-lg font-semibold text-mimasa-deep mx-4">
                Our USP are - The wet gravies retain authentic taste and aroma. No added preservatives. Affordable prices and available at leading retailers.
              </span>
              <span className="text-lg font-semibold text-mimasa-deep mx-4">
                Our USP are - The wet gravies retain authentic taste and aroma. No added preservatives. Affordable prices and available at leading retailers.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
