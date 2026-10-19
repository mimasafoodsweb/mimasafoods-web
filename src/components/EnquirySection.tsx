import { FormEvent, useState } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { Eyebrow, WhatsAppIcon } from './heritage/ui';
import { SiteConfig } from '../utils/siteConfig';

const LINES = ['HoReCa', 'B2B', 'White label', 'Distributorship'];

const inputCls =
  'w-full h-[50px] px-4 bg-heritage-card border border-heritage-input-border rounded-md text-base text-heritage-ink placeholder:text-heritage-soft/70 focus:outline-none focus:border-heritage-copper';
const labelCls = 'block text-sm font-semibold text-heritage-body mb-1.5';

export default function EnquirySection({ config }: { config: SiteConfig }) {
  const [line, setLine] = useState('');
  const [f, setF] = useState({ name: '', company: '', phone: '', email: '', city: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const phone = f.phone.replace(/\s+/g, '');
    if (!line || !f.name.trim() || !f.company.trim() || !phone || !f.email.trim() || !f.city.trim()) {
      setStatus('error'); setMessage('Please select a business line and fill in all required fields.'); return;
    }
    if (!/^\d{10}$/.test(phone)) { setStatus('error'); setMessage('Please enter a valid 10-digit contact number.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { setStatus('error'); setMessage('Please enter a valid email address.'); return; }

    setStatus('sending'); setMessage('');
    const record = {
      business_line: line,
      name: f.name.trim(),
      company: f.company.trim(),
      phone,
      email: f.email.trim(),
      city: f.city.trim(),
      message: f.message.trim() || null,
    };
    try {
      if (isDemoMode || !supabase) throw new Error('Demo mode');
      const { error } = await supabase.from('enquiries').insert(record);
      if (error) throw error;

      // Optional: also forward to a Google Apps Script web app (configured in Admin > Settings)
      if (config.enquirySheetUrl) {
        fetch(config.enquirySheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ ...record, submitted_at: new Date().toISOString() }),
        }).catch((err) => console.warn('Enquiry sheet forward failed:', err));
      }

      setStatus('done');
      setMessage('Thank you! Our team will get back to you shortly.');
      setLine(''); setF({ name: '', company: '', phone: '', email: '', city: '', message: '' });
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      setStatus('error');
      setMessage('Sorry, we could not send your enquiry. Please try again or email us.');
    }
  };

  return (
    <section id="enquiry" className="scroll-mt-24 bg-heritage-paper border-t border-heritage-line">
      <div className="max-w-[1240px] mx-auto px-5 py-14 md:py-24 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16">
        <div>
          <Eyebrow>Business Enquiries</Eyebrow>
          <h2 className="font-display font-semibold text-[34px] md:text-[56px] leading-none text-heritage-ink mt-4 mb-6">Enquiry</h2>
          <p className="text-base md:text-lg text-heritage-body leading-relaxed">
            This website serves retail customers. For HoReCa, B2B, White label or Distributorship, send us an enquiry and our team will get back to you.
          </p>
          <div className="border-t border-heritage-line mt-8 pt-6 space-y-2 text-heritage-body">
            <p>Email: <a className="hover:text-heritage-copper" href="mailto:mimasafoods@gmail.com">mimasafoods@gmail.com</a></p>
            <p>Phone: <a className="hover:text-heritage-copper" href="tel:+918421794918">+91 8421794918</a></p>
            {config.whatsapp && (
              <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-heritage-copper font-semibold pt-2 hover:underline">
                <WhatsAppIcon size={18} /> Chat on WhatsApp
              </a>
            )}
          </div>
        </div>

        <form onSubmit={submit} noValidate className="bg-heritage-card border border-heritage-line rounded-md p-6 md:p-8 flex flex-col gap-5">
          <div>
            <span className={labelCls}>Business line *</span>
            <div className="flex flex-wrap gap-2">
              {LINES.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={line === l}
                  onClick={() => setLine(l)}
                  className={`h-10 px-4 rounded-full border text-sm font-semibold transition-colors ${line === l ? 'bg-heritage-ink text-heritage-paper border-heritage-ink' : 'bg-heritage-card text-heritage-ink border-heritage-input-border hover:border-heritage-ink'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div><label htmlFor="en-name" className={labelCls}>Full Name *</label><input id="en-name" className={inputCls} value={f.name} maxLength={100} onChange={set('name')} placeholder="Enter your full name" /></div>
            <div><label htmlFor="en-company" className={labelCls}>Company / Business Name *</label><input id="en-company" className={inputCls} value={f.company} maxLength={150} onChange={set('company')} placeholder="Your business name" /></div>
            <div><label htmlFor="en-phone" className={labelCls}>Contact Number *</label><input id="en-phone" inputMode="numeric" className={inputCls} value={f.phone} maxLength={10} onChange={set('phone')} placeholder="10-digit mobile number" /></div>
            <div><label htmlFor="en-email" className={labelCls}>Email Address *</label><input id="en-email" type="email" className={inputCls} value={f.email} maxLength={200} onChange={set('email')} placeholder="your@email.com" /></div>
          </div>
          <div><label htmlFor="en-city" className={labelCls}>City *</label><input id="en-city" className={inputCls} value={f.city} maxLength={100} onChange={set('city')} placeholder="City / region" /></div>
          <div><label htmlFor="en-msg" className={labelCls}>Message</label><textarea id="en-msg" className={`${inputCls} h-[100px] py-3 resize-none`} value={f.message} maxLength={2000} onChange={set('message')} placeholder="Tell us about your requirement" /></div>
          {message && <p role="status" className={`text-sm font-medium ${status === 'done' ? 'text-heritage-veg' : 'text-heritage-nonveg'}`}>{message}</p>}
          <button type="submit" disabled={status === 'sending'} className="h-[54px] rounded-full bg-heritage-copper text-heritage-paper font-semibold hover:bg-heritage-ink transition-colors disabled:opacity-60">
            {status === 'sending' ? 'Sending…' : 'Send enquiry'}
          </button>
        </form>
      </div>
    </section>
  );
}
