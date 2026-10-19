import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Enquiry } from '../types';

export default function EnquiriesManagement() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase!
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setEnquiries((data || []) as Enquiry[]);
      } catch (err) {
        console.error('Error fetching enquiries:', err);
        setError('Failed to load enquiries');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const remove = async (id: string) => {
    if (!window.confirm('Delete this enquiry permanently?')) return;
    const { error } = await supabase!.from('enquiries').delete().eq('id', id);
    if (error) { setError('Failed to delete enquiry'); return; }
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
  };

  const lines = ['All', 'HoReCa', 'B2B', 'White label', 'Distributorship'];
  const shown = filter === 'All' ? enquiries : enquiries.filter((e) => e.business_line === filter);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-mimasa-deep">Business Enquiries</h2>

      <div className="flex flex-wrap gap-2">
        {lines.map((l) => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${filter === l ? 'bg-mimasa-primary text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            {l}{l === 'All' ? ` (${enquiries.length})` : ` (${enquiries.filter((e) => e.business_line === l).length})`}
          </button>
        ))}
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-lg shadow-md divide-y">
        {isLoading ? (
          <p className="p-6 text-gray-500">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="p-6 text-gray-500">No enquiries yet.</p>
        ) : (
          shown.map((e) => (
            <div key={e.id} className="p-5 flex items-start gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">{e.business_line}</span>
                  <span className="text-xs text-gray-500">{new Date(e.created_at).toLocaleString()}</span>
                </div>
                <p className="font-semibold text-gray-900">{e.name} <span className="font-normal text-gray-600">· {e.company} · {e.city}</span></p>
                <p className="text-sm text-gray-700">
                  <a className="text-mimasa-primary hover:underline" href={`mailto:${e.email}`}>{e.email}</a>
                  {' · '}
                  <a className="text-mimasa-primary hover:underline" href={`tel:${e.phone}`}>{e.phone}</a>
                </p>
                {e.message && <p className="text-sm text-gray-800 whitespace-pre-wrap pt-1">{e.message}</p>}
              </div>
              <button onClick={() => remove(e.id)} aria-label="Delete enquiry" className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-none">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
