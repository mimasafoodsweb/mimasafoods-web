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
  const imageHeight = 350; // increase for better visibility
  const itemWidth = 360; // reduced width to bring images closer together
  const rollWidth = itemWidth * images.length; // total translate distance
  const durationSeconds = Math.max(5, images.length * 1.5); // speed based on count

  return (
    <div className="bg-gradient-to-br from-mimasa-cream via-mimasa-warm/30 to-mimasa-sage/20 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left column: animated rolling product images */}
          <div className="order-2 md:order-1">
            <div className="relative overflow-hidden rounded-3xl shadow-large bg-white/70 backdrop-blur-sm border border-mimasa-warm/20" style={{ height: imageHeight + 32 }}>
              <div
                className="w-full flex items-center"
                style={{
                  width: rollWidth * 2, // space for duplicated sequence
                  animation: images.length > 0 ? `mf-scroll-x ${durationSeconds}s linear infinite` : 'none',
                }}
              >
                {[...images, ...images].map((src, idx) => (
                  <div key={idx} className="flex items-center justify-center" style={{ width: itemWidth, height: imageHeight + 32 }}>
                    <img src={src} alt="Product" style={{ height: imageHeight }} className="object-contain drop-shadow-lg" />
                  </div>
                ))}
              </div>
              {/* Keyframes for the horizontal rolling animation */}
              <style>
                {`@keyframes mf-scroll-x { 0% { transform: translateX(0); } 100% { transform: translateX(-${rollWidth}px); } }`}
              </style>
            </div>
          </div>

          {/* Right column: existing hero content */}
          <div className="text-center order-1 md:order-2">
            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap sm:flex-nowrap">
              <h2 className="text-3xl font-serif font-semibold text-mimasa-deep whitespace-nowrap">
                Homemade Delicacies
              </h2>
              <img src={ReadyCook} alt="Ready to Cook" className="h-16 w-auto" />
              <img src={Wording} alt="Wording" className="h-10 w-auto" />
              <img src={TenMin} alt="Ready in 10 Minutes" className="h-16 w-auto" />
            </div>
            <p className="text-xl text-mimasa-deep/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Authentic Homemade Indian Delicacies crafted into premium Ready-to-Cook Gravies, Curry Pastes & Marinades—bringing traditional flavours to your kitchen with effortless cooking.
            </p>
            <div className="inline-block bg-gradient-to-r from-mimasa-secondary to-mimasa-primary text-white px-10 py-4 rounded-full font-serif font-semibold text-xl shadow-large hover:shadow-xl transition-all duration-300">
              Free Delivery on Orders Above ₹500
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
