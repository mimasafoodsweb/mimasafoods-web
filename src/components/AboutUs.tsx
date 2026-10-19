import { useState } from 'react';
import { getProductImageUrl } from '../utils/images';
import { Eyebrow, PouchImage } from './heritage/ui';

export default function AboutUs() {
  const [expanded, setExpanded] = useState(false);
  const pouch = getProductImageUrl('PAAVBHAJI MASALA');

  return (
    <section id="about-us" className="scroll-mt-24 bg-heritage-paper-2">
      <div id="about" className="sr-only" aria-hidden="true" />
      <div className="max-w-[1240px] mx-auto px-5 py-14 md:py-24 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-[72px] items-center">
        {/* Media: product image in an arch until the brand video is available */}
        <div className="relative mx-auto w-full max-w-[460px] aspect-[16/10] lg:aspect-[4/5] bg-heritage-copper overflow-hidden rounded-t-[200px] lg:rounded-t-[230px] rounded-b-[6px]">
          <PouchImage src={pouch} alt="Mimasa ready-to-cook gravy pouch" widthPct={190} top={52} className="lg:!w-[250%]" />
        </div>

        <div>
          <Eyebrow>Pune, India</Eyebrow>
          <h2 className="font-display font-semibold text-[34px] md:text-[56px] leading-none text-heritage-ink mt-4 mb-6">About Us</h2>
          <div className="text-heritage-body text-[17px] leading-[1.7] space-y-5">
            <p>
              Mimasa Foods Pvt. Ltd., Pune brings the true taste of India to kitchens across the world. Rooted in authenticity and tradition, we set out with a simple yet powerful vision: to make Indian cooking effortless without compromising on flavour. By blending age-old recipes with modern convenience, we create products that turn everyday cooking into a delightful experience. Our diverse range—spanning traditional chutneys, rich gravies and cooking pastes, ready marinades, and ready-to-eat delicacies—is designed to satisfy global palates while staying true to India’s culinary heritage.
            </p>
            <p className={expanded ? '' : 'hidden lg:block'}>
              At Mimasa Foods Pvt. Ltd., we are committed to enhancing lifestyles through better food choices. Quality, trust, and responsibility define everything we do—from sourcing and manufacturing to distribution and customer relationships. Beyond food, we believe in creating impact by empowering people and supporting livelihoods. As demand for smart, time-saving cooking solutions grows—especially among today’s busy professionals—we continue to innovate in the convenience food space. With passion, purpose, and pride in our roots, Mimasa Foods Pvt. Ltd. looks ahead to new horizons, carrying the authentic taste of India to the world.
            </p>
          </div>
          {!expanded && (
            <button onClick={() => setExpanded(true)} className="lg:hidden mt-4 text-heritage-copper font-semibold underline min-h-[44px]">
              Read more
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
