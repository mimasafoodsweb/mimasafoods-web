import { useState } from 'react';
import { Copy } from 'lucide-react';
import { resolveOfferCode, SiteConfig } from '../../utils/siteConfig';

export default function OfferBanner({ config }: { config: SiteConfig }) {
  const [copied, setCopied] = useState(false);
  const text = config.offerBanner;
  if (!text) return null;

  const code = resolveOfferCode(text, config.offerCode);
  // Split the message around the first occurrence of the code so it can render as a chip
  const idx = code ? text.toUpperCase().indexOf(code.toUpperCase()) : -1;
  const before = idx >= 0 ? text.slice(0, idx) : text;
  const after = idx >= 0 ? text.slice(idx + code.length) : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="bg-heritage-paper-2 border-b border-heritage-line">
      <div className="max-w-[1240px] mx-auto px-5 py-3.5 md:py-2 md:min-h-[64px] flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
        <span className="self-start md:self-center flex-none bg-heritage-copper text-heritage-paper text-xs font-semibold tracking-[0.2em] uppercase px-3 py-[5px]">
          Seasonal Offer
        </span>
        <p className="font-display font-semibold text-heritage-ink text-[19px] md:text-[22px] leading-snug flex-1">
          {before}
          {idx >= 0 && (
            <span className="font-mono text-[13px] md:text-[15px] text-heritage-copper bg-heritage-card border-[1.5px] border-dashed border-heritage-copper rounded px-2.5 py-[3px] mx-1 whitespace-nowrap">
              {text.slice(idx, idx + code.length)}
            </span>
          )}
          {after}
        </p>
        {code && (
          <button
            type="button"
            onClick={copy}
            className="self-start md:self-auto flex-none inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full border-[1.5px] border-heritage-ink text-heritage-ink font-semibold text-[15px] hover:bg-heritage-ink hover:text-heritage-paper transition-colors"
          >
            <Copy size={16} />
            {copied ? 'Copied' : 'Copy code'}
          </button>
        )}
      </div>
    </div>
  );
}
