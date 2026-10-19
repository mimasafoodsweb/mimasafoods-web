import { Facebook, Instagram } from 'lucide-react';
import { WhatsAppIcon } from './ui';
import { SiteConfig } from '../../utils/siteConfig';

interface Props {
  config: SiteConfig;
  variant: 'strip' | 'circle' | 'footer';
}

/** Facebook / Instagram (only when configured) and WhatsApp links. */
export default function SocialLinks({ config, variant }: Props) {
  const wa = config.whatsapp ? `https://wa.me/${config.whatsapp}` : '';
  const items = [
    config.facebook && { href: config.facebook, label: 'Facebook', icon: (s: number) => <Facebook size={s} strokeWidth={2.6} /> },
    config.instagram && { href: config.instagram, label: 'Instagram', icon: (s: number) => <Instagram size={s} strokeWidth={2.6} /> },
    wa && { href: wa, label: 'WhatsApp', icon: (s: number) => <WhatsAppIcon size={s} /> },
  ].filter(Boolean) as { href: string; label: string; icon: (s: number) => JSX.Element }[];

  if (items.length === 0) return null;

  if (variant === 'strip') {
    return (
      <div className="flex items-center gap-5 text-heritage-gold-light">
        {items.map((i) => (
          <a key={i.label} href={i.href} target="_blank" rel="noopener noreferrer" aria-label={i.label} className="hover:text-white hover:scale-110 transition">
            {i.icon(22)}
          </a>
        ))}
      </div>
    );
  }

  const cls =
    variant === 'footer'
      ? 'w-11 h-11 border border-heritage-footer-divider text-heritage-gold-light hover:bg-heritage-footer-divider'
      : 'w-12 h-12 border border-heritage-line text-heritage-ink hover:bg-heritage-paper-2';
  return (
    <div className="flex items-center gap-3">
      {items.map((i) => (
        <a key={i.label} href={i.href} target="_blank" rel="noopener noreferrer" aria-label={i.label}
          className={`${cls} rounded-full inline-flex items-center justify-center transition-colors`}>
          {i.icon(18)}
        </a>
      ))}
    </div>
  );
}
