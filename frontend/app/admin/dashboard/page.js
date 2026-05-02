'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FaNewspaper, FaCloudUploadAlt, FaBolt, FaGavel, FaBriefcase, FaGraduationCap, FaTrophy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayoutShell, { adminSidebarNewsBtnClass } from '@/components/admin/AdminLayoutShell';

const ADMIN_NEWS_PER_PAGE = 5;

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0, pendingUsers: 0 });
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [formType, setFormType] = useState('live'); // 'live' or 'latest'
  
  // News Management State
  const [newsList, setNewsList] = useState([]);
  const [newsPage, setNewsPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNewsId, setCurrentNewsId] = useState(null);

  // News Form State
  // We keep track of the *previous* language to know what to translate FROM
  const [newsData, setNewsData] = useState({ title: '', content: '', category: 'maharashtra', language: 'marathi', image: null, videoUrl: '', topUpdates: [], isLive: false });
  const [newsError, setNewsError] = useState('');
  const [newsSuccess, setNewsSuccess] = useState('');

  // Logo Overlay State
  const [logo, setLogo] = useState(null);
  const [logoSettings, setLogoSettings] = useState({ x: 5, y: 5, size: 15 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);
  const prevLanguageRef = useRef('marathi');


  useEffect(() => {
    const token = Cookies.get('token');
    const userData = Cookies.get('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/login'); // Strict check
      return;
    }

    setUser(parsedUser);
    fetchData(token);
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(newsList.length / ADMIN_NEWS_PER_PAGE));
    setNewsPage((p) => Math.min(p, totalPages));
  }, [newsList.length]);

  const fetchData = async (token) => {
    try {
      setLoading(true);
      const [statsRes, newsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?limit=200`),
      ]);
      
      setStats(statsRes.data);
      setNewsList(newsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to translate text
  const translateText = async (text, fromLang, toLang) => {
      if (!text || fromLang === toLang) return text;
      try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/translate`, {
              text,
              from: fromLang,
              to: toLang
          });
          return res.data.translatedText;
      } catch (error) {
          console.error("Translation failed", error);
          return text; // Fallback to original
      }
  };

  const handleLanguageChange = async (e) => {
      const newLang = e.target.value;
      const oldLang = newsData.language; // or use prevLanguageRef.current if we update state later
      
      // Update state immediately to reflect selection
      setNewsData(prev => ({ ...prev, language: newLang }));

      // If we have content, try to translate it
      if (newsData.title || newsData.content || newsData.topUpdates.length > 0) {
          // We can show a loading indicator here if we wanted complex UI
          
          const updatePromises = newsData.topUpdates.map(u => translateText(u, oldLang, newLang));

          const [transTitle, transContent, ...transUpdates] = await Promise.all([
             translateText(newsData.title, oldLang, newLang),
             translateText(newsData.content, oldLang, newLang),
             ...updatePromises
          ]);

          setNewsData(prev => ({
              ...prev,
              title: transTitle,
              content: transContent,
              topUpdates: transUpdates
          }));
      }
      
      prevLanguageRef.current = newLang;
  };

  // Drag and Drop Handlers for Logo
  const handleMouseDown = (e) => {
      e.preventDefault(); // Prevent default browser drag
      e.stopPropagation();
      
      if (!containerRef.current) return;
      
      const logoRect = e.target.getBoundingClientRect();
      const offsetX = e.clientX - logoRect.left;
      const offsetY = e.clientY - logoRect.top;
      
      setDragOffset({ x: offsetX, y: offsetY });
      setIsDragging(true);
  };

  const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();

      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate new position relative to container, accounting for the initial click offset
      let newXPixels = e.clientX - containerRect.left - dragOffset.x;
      let newYPixels = e.clientY - containerRect.top - dragOffset.y;

      // Convert to percentages
      let newX = (newXPixels / containerRect.width) * 100;
      let newY = (newYPixels / containerRect.height) * 100;

      // Clamp values (keeping it roughly within bounds, allowing slight overhang)
      newX = Math.max(-10, Math.min(100, newX)); 
      newY = Math.max(-10, Math.min(100, newY));

      setLogoSettings(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  // Attach global mouse listeners when dragging
  useEffect(() => {
      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      } else {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging, dragOffset]); // Re-bind if offset changes (though offset shouldn't change during drag)



  const mergeImages = async (mainImgSource, logoFile, settings) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const mainImg = new Image();
        
        mainImg.crossOrigin = "Anonymous"; // Handle CORS for existing URLs

        mainImg.onload = () => {
             canvas.width = mainImg.width;
             canvas.height = mainImg.height;
             
             // Draw Main Image
             ctx.drawImage(mainImg, 0, 0);

             if (logoFile) {
                 const logoImg = new Image();
                 logoImg.onload = () => {
                     // Calculate position and size based on percentages
                     const logoWidth = (mainImg.width * settings.size) / 100;
                     const logoAspectRatio = logoImg.width / logoImg.height;
                     const logoHeight = logoWidth / logoAspectRatio;
                     
                     const x = (mainImg.width * settings.x) / 100;
                     const y = (mainImg.height * settings.y) / 100;
                     
                     ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
                     
                     canvas.toBlob((blob) => {
                         resolve(blob);
                     }, 'image/jpeg', 0.90);
                 };
                 logoImg.src = URL.createObjectURL(logoFile);
             } else {
                 resolve(null);
             }
        };
        
        mainImg.onerror = (err) => {
            console.error("Error loading main image for merge", err);
            reject(err);
        };

        if (mainImgSource instanceof File) {
             mainImg.src = URL.createObjectURL(mainImgSource);
        } else {
             mainImg.src = mainImgSource; // URL
        }
    });
  };

  const handleNewsSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setNewsError('');
      setNewsSuccess('');

      try {
          const token = Cookies.get('token');
          const formData = new FormData();
          formData.append('title', newsData.title);
          formData.append('content', newsData.content);
          formData.append('category', newsData.category);
          formData.append('language', newsData.language);
          formData.append('topUpdates', JSON.stringify(newsData.topUpdates)); // Send as JSON string
          
          // Set isLive based on form type (if create) or preserve state (if edit)
          const isLiveValue = isEditing ? newsData.isLive : (formType === 'live');
          formData.append('isLive', isLiveValue);
          
          if (newsData.videoUrl) formData.append('videoUrl', newsData.videoUrl);
          
          let imageToUpload = newsData.image;

          // If Logo is present, merge it
          if (logo && newsData.image) {
             try {
                const mergedBlob = await mergeImages(newsData.image, logo, logoSettings);
                if (mergedBlob) {
                    imageToUpload = new File([mergedBlob], "news-image-merged.jpg", { type: "image/jpeg" });
                }
             } catch (mergeErr) {
                 console.error("Merge failed", mergeErr);
                 // Fallback to original image if merge fails, or alert user?
                 // For now, proceed with original, but maybe warn?
             }
          }

          if (imageToUpload instanceof File) {
              formData.append('image', imageToUpload);
          } else if (imageToUpload && isEditing) {
              // Should pass existing image URL if not changed? 
              // Backend logic handles "existingImage" if needed, or we just don't send "image" field to keep old one
              formData.append('existingImage', imageToUpload);
          }

          if (isEditing) {
              await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news/update/${currentNewsId}`, formData, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setNewsSuccess('News updated successfully!');
          } else {
              await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news/create`, formData, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setNewsSuccess('News published successfully!');
          }

          // Refresh Data
          fetchData(token);
          
          // Reset Form but keep modal open briefly to show success
          setTimeout(() => {
             setIsNewsModalOpen(false);
             resetNewsForm();
          }, 1500);

      } catch (err) {
          console.error(err);
          setNewsError(err.response?.data?.message || 'Failed to save news');
      } finally {
          setIsSubmitting(false);
      }
  };

  const resetNewsForm = () => {
      setNewsData({ title: '', content: '', category: 'maharashtra', language: 'marathi', image: null, videoUrl: '', topUpdates: [] });
      setLogo(null);
      setLogoSettings({ x: 5, y: 5, size: 15 });
      setIsEditing(false);
      setCurrentNewsId(null);
      setNewsError('');
      setNewsSuccess('');
  };

  const handleEditNews = (item) => {
      // Helper to strip object if it is one, or return value
      const getValue = (val, lang) => {
          if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
             return val[lang] || val['marathi'] || val['english'] || '';
          }
          return val;
      };
      
      const getUpdates = (val, lang) => {
           if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
             return val[lang] || [];
          }
          return Array.isArray(val) ? val : [];
      }

      // Default to marathi if we are editing and want to pick a starting point
      // Or maybe we want to keep the current language selector?
      // Let's use the current selected language in the form, OR default to marathi
      const currentLang = newsData.language || 'marathi';

      setNewsData({
          title: getValue(item.title, currentLang),
          content: getValue(item.content, currentLang),
          category: item.category,
          language: currentLang, // Keep tracking language for editing context
          image: item.image, 
          videoUrl: item.videoUrl || '',
          topUpdates: getUpdates(item.topUpdates, currentLang)
      });
      setLogo(null); // Reset logo on edit init
      setLogoSettings({ x: 5, y: 5, size: 15 });
      setCurrentNewsId(item._id);
      setIsEditing(true);
      setIsNewsModalOpen(true);
  };

  const handleDeleteNews = async (id) => {
      if(!confirm('Are you sure you want to delete this news article (and all its translated versions)?')) return;
      
      try {
          const token = Cookies.get('token');
          await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news/delete/${id}?all=true`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchData(token);
      } catch (error) {
          alert('Failed to delete news');
      }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
       <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-bold animate-pulse">Initializing Dashboard...</p>
       </div>
    </div>
  );

  const newsTotalPages = Math.max(1, Math.ceil(newsList.length / ADMIN_NEWS_PER_PAGE));
  const newsOffset = (newsPage - 1) * ADMIN_NEWS_PER_PAGE;
  const paginatedNews = newsList.slice(newsOffset, newsOffset + ADMIN_NEWS_PER_PAGE);

  const dashboardSidebarExtra = (
    <>
      <button
        type="button"
        onClick={() => {
          resetNewsForm();
          setFormType('live');
          setIsNewsModalOpen(true);
        }}
        className={adminSidebarNewsBtnClass}
      >
        <FaNewspaper className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span>Add live news</span>
      </button>
      <button
        type="button"
        onClick={() => {
          resetNewsForm();
          setFormType('latest');
          setIsNewsModalOpen(true);
        }}
        className={adminSidebarNewsBtnClass}
      >
        <FaBolt className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        <span>Add latest news</span>
      </button>
      <button
        type="button"
        onClick={() => {
          resetNewsForm();
          setNewsData((prev) => ({ ...prev, category: 'crime' }));
          setFormType('latest');
          setIsNewsModalOpen(true);
        }}
        className={adminSidebarNewsBtnClass}
      >
        <FaGavel className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span>Crime</span>
      </button>
      <button
        type="button"
        onClick={() => {
          resetNewsForm();
          setNewsData((prev) => ({ ...prev, category: 'jobs' }));
          setFormType('latest');
          setIsNewsModalOpen(true);
        }}
        className={adminSidebarNewsBtnClass}
      >
        <FaBriefcase className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span>Jobs</span>
      </button>
      <button
        type="button"
        onClick={() => {
          resetNewsForm();
          setNewsData((prev) => ({ ...prev, category: 'education' }));
          setFormType('latest');
          setIsNewsModalOpen(true);
        }}
        className={adminSidebarNewsBtnClass}
      >
        <FaGraduationCap className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span>Education</span>
      </button>
      <button
        type="button"
        onClick={() => {
          resetNewsForm();
          setNewsData((prev) => ({ ...prev, category: 'sports' }));
          setFormType('latest');
          setIsNewsModalOpen(true);
        }}
        className={adminSidebarNewsBtnClass}
      >
        <FaTrophy className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span>Sports</span>
      </button>
      <button
        type="button"
        onClick={() => {
          document.getElementById('section-manage-news')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        className={adminSidebarNewsBtnClass}
      >
        <FaNewspaper className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span>News list</span>
      </button>
    </>
  );

  return (
    <>
      <AdminLayoutShell user={user} pageTitle="Dashboard Overview" sidebarExtra={dashboardSidebarExtra}>
        <div className="container mx-auto max-w-6xl">
            
            {/* Stats — three equal cards so numbers align; link only on pending card */}
            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
              <div className="flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.04]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total users</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{stats.totalUsers}</p>
                <p className="mt-auto pt-6 text-xs text-slate-400">Registered on site</p>
              </div>
              <div className="flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.04]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Admins</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{stats.totalAdmins}</p>
                <p className="mt-auto pt-6 text-xs text-slate-400">Admin role accounts</p>
              </div>
              <div className="flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.04]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pending</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{stats.pendingUsers}</p>
                <div className="mt-auto pt-4">
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                  >
                    User accounts
                    <span aria-hidden className="text-base leading-none">
                      →
                    </span>
                  </Link>
                  <p className="mt-2 text-xs leading-snug text-slate-500">Approve requests or create users</p>
                </div>
              </div>
            </div>

            {/* Manage News — 5 per page (section: header + table) */}
            <section
              className="mt-10 scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/[0.04] overflow-hidden"
              aria-labelledby="section-manage-news"
            >
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6">
              <div className="min-w-0">
                <h2 id="section-manage-news" className="text-lg font-semibold text-slate-900">Manage news</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {newsList.length} article{newsList.length !== 1 ? 's' : ''} · {ADMIN_NEWS_PER_PAGE} per page
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetNewsForm();
                    setFormType('live');
                    setIsNewsModalOpen(true);
                  }}
                  className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  <FaNewspaper className="mr-2 shrink-0" /> Add live news
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetNewsForm();
                    setFormType('latest');
                    setIsNewsModalOpen(true);
                  }}
                  className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  <FaBolt className="mr-2 shrink-0 text-red-600" /> Add latest news
                </button>
              </div>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="min-w-full table-auto text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 text-center">Category</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                    {newsList.length === 0 ? (
                        <tr><td colSpan={4} className="py-10 text-center text-slate-500 italic">No news articles found.</td></tr>
                    ) : (
                        paginatedNews.map((item) => (
                            <tr key={item._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80">
                                <td className="whitespace-nowrap py-3 px-4 text-slate-600">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex max-w-md items-center gap-3">
                                        {item.image && (
                                            <img src={item.image} alt="" className="h-9 w-9 shrink-0 object-cover ring-1 ring-slate-200" />
                                        )}
                                        <span className="font-medium line-clamp-2" title={typeof item.title === 'string' ? item.title : (item.title?.marathi || item.title?.english || 'Untitled')}>
                                            {typeof item.title === 'string' ? item.title : (item.title?.marathi || item.title?.english || 'Untitled')}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center capitalize text-slate-600">{item.category}</td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <button type="button" onClick={() => handleEditNews(item)} className="text-slate-500 hover:text-indigo-600" aria-label="Edit">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button type="button" onClick={() => handleDeleteNews(item._id)} className="text-slate-500 hover:text-red-600" aria-label="Delete">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
              </table>
              </div>
              {newsList.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-slate-600">
                    Showing{' '}
                    <span className="font-medium tabular-nums text-slate-800">
                      {newsList.length === 0 ? 0 : newsOffset + 1}–{Math.min(newsOffset + ADMIN_NEWS_PER_PAGE, newsList.length)}
                    </span>
                    {' '}of <span className="font-medium tabular-nums text-slate-800">{newsList.length}</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={newsPage <= 1}
                      onClick={() => setNewsPage((p) => Math.max(1, p - 1))}
                      className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="px-2 text-sm tabular-nums text-slate-500">
                      Page {newsPage} / {newsTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={newsPage >= newsTotalPages}
                      onClick={() => setNewsPage((p) => Math.min(newsTotalPages, p + 1))}
                      className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>

        </div>
      </AdminLayoutShell>

        {/* Backdrop for News Drawer */}
        {/* News Drawer with Framer Motion */}
        <AnimatePresence>
          {isNewsModalOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNewsModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
              />
              
              {/* Drawer */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-[60] w-full max-w-xl bg-white shadow-2xl flex flex-col font-sans"
              >
            <div className="h-full flex flex-col font-sans">
                {/* Drawer Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      {formType === 'latest' ? <FaBolt className="mr-3 text-red-600"/> : <FaNewspaper className="mr-3 text-red-600"/>}
                      {isEditing ? 'Edit News' : (formType === 'latest' ? 'Add Latest News' : 'Add Live News')}
                    </h2>
                    <button 
                        onClick={() => setIsNewsModalOpen(false)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Drawer Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                    {newsError && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-5 flex items-start text-sm">
                            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                            <span>{newsError}</span>
                        </div>
                    )}
                    {newsSuccess && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded mb-5 flex items-start text-sm">
                             <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                             <span>{newsSuccess}</span>
                        </div>
                    )}

                    <form id="news-form" onSubmit={handleNewsSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-1.5 uppercase tracking-wide">
                                    {newsData.language === 'marathi' ? 'भाषा' : newsData.language === 'hindi' ? 'भाषा' : 'Language'}
                                </label>
                                <div className="relative">
                                    <select 
                                        value={newsData.language}
                                        onChange={handleLanguageChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors text-sm appearance-none"
                                    >
                                        <option value="marathi">Marathi</option>
                                        <option value="hindi">Hindi</option>
                                        <option value="english">English</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-1.5 uppercase tracking-wide">
                                    {newsData.language === 'marathi' ? 'श्रेणी' : newsData.language === 'hindi' ? 'श्रेणी' : 'Category'}
                                </label>
                                <div className="relative">
                                    <select 
                                        value={newsData.category}
                                        onChange={(e) => setNewsData({...newsData, category: e.target.value})}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors capitalize text-sm appearance-none"
                                    >
                                        <option value="maharashtra">Maharashtra</option>
                                        <option value="crime">Crime</option>
                                        <option value="politics">Politics</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="sports">Sports</option>
                                        <option value="business">Business</option>
                                        <option value="astro">Astro</option>
                                        <option value="lifestyle">Lifestyle</option>
                                        <option value="world">World</option>
                                        <option value="india">India</option>
                                        <option value="jobs">Jobs/Employment</option>
                                        <option value="education">Education</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-1.5 uppercase tracking-wide">
                                {newsData.language === 'marathi' ? 'मथळा (हेडलाईन)' : newsData.language === 'hindi' ? 'शीर्षक (हेडलाइन)' : 'Headline'}
                            </label>
                            <input
                                type="text"
                                value={newsData.title}
                                onChange={(e) => setNewsData({...newsData, title: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors font-semibold text-gray-800 text-sm"
                                required
                                placeholder={newsData.language === 'marathi' ? 'आकर्षक मथळा लिहा...' : newsData.language === 'hindi' ? 'आकर्षक शीर्षक लिखें...' : 'Enter an engaging headline...'}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-1.5 uppercase tracking-wide">
                                {newsData.language === 'marathi' ? 'बातम्यांचा तपशील' : newsData.language === 'hindi' ? 'समाचार विवरण' : 'Combined Full Story'}
                            </label>
                            <textarea
                                value={newsData.content}
                                onChange={(e) => setNewsData({...newsData, content: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors h-40 resize-none leading-relaxed text-sm"
                                required
                                placeholder={newsData.language === 'marathi' ? 'येथे संपूर्ण बातमी लिहा...' : newsData.language === 'hindi' ? 'यहाँ पूरी खबर लिखें...' : 'Write the full news story here...'}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-1.5 uppercase tracking-wide">
                                {newsData.language === 'marathi' ? 'व्हिडिओ लिंक (YouTube/Video URL)' : newsData.language === 'hindi' ? 'वीडियो लिंक' : 'Video URL (Optional)'}
                            </label>
                            <input
                                type="text"
                                value={newsData.videoUrl}
                                onChange={(e) => setNewsData({...newsData, videoUrl: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors font-semibold text-gray-800 text-sm"
                                placeholder="https://youtube.com/..."
                            />
                        </div>

                        {/* Top Updates Section - Only for Live News */}
                        {formType === 'live' && (
                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wide">
                                {newsData.language === 'marathi' ? 'महत्वाचे अपडेट्स (Top Updates)' : newsData.language === 'hindi' ? 'मुख्य अपडेट्स' : 'Top Updates ( Bullet Points )'}
                            </label>
                            
                            <div className="space-y-3 mb-3">
                                {newsData.topUpdates.map((update, index) => (
                                    <div key={index} className="flex gap-2 items-center animate-fadeIn">
                                        <span className="text-gray-400 text-xs font-bold px-1">{index + 1}.</span>
                                        <input
                                            type="text"
                                            value={update}
                                            onChange={(e) => {
                                                const newUpdates = [...newsData.topUpdates];
                                                newUpdates[index] = e.target.value;
                                                setNewsData({...newsData, topUpdates: newUpdates});
                                            }}
                                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-shadow shadow-sm"
                                            placeholder={newsData.language === 'marathi' ? 'येथे अपडेट लिहा...' : 'Type update here...'}
                                            autoFocus={index === newsData.topUpdates.length - 1 && !update} // Auto focus new empty inputs
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const newUpdates = newsData.topUpdates.filter((_, i) => i !== index);
                                                setNewsData({...newsData, topUpdates: newUpdates});
                                            }}
                                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button 
                                type="button" 
                                onClick={() => setNewsData({...newsData, topUpdates: [...newsData.topUpdates, '']})}
                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 text-sm font-semibold hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="text-lg leading-none">+</span> {newsData.language === 'marathi' ? 'नवीन मुद्दा जोडा' : 'Add New Point'}
                            </button>
                        </div>
                        )}

                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-1.5 uppercase tracking-wide">
                                {newsData.language === 'marathi' ? 'फोटो' : newsData.language === 'hindi' ? 'तस्वीर' : 'Media'}
                            </label>
                            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-red-50 hover:border-red-300 transition-colors group cursor-pointer relative bg-white">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setNewsData({...newsData, image: e.target.files[0]})}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                    <FaCloudUploadAlt className="text-gray-400 group-hover:text-red-500 text-3xl mb-2 transition-colors" />
                                    <p className="text-gray-600 font-medium text-sm group-hover:text-red-600 transition-colors">
                                        {newsData.image ? newsData.image.name : (newsData.language === 'marathi' ? 'कव्हर फोटो अपलोड करा' : newsData.language === 'hindi' ? 'कवर फोटो अपलोड करें' : 'Upload Cover Image')}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">MAX 800x400px</p>
                                </div>
                            </div>
                        </div>

                        {/* Logo Overlay Section */}
                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                             <label className="block text-gray-700 text-xs font-bold mb-3 uppercase tracking-wide">
                                {newsData.language === 'marathi' ? 'लोगो किंवा स्टिकर जोडा (Optional)' : 'Add Logo / Sticker Overlay'}
                             </label>
                             
                             <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setLogo(e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                                    />
                                </div>
                                {logo && (
                                    <button 
                                        type="button" 
                                        onClick={() => setLogo(null)}
                                        className="text-red-600 text-xs font-bold hover:underline"
                                    >
                                        Remove Logo
                                    </button>
                                )}
                             </div>

                             {/* Preview Area */}
                             {(newsData.image || logo) && (
                                 <div className="space-y-4">
                                     <div 
                                        ref={containerRef}
                                        className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border border-gray-300 cursor-crosshair select-none"
                                     >
                                         {/* Main Image Layer */}
                                         {newsData.image ? (
                                             <img 
                                                src={newsData.image instanceof File ? URL.createObjectURL(newsData.image) : newsData.image} 
                                                className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                                                alt="Main Preview"
                                             />
                                         ) : (
                                             <div className="text-gray-500 text-xs text-center p-4">
                                                No Main Image Selected.<br/> 
                                                <span className="text-[10px] opacity-70">Upload one to see the preview.</span>
                                             </div>
                                         )}

                                         {/* Logo Layer */}
                                         {logo && (
                                             <img 
                                                src={URL.createObjectURL(logo)}
                                                draggable={false}
                                                onMouseDown={handleMouseDown}
                                                className={`absolute object-contain transition-none shadow-sm hover:shadow-lg hover:ring-2 ring-red-400 rounded-sm cursor-move ${isDragging ? 'opacity-80' : ''}`}
                                                style={{
                                                    left: `${logoSettings.x}%`,
                                                    top: `${logoSettings.y}%`,
                                                    width: `${logoSettings.size}%`,
                                                    maxWidth: '50%',
                                                    maxHeight: '50%',
                                                    zIndex: 10
                                                }}
                                                alt="Logo Preview"
                                             />
                                         )}
                                     </div>
                                     
                                     {/* Controls */}
                                     {logo && (
                                         <div className="grid grid-cols-3 gap-3">
                                             <div>
                                                 <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">X Position ({logoSettings.x}%)</label>
                                                 <input 
                                                    type="range" min="0" max="95" 
                                                    value={logoSettings.x} 
                                                    onChange={(e) => setLogoSettings({...logoSettings, x: Number(e.target.value)})}
                                                    className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                                 />
                                             </div>
                                             <div>
                                                 <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Y Position ({logoSettings.y}%)</label>
                                                 <input 
                                                    type="range" min="0" max="95" 
                                                    value={logoSettings.y} 
                                                    onChange={(e) => setLogoSettings({...logoSettings, y: Number(e.target.value)})}
                                                    className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                                 />
                                             </div>
                                             <div>
                                                 <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Size ({logoSettings.size}%)</label>
                                                 <input 
                                                    type="range" min="1" max="50" 
                                                    value={logoSettings.size} 
                                                    onChange={(e) => setLogoSettings({...logoSettings, size: Number(e.target.value)})}
                                                    className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                                 />
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             )}
                        </div>
                    </form>
                </div>

                {/* Drawer Footer - Sticky */}
                <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end space-x-3">
                    <button 
                         type="button"
                         onClick={() => setIsNewsModalOpen(false)}
                         className="px-5 py-2 rounded-md text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => document.getElementById('news-form').requestSubmit()}
                        disabled={isSubmitting}
                        className={`px-6 py-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white text-sm font-bold rounded-md shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5 flex items-center`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Saving...
                            </>
                        ) : newsSuccess ? (
                            <>
                                <span className="mr-2">✓</span> Published
                            </>
                        ) : (
                            <>
                                <FaNewspaper className="mr-2"/> {isEditing ? 'Update News' : 'Publish Live'}
                            </>
                        )}
                    </button>
                </div>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>
    </>
  );
}
