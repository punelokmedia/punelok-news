'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export default function AdminMarketTrendsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showMarketForm, setShowMarketForm] = useState(false);
  const [marketList, setMarketList] = useState([]);
  const [marketData, setMarketData] = useState({
    title: { marathi: '', hindi: '', english: '' },
    value: { marathi: '', hindi: '', english: '' },
    category: 'other',
    trend: 'neutral',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    const userData = Cookies.get('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    fetchMarket(token);
  }, []);

  const fetchMarket = async (token) => {
    try {
      setLoading(true);
      const marketRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/market`
      );
      setMarketList(marketRes.data);
    } catch (error) {
      console.error('Error fetching market:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarketSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = Cookies.get('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/market/create`,
        marketData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowMarketForm(false);
      setMarketData({
        title: { marathi: '', hindi: '', english: '' },
        value: { marathi: '', hindi: '', english: '' },
        category: 'other',
        trend: 'neutral',
      });
      fetchMarket(token);
    } catch (error) {
      alert('Failed to add market update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMarket = async (id) => {
    if (!confirm('Delete this market update?')) return;
    try {
      const token = Cookies.get('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/market/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMarket(token);
    } catch (error) {
      alert('Failed to delete market update');
    }
  };

  const displayMarketTitle = (item) =>
    item?.title?.marathi || item?.title?.hindi || item?.title?.english || '—';
  const displayMarketValue = (item) =>
    item?.value?.marathi || item?.value?.hindi || item?.value?.english || '—';

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          <p className="mt-4 animate-pulse font-bold text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayoutShell user={user} pageTitle="Market Trends">
      <div className="container mx-auto max-w-6xl">
        <section
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/[0.04]"
          aria-labelledby="section-market-trends"
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50/90 to-white px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-6">
            <div className="min-w-0">
              <h2 id="section-market-trends" className="text-lg font-semibold text-slate-900">
                Market Trends (NFT, Gold, etc.)
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                बाजार दर · NFT, सोने, चांदी, क्रिप्टो ·{' '}
                <span className="text-slate-400">Gold, silver, crypto &amp; more</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowMarketForm(true);
                requestAnimationFrame(() =>
                  document.getElementById('market-inline-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                );
              }}
              className="shrink-0 rounded-lg border border-emerald-200/80 bg-white px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm hover:bg-emerald-50/80"
            >
              Add market rate
            </button>
          </div>

          {showMarketForm && (
            <div id="market-inline-form" className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">Add market trend</h3>
                <button
                  type="button"
                  onClick={() => setShowMarketForm(false)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
              </div>
              <form onSubmit={handleMarketSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Category</label>
                    <select
                      value={marketData.category}
                      onChange={(e) => setMarketData({ ...marketData, category: e.target.value })}
                      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="crypto">Crypto</option>
                      <option value="nft">NFT</option>
                      <option value="stock">Stock</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Trend</label>
                    <select
                      value={marketData.trend}
                      onChange={(e) => setMarketData({ ...marketData, trend: e.target.value })}
                      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="up">Up (green)</option>
                      <option value="down">Down (red)</option>
                      <option value="neutral">Neutral (gray)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3 border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-800">Labels (title)</h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input
                      placeholder="Marathi"
                      value={marketData.title.marathi}
                      onChange={(e) =>
                        setMarketData({ ...marketData, title: { ...marketData.title, marathi: e.target.value } })
                      }
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      required
                    />
                    <input
                      placeholder="Hindi"
                      value={marketData.title.hindi}
                      onChange={(e) =>
                        setMarketData({ ...marketData, title: { ...marketData.title, hindi: e.target.value } })
                      }
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      required
                    />
                    <input
                      placeholder="English"
                      value={marketData.title.english}
                      onChange={(e) =>
                        setMarketData({ ...marketData, title: { ...marketData.title, english: e.target.value } })
                      }
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3 border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-800">Values (rate / price)</h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input
                      placeholder="Marathi value"
                      value={marketData.value.marathi}
                      onChange={(e) =>
                        setMarketData({ ...marketData, value: { ...marketData.value, marathi: e.target.value } })
                      }
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      required
                    />
                    <input
                      placeholder="Hindi value"
                      value={marketData.value.hindi}
                      onChange={(e) =>
                        setMarketData({ ...marketData, value: { ...marketData.value, hindi: e.target.value } })
                      }
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      required
                    />
                    <input
                      placeholder="English value"
                      value={marketData.value.english}
                      onChange={(e) =>
                        setMarketData({ ...marketData, value: { ...marketData.value, english: e.target.value } })
                      }
                      className="rounded border border-slate-300 px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded py-3 text-sm font-semibold uppercase tracking-wide text-white ${
                    isSubmitting ? 'cursor-not-allowed bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving…
                    </span>
                  ) : (
                    'Add to live ticker'
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="overflow-x-auto bg-white">
            <table className="min-w-max w-full table-auto">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-6 text-left">Category</th>
                  <th className="py-4 px-6 text-left">Label</th>
                  <th className="py-4 px-6 text-right">Value</th>
                  <th className="py-4 px-6 text-center">Trend</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-light text-gray-600">
                {marketList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="bg-gray-50 py-8 text-center italic">
                      No market trends added.
                    </td>
                  </tr>
                ) : (
                  marketList.map((item) => (
                    <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left font-bold capitalize text-blue-600">{item.category}</td>
                      <td className="py-3 px-6 text-left">{displayMarketTitle(item)}</td>
                      <td className="py-3 px-6 text-right font-semibold text-slate-900">{displayMarketValue(item)}</td>
                      <td className="py-3 px-6 text-center">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                            item.trend === 'up'
                              ? 'bg-green-100 text-green-700'
                              : item.trend === 'down'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.trend}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteMarket(item._id)}
                          className="transform text-red-400 hover:scale-110 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayoutShell>
  );
}
