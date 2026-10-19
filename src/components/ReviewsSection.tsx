import { FormEvent, useEffect, useState } from 'react';
import { Product, Review } from '../types';
import { supabase, isDemoMode } from '../lib/supabase';
import { Eyebrow } from './heritage/ui';

const inputCls =
  'w-full h-[50px] px-4 bg-heritage-card border border-heritage-input-border rounded-md text-base text-heritage-ink placeholder:text-heritage-soft/70 focus:outline-none focus:border-heritage-copper';
const labelCls = 'block text-sm font-semibold text-heritage-body mb-1.5';

// Sentinel for reviews that don't apply to a single product (stored with product_id = null)
const OTHER = 'other';

function Stars({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span className={`text-heritage-gold tracking-[2px] ${className}`} aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(value)}<span className="text-heritage-line">{'★'.repeat(5 - value)}</span>
    </span>
  );
}

export default function ReviewsSection({ products }: { products: Product[] }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [mobileFormOpen, setMobileFormOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (isDemoMode || !supabase) return;
      const { data, error } = await supabase
        .from('reviews')
        .select('*, product:products(name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);
      if (!error && data) setReviews(data as Review[]);
    };
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rating) { setStatus('error'); setMessage('Please select a star rating.'); return; }
    if (!name.trim() || !productId || !text.trim()) { setStatus('error'); setMessage('Please fill in all required fields.'); return; }
    setStatus('sending');
    setMessage('');
    try {
      if (isDemoMode || !supabase) throw new Error('Demo mode');
      // Reviews are always stored as 'pending'; they appear after an admin approves them
      const { error } = await supabase.from('reviews').insert({
        product_id: productId === OTHER ? null : productId,
        name: name.trim(),
        rating,
        text: text.trim(),
        status: 'pending',
      });
      if (error) throw error;
      setStatus('done');
      setMessage('Thanks! Your review will appear once approved.');
      setRating(0); setName(''); setProductId(''); setText('');
    } catch (err) {
      console.error('Error submitting review:', err);
      setStatus('error');
      setMessage('Sorry, we could not post your review. Please try again.');
    }
  };

  const form = (
    <form onSubmit={submit} className="bg-heritage-card border border-heritage-line rounded-md p-6 md:p-8 flex flex-col gap-4" noValidate>
      <h3 className="font-display text-[26px] font-semibold text-heritage-ink">Write a review</h3>
      <div>
        <span className={labelCls}>Your rating *</span>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className={`text-[30px] leading-none w-9 h-11 ${(hover || rating) >= n ? 'text-heritage-gold' : 'text-heritage-line'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="rv-name" className={labelCls}>Name *</label>
        <input id="rv-name" className={inputCls} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="rv-product" className={labelCls}>Product *</label>
        <select id="rv-product" className={inputCls} value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Select a product</option>
          <option value={OTHER}>All / Other</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="rv-text" className={labelCls}>Your review *</label>
        <textarea id="rv-text" className={`${inputCls} h-[110px] py-3 resize-none`} value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder="What did you cook and how did it taste?" />
      </div>
      {message && (
        <p role="status" className={`text-sm font-medium ${status === 'done' ? 'text-heritage-veg' : 'text-heritage-nonveg'}`}>{message}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="h-[54px] rounded-full bg-heritage-copper text-heritage-paper font-semibold hover:bg-heritage-ink transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? 'Posting…' : 'Post review'}
      </button>
    </form>
  );

  return (
    <section id="reviews" className="scroll-mt-24 bg-heritage-paper border-t border-heritage-line">
      <div className="max-w-[1240px] mx-auto px-5 py-14 md:py-24 grid lg:grid-cols-[1.35fr_1fr] gap-10 lg:gap-14">
        <div>
          <Eyebrow>Customer Reviews</Eyebrow>
          <h2 className="font-display font-semibold text-[34px] md:text-[56px] leading-none text-heritage-ink mt-4 mb-8">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-heritage-muted text-lg">No reviews yet. Be the first to share how it tasted!</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {reviews.map((r, i) => (
                <article
                  key={r.id}
                  className={`bg-heritage-card border border-heritage-line rounded-md px-6 py-[22px] ${reviews.length % 2 === 1 && i === reviews.length - 1 ? 'sm:col-span-2' : ''}`}
                >
                  <Stars value={r.rating} className="text-lg" />
                  <p className="text-base text-heritage-ink mt-2">{r.text}</p>
                  <p className="text-[13px] text-heritage-soft mt-3">
                    <strong className="font-semibold">{r.name}</strong>{r.product?.name ? ` · ${r.product.name}` : ''}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="lg:hidden">
            {!mobileFormOpen && (
              <button onClick={() => setMobileFormOpen(true)} className="w-full min-h-[44px] rounded-full border-[1.5px] border-heritage-ink text-heritage-ink font-semibold hover:bg-heritage-ink hover:text-heritage-paper transition-colors">
                Write a review
              </button>
            )}
            {mobileFormOpen && form}
          </div>
          <div className="hidden lg:block">{form}</div>
        </div>
      </div>
    </section>
  );
}
