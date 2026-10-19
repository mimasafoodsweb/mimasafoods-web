import ReadyCook from '../assets/ready-cook.png';
import { getProductImageUrl } from '../utils/images';
import { Diamond, Eyebrow, PouchImage } from './heritage/ui';

const USPS = [
  { n: '१', title: 'Authentic taste & aroma', text: 'The wet gravies retain authentic taste and aroma.' },
  { n: '२', title: 'Nothing artificial', text: 'No artificial flavors and colors.' },
  { n: '३', title: 'Fairly priced', text: 'Affordable prices and available at leading retailers.' },
];

export default function Hero() {
  const hero = getProductImageUrl('PANEER BUTTER MASALA');
  const left = getProductImageUrl('DHABA CHICKEN');
  const right = getProductImageUrl('KOLHAPURI MISAL');

  const scrollToProducts = () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <section className="max-w-[1240px] mx-auto px-5 pt-6 pb-12 md:pt-[72px] md:pb-20 grid md:grid-cols-[1.05fr_1fr] gap-8 md:gap-16 items-center">
        {/* Image block (first on mobile) */}
        <div className="relative order-first md:order-last h-[330px] md:h-[600px]">
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 bg-heritage-copper overflow-hidden w-[240px] h-[320px] md:w-[440px] md:h-[580px] rounded-t-[120px] md:rounded-t-[220px] rounded-b-[6px]"
          >
            <div className="absolute inset-[10px] md:inset-[14px] border border-heritage-gold-light rounded-t-[110px] md:rounded-t-[206px] rounded-b-[3px] pointer-events-none" />
            <PouchImage src={hero} alt="Paneer Butter Gravy pouch" widthPct={250} top={52} />
          </div>
          <div className="absolute left-0 md:left-2 bottom-2 w-[96px] h-[120px] md:w-[170px] md:h-[210px] overflow-hidden">
            <PouchImage src={left} alt="Dhaba Chicken pouch" widthPct={260} rotate={-8} />
          </div>
          <div className="absolute right-0 md:right-2 bottom-2 w-[96px] h-[120px] md:w-[170px] md:h-[210px] overflow-hidden">
            <PouchImage src={right} alt="Kolhapuri Misal pouch" widthPct={260} rotate={8} />
          </div>
          <img src={ReadyCook} alt="Ready to cook" className="absolute top-0 right-0 md:right-6 w-[72px] md:w-28 h-auto" />
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-5 md:gap-7">
          <Eyebrow>Homemade Delicacy</Eyebrow>
          <h1 className="font-display font-semibold text-[46px] leading-[0.98] md:text-[88px] md:leading-[0.95] tracking-[-0.01em] text-heritage-ink">
            Homemade Delicacies,{' '}
            <em className="italic text-heritage-copper">ready in 10 minutes.</em>
          </h1>
          <p className="text-lg md:text-xl text-heritage-body max-w-[520px] leading-relaxed">
            Authentic Indian ready-to-cook gravies and marinades. Restaurant-quality taste at home.
          </p>
          <p className="hidden md:flex flex-wrap items-center gap-3 text-sm font-semibold tracking-[0.12em] uppercase text-[#6B5545]">
            Gravies <Diamond /> Curry Pastes <Diamond /> Instant Mixes <Diamond /> Marinades
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={scrollToProducts}
              className="w-full md:w-auto bg-heritage-copper text-heritage-paper font-semibold rounded-full px-[30px] py-4 hover:bg-heritage-ink transition-colors"
            >
              Shop the range
            </button>
            {/* "Watch it cook" video button is hidden until the client supplies a product video */}
          </div>
        </div>
      </section>

      {/* USP strip */}
      <section className="bg-heritage-paper-3 border-y border-heritage-line" aria-label="Why Mimasa">
        <div className="max-w-[1240px] mx-auto grid md:grid-cols-3 md:divide-x divide-y md:divide-y-0 divide-heritage-line">
          {USPS.map((u) => (
            <div key={u.n} className="flex items-start gap-4 md:gap-5 px-5 md:px-10 py-5 md:py-10">
              <span className="font-deva text-[30px] md:text-[52px] leading-none text-heritage-gold">{u.n}</span>
              <div>
                <h3 className="font-display text-[22px] md:text-[26px] font-semibold text-heritage-ink leading-tight">{u.title}</h3>
                <p className="text-[15px] md:text-base text-heritage-muted mt-1">{u.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
