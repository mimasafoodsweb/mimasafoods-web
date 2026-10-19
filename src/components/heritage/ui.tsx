import { ReactNode } from 'react';

export function Diamond({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`inline-block w-[5px] h-[5px] bg-heritage-gold rotate-45 ${className}`} />;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="block w-8 sm:w-9 h-px bg-heritage-gold" />
      <span className="font-body font-semibold text-[13px] sm:text-sm tracking-[0.21em] uppercase text-heritage-eyebrow">
        {children}
      </span>
    </div>
  );
}

/** Indian veg / non-veg square mark */
export function DietMark({ kind, size = 14 }: { kind: 'veg' | 'nonveg'; size?: number }) {
  const color = kind === 'veg' ? '#2E7D32' : '#8B1A1A';
  return (
    <span
      role="img"
      aria-label={kind === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
      className="inline-flex items-center justify-center flex-none bg-white"
      style={{ width: size, height: size, border: `1.5px solid ${color}` }}
    >
      <span className="rounded-full" style={{ width: size * 0.43, height: size * 0.43, background: color }} />
    </span>
  );
}

export function dietKinds(diet?: string): ('veg' | 'nonveg')[] {
  if (diet === 'both') return ['veg', 'nonveg'];
  if (diet === 'nonveg') return ['nonveg'];
  return ['veg'];
}

/**
 * Product pouch PNGs have large transparent padding (the pouch fills ~40% of the frame),
 * so the image is oversized and centred inside an overflow-hidden well.
 */
export function PouchImage({
  src, alt, widthPct = 250, top = 50, rotate = 0, className = '',
}: { src?: string; alt: string; widthPct?: number; top?: number; rotate?: number; className?: string }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`absolute left-1/2 max-w-none select-none ${className}`}
      style={{ top: `${top}%`, width: `${widthPct}%`, transform: `translate(-50%, -50%)${rotate ? ` rotate(${rotate}deg)` : ''}` }}
    />
  );
}

export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.5-.22-.36a9.43 9.43 0 0 1-1.45-5.04c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.9.99 6.69 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.47-9.47 9.47zM20.52 3.45A11.38 11.38 0 0 0 12.04.1C5.74.1.62 5.22.62 11.52c0 2.01.53 3.98 1.53 5.71L.5 23.5l6.4-1.68a11.4 11.4 0 0 0 5.14 1.23h.01c6.3 0 11.42-5.12 11.42-11.42 0-3.05-1.19-5.92-3.35-8.08z" />
    </svg>
  );
}

export const CATEGORY_LABELS: Record<string, string> = {
  gravy: 'Gravies',
  paste: 'Curry Pastes',
  mix: 'Instant Mixes',
  marinade: 'Marinades',
};

export const CATEGORY_SINGULAR: Record<string, string> = {
  gravy: 'Gravy',
  paste: 'Curry Paste',
  mix: 'Instant Mix',
  marinade: 'Marinade',
};
