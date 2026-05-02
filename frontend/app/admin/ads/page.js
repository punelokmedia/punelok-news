'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export default function AdminAdsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [adsList, setAdsList] = useState([]);
  const [showAdForm, setShowAdForm] = useState(false);
  const [isEditingAd, setIsEditingAd] = useState(false);
  const [currentAdId, setCurrentAdId] = useState(null);
  const [adData, setAdData] = useState({
    title: '',
    link: '',
    position: 'popup',
    active: true,
    image: null,
  });

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
    fetchAds(token);
  }, []);

  const fetchAds = async (token) => {
    try {
      setLoading(true);
      const adsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ads`);
      setAdsList(adsRes.data);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetAdForm = () => {
    setAdData({ title: '', link: '', position: 'popup', active: true, image: null });
    setIsEditingAd(false);
    setCurrentAdId(null);
  };

  const handleAdSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      const formData = new FormData();
      formData.append('title', adData.title);
      formData.append('link', adData.link);
      formData.append('position', adData.position);
      formData.append('active', adData.active);

      if (adData.image instanceof File) {
        formData.append('image', adData.image);
      } else if (isEditingAd && adData.image) {
        formData.append('existingImage', adData.image);
      }

      if (isEditingAd) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ads/update/${currentAdId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ads/create`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowAdForm(false);
      resetAdForm();
      fetchAds(token);
    } catch (error) {
      alert('Failed to save ad');
    }
  };

  const handleEditAd = (ad) => {
    setAdData({
      title: ad.title,
      link: ad.link,
      position: ad.position,
      active: ad.active,
      image: ad.imageUrl,
    });
    setCurrentAdId(ad._id);
    setIsEditingAd(true);
    setShowAdForm(true);
    requestAnimationFrame(() => {
      document.getElementById('ads-inline-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const handleDeleteAd = async (id) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
      const token = Cookies.get('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ads/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAds(token);
    } catch (error) {
      alert('Failed to delete ad');
    }
  };

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
    <AdminLayoutShell user={user} pageTitle="Ads (popup & sidebar)">
      <div className="container mx-auto max-w-6xl">
        <section
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/[0.04]"
          aria-labelledby="section-ads"
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-violet-50/90 to-white px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-6">
            <div className="min-w-0">
              <h2 id="section-ads" className="text-lg font-semibold text-slate-900">
                Ads (popup &amp; sidebar)
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                पॉपअप आणि साइडबार जाहिराती ·{' '}
                <span className="text-slate-400">Popup &amp; sidebar placements</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetAdForm();
                setShowAdForm(true);
                requestAnimationFrame(() =>
                  document.getElementById('ads-inline-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                );
              }}
              className="shrink-0 rounded-lg border border-violet-200/80 bg-white px-4 py-2 text-sm font-medium text-violet-900 shadow-sm hover:bg-violet-50/80"
            >
              New ad
            </button>
          </div>

          {showAdForm && (
            <div id="ads-inline-form" className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">{isEditingAd ? 'Edit ad' : 'New ad'}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdForm(false);
                    resetAdForm();
                  }}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
              </div>
              <form onSubmit={handleAdSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Title (reference)</label>
                  <input
                    type="text"
                    value={adData.title}
                    onChange={(e) => setAdData({ ...adData, title: e.target.value })}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Link / URL</label>
                  <input
                    type="url"
                    value={adData.link}
                    onChange={(e) => setAdData({ ...adData, link: e.target.value })}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="https://"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Position</label>
                    <select
                      value={adData.position}
                      onChange={(e) => setAdData({ ...adData, position: e.target.value })}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="popup">Home popup</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                    <select
                      value={adData.active ? 'true' : 'false'}
                      onChange={(e) => setAdData({ ...adData, active: e.target.value === 'true' })}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Banner image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAdData({ ...adData, image: e.target.files?.[0] ?? null })}
                    className="w-full text-sm text-slate-600 file:mr-4 file:rounded file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-800 hover:file:bg-purple-100"
                    required={!isEditingAd}
                  />
                  {adData.image && typeof adData.image === 'string' && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs text-slate-500">Current</p>
                      <img src={adData.image} alt="" className="h-20 rounded border border-slate-200 object-contain" />
                    </div>
                  )}
                  {adData.image && adData.image instanceof File && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs text-slate-500">Preview</p>
                      <img src={URL.createObjectURL(adData.image)} alt="" className="h-20 rounded border border-slate-200 object-contain" />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full rounded bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  {isEditingAd ? 'Update ad' : 'Create ad'}
                </button>
              </form>
            </div>
          )}

          <div className="overflow-x-auto bg-white">
            <table className="min-w-max w-full table-auto">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-6 text-left">Ad Preview</th>
                  <th className="py-4 px-6 text-left">Title/Link</th>
                  <th className="py-4 px-6 text-center">Position</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-light text-gray-600">
                {adsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="bg-gray-50 py-8 text-center italic">
                      No ads added.
                    </td>
                  </tr>
                ) : (
                  adsList.map((ad) => (
                    <tr key={ad._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">
                        {ad.imageUrl && (
                          <img src={ad.imageUrl} className="h-16 w-auto rounded object-contain" alt="ad preview" />
                        )}
                      </td>
                      <td className="py-3 px-6 text-left">
                        <div className="font-bold text-gray-800">{ad.title}</div>
                        <a
                          href={ad.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block max-w-[200px] truncate text-xs text-blue-500 hover:underline"
                        >
                          {ad.link || 'No Link'}
                        </a>
                      </td>
                      <td className="py-3 px-6 text-center font-semibold capitalize">{ad.position}</td>
                      <td className="py-3 px-6 text-center">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                            ad.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {ad.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleEditAd(ad)}
                          className="mr-3 transform text-blue-500 hover:scale-110 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAd(ad._id)}
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
