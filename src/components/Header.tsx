import { useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import Logo from '../assets/MimasaLogo.png';
import { Diamond } from './heritage/ui';
import SocialLinks from './heritage/SocialLinks';
import OfferBanner from './heritage/OfferBanner';
import { SiteConfig } from '../utils/siteConfig';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  siteConfig: SiteConfig;
}

const NAV = [
  { label: 'Products', id: 'products' },
  { label: 'Reviews', id: 'reviews' },
  { label: 'Enquiry', id: 'enquiry' },
  { label: 'About Us', id: 'about-us' },
  { label: 'Contact', id: 'contact' },
];

export default function Header({ cartItemCount, onCartClick, siteConfig }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (section: string) => {
    // Close mobile menu when navigation item is clicked
    setIsMobileMenuOpen(false);

    // Smooth scroll to section
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top strip */}
      <div className="bg-heritage-ink text-heritage-paper-2 h-11">
        <div className="relative max-w-[1240px] mx-auto px-5 h-full flex items-center justify-center">
          <div className="flex items-center gap-3 text-xs sm:text-sm tracking-[0.06em] uppercase font-body">
            <Diamond />
            <span>Free delivery on orders above ₹{siteConfig.freeShippingThreshold}</span>
            <Diamond />
          </div>
          {/* Aligned with the right edge of the header content, i.e. above the Cart button */}
          <div className="hidden md:flex absolute right-5 top-0 h-full items-center">
            <SocialLinks config={siteConfig} variant="strip" />
          </div>
        </div>
      </div>

      <header className="bg-heritage-paper sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-5 flex justify-between items-center h-[68px] md:h-24">
          {/* Logo and company name */}
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Mimasa Foods Pvt. Ltd. logo" className="h-[50px] md:h-[72px] w-auto" />
            <span className="hidden md:block font-display text-[22px] font-semibold text-heritage-ink">
              Mimasa Foods Pvt. Ltd.
            </span>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNavClick(n.id)}
                className="font-body text-base font-medium text-heritage-ink hover:text-heritage-copper transition-colors"
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              onClick={onCartClick}
              className="relative inline-flex items-center justify-center bg-heritage-copper text-heritage-paper hover:bg-heritage-ink transition-colors w-11 h-11 rounded-full md:w-auto md:h-auto md:py-3 md:px-[22px] md:gap-2 font-semibold"
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
              <span className="hidden md:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 md:static w-5 h-5 md:w-6 md:h-6 rounded-full bg-heritage-gold text-heritage-ink text-[11px] md:text-[13px] font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-11 h-11 inline-flex items-center justify-center text-heritage-ink"
              aria-label="Open menu"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>

        {/* Copper band */}
        <div className="h-[3px] bg-heritage-copper" />
        <div className="h-[2px] bg-heritage-paper" />
        <div className="h-px bg-heritage-gold" />
      </header>

      <OfferBanner config={siteConfig} />

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-heritage-paper flex flex-col px-5 pb-8 md:hidden">
          <div className="flex items-center justify-between h-[68px]">
            <img src={Logo} alt="Mimasa Foods" className="h-[50px] w-auto" />
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-11 h-11 inline-flex items-center justify-center rounded-full border border-heritage-line" aria-label="Close menu">
              <X size={22} />
            </button>
          </div>
          <nav className="mt-6 flex-1" aria-label="Mobile">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNavClick(n.id)}
                className="block w-full text-left font-display text-[34px] font-semibold text-heritage-ink py-4 border-b border-heritage-line"
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="space-y-4">
            <SocialLinks config={siteConfig} variant="circle" />
            <p className="text-sm text-heritage-muted">mimasafoods@gmail.com · +91 8421794918</p>
          </div>
        </div>
      )}
    </>
  );
}
