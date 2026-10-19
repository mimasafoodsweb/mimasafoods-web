import { useEffect, useState } from 'react';
import { Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

type Filter = 'pending' | 'approved' | 'rejected' | 'all';

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error } = await supabase!
        .from('reviews')
        .select('*, product:products(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReviews((data || []) as Review[]);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const setStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    const { error } = await supabase!.from('reviews').update({ status }).eq('id', id);
    if (error) { setError('Failed to update review'); return; }
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    const { error } = await supabase!.from('reviews').delete().eq('id', id);
    if (error) { setError('Failed to delete review'); return; }
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const counts = {
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
    all: reviews.length,
  };
  const shown = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);

  const badge = (status: string) =>
    status === 'approved' ? 'bg-green-100 text-green-800' : status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-mimasa-deep">Customer Reviews</h2>
      <p className="text-sm text-gray-600">New reviews wait here as <strong>pending</strong>. Only <strong>approved</strong> reviews appear on the website.</p>

      <div className="flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${filter === f ? 'bg-mimasa-primary text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-lg shadow-md divide-y">
        {isLoading ? (
          <p className="p-6 text-gray-500">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="p-6 text-gray-500">No {filter === 'all' ? '' : filter} reviews.</p>
        ) : (
          shown.map((r) => (
            <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-yellow-500 tracking-wider">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${badge(r.status)}`}>{r.status}</span>
                  <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-gray-900 whitespace-pre-wrap">{r.text}</p>
                <p className="mt-1 text-sm text-gray-500"><strong>{r.name}</strong>{` · ${r.product?.name ?? 'All / Other'}`}</p>
              </div>
              <div className="flex gap-2 flex-none">
                {r.status !== 'approved' && (
                  <button onClick={() => setStatus(r.id, 'approved')} className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => setStatus(r.id, 'rejected')} className="inline-flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300">
                    <X className="w-4 h-4" /> Reject
                  </button>
                )}
                <button onClick={() => remove(r.id)} aria-label="Delete review" className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
