import { useEffect, useState } from 'react';
import { getAllCartConfigs } from './cartConfig';

// Storefront settings stored in cart_config (editable from Admin > Settings):
//   social_facebook, social_instagram  - full profile URLs (icon hidden when empty)
//   whatsapp_number                    - digits with country code, e.g. 918421794918
//   offer_code                         - optional coupon code shown in the offer banner
//   enquiry_sheet_url                  - optional Google Apps Script URL that also receives enquiries
export interface SiteConfig {
  facebook: string;
  instagram: string;
  whatsapp: string;
  offerBanner: string;
  offerCode: string;
  enquirySheetUrl: string;
  freeShippingThreshold: number;
}

const DEFAULTS: SiteConfig = {
  facebook: '',
  instagram: '',
  whatsapp: '918421794918',
  offerBanner: '',
  offerCode: '',
  enquirySheetUrl: '',
  freeShippingThreshold: 500,
};

let cache: Promise<SiteConfig> | null = null;

function load(): Promise<SiteConfig> {
  if (!cache) {
    cache = getAllCartConfigs()
      .then((rows) => {
        const m: Record<string, string> = {};
        rows.forEach((r) => { m[r.name] = r.value; });
        const threshold = parseFloat(m.free_shipping);
        return {
          facebook: (m.social_facebook || '').trim(),
          instagram: (m.social_instagram || '').trim(),
          whatsapp: (m.whatsapp_number || DEFAULTS.whatsapp).replace(/\D/g, ''),
          offerBanner: (m.offer_banner || '').trim(),
          offerCode: (m.offer_code || '').trim(),
          enquirySheetUrl: (m.enquiry_sheet_url || '').trim(),
          freeShippingThreshold: Number.isFinite(threshold) ? threshold : DEFAULTS.freeShippingThreshold,
        };
      })
      .catch(() => DEFAULTS);
  }
  return cache;
}

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(DEFAULTS);
  useEffect(() => {
    let alive = true;
    load().then((c) => { if (alive) setConfig(c); });
    return () => { alive = false; };
  }, []);
  return config;
}

/** The coupon code for the banner: explicit offer_code, else the token after "code " in the text. */
export function resolveOfferCode(banner: string, explicit: string): string {
  if (explicit) return explicit;
  const m = banner.match(/code\s+([A-Z0-9-]+)/i);
  return m ? m[1] : '';
}
