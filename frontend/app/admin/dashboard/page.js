'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FaPlus, FaNewspaper, FaUsers, FaUserShield, FaCloudUploadAlt, FaBolt, FaGavel, FaChartLine, FaBriefcase, FaGraduationCap, FaTrophy, FaBullhorn } from 'react-icons/fa';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0, pendingUsers: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [formType, setFormType] = useState('live'); // 'live' or 'latest'
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [marketList, setMarketList] = useState([]);
  const [marketData, setMarketData] = useState({
    title: { marathi: '', hindi: '', english: '' },
    value: { marathi: '', hindi: '', english: '' },
    category: 'other',
    trend: 'neutral'
  });
  
  // News Management State
  const [newsList, setNewsList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNewsId, setCurrentNewsId] = useState(null);

  // Ads Management State
  const [adsList, setAdsList] = useState([]);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isEditingAd, setIsEditingAd] = useState(false);
  const [currentAdId, setCurrentAdId] = useState(null);
  const [adData, setAdData] = useState({ title: '', link: '', position: 'popup', active: true, image: null });

  // New User Form State
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  
  // News Form State
  // We keep track of the *previous* language to know what to translate FROM
  const [newsData, setNewsData] = useState({ title: '', content: '', category: 'maharashtra', language: 'marathi', image: null, videoUrl: '', topUpdates: [], isLive: false });
  const [newsError, setNewsError] = useState('');
  const [newsSuccess, setNewsSuccess] = useState('');

  // Logo Overlay State
  const [logo, setLogo] = useState(null);
  const [logoSettings, setLogoSettings] = useState({ x: 5, y: 5, size: 15 });
  const [isDragging, setIsDragging] = useState(false);
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

  const fetchData = async (token) => {
    try {
      setLoading(true);
      const [pendingRes, statsRes, newsRes, marketRes, adsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/auth/pending-users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/auth/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/news?limit=50'),
        axios.get('http://localhost:5000/api/market'),
        axios.get('http://localhost:5000/api/ads')
      ]);
      
      setUsers(pendingRes.data);
      setStats(statsRes.data);
      setNewsList(newsRes.data);
      setMarketList(marketRes.data);
      setAdsList(adsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/auth/approve-user', { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh list and stats
      fetchData(token);
    } catch (error) {
      alert('Failed to approve user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    
    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/auth/create-user', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCreateSuccess('Account created successfully!');
      setNewUser({ username: '', password: '', role: 'user' });
      fetchData(token); 
      setTimeout(() => setIsCreateModalOpen(false), 2000);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create user');
    }
  };

  // Helper to translate text
  const translateText = async (text, fromLang, toLang) => {
      if (!text || fromLang === toLang) return text;
      try {
          const res = await axios.post('http://localhost:5000/api/translate', {
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
              await axios.put(`http://localhost:5000/api/news/update/${currentNewsId}`, formData, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setNewsSuccess('News updated successfully!');
          } else {
              await axios.post('http://localhost:5000/api/news/create', formData, {
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
          await axios.delete(`http://localhost:5000/api/news/delete/${id}?all=true`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchData(token);
      } catch (error) {
          alert('Failed to delete news');
      }
  };

  const handleMarketSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/market/create', marketData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsMarketModalOpen(false);
      setMarketData({
        title: { marathi: '', hindi: '', english: '' },
        value: { marathi: '', hindi: '', english: '' },
        category: 'other',
        trend: 'neutral'
      });
      fetchData(token);
    } catch (error) {
      alert('Failed to add market update');
    }
  };

  const handleDeleteMarket = async (id) => {
    if(!confirm('Delete this market update?')) return;
    try {
      const token = Cookies.get('token');
      await axios.delete(`http://localhost:5000/api/market/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(token);
    } catch (error) {
      alert('Failed to delete market update');
    }
  };


  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/');
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
        await axios.put(`http://localhost:5000/api/ads/update/${currentAdId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/ads/create', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setIsAdModalOpen(false);
      resetAdForm();
      fetchData(token);
    } catch (error) {
      alert('Failed to save ad');
    }
  };

  const resetAdForm = () => {
    setAdData({ title: '', link: '', position: 'popup', active: true, image: null });
    setIsEditingAd(false);
    setCurrentAdId(null);
  };

  const handleEditAd = (ad) => {
    setAdData({
      title: ad.title,
      link: ad.link,
      position: ad.position,
      active: ad.active,
      image: ad.imageUrl
    });
    setCurrentAdId(ad._id);
    setIsEditingAd(true);
    setIsAdModalOpen(true);
  };

  const handleDeleteAd = async (id) => {
    if(!confirm('Are you sure you want to delete this ad?')) return;
    try {
      const token = Cookies.get('token');
      await axios.delete(`http://localhost:5000/api/ads/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(token);
    } catch (error) {
      alert('Failed to delete ad');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-64 bg-gray-900 text-white flex flex-col fixed md:relative z-30 h-full transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xl overflow-y-auto scrollbar-hide`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          aside::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="p-6 text-2xl font-bold flex justify-between items-center border-b border-gray-800">
           <span>Admin Panel</span>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">×</button>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button
            onClick={() => setIsNewsModalOpen(false)} // Reset to default view if needed
            className="flex items-center space-x-3 py-3 px-4 rounded-lg bg-gray-800 text-blue-400 border-l-4 border-blue-500"
          >
             <FaUserShield />
             <span>Dashboard</span>
          </button>
          <button 
             onClick={() => { resetNewsForm(); setFormType('live'); setIsNewsModalOpen(true); }}
             className="w-full flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left"
          >
             <FaNewspaper />
             <span>Add Live News</span>
          </button>
          <button 
             onClick={() => { resetNewsForm(); setFormType('latest'); setIsNewsModalOpen(true); }}
             className="w-full flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left"
          >
             <FaBolt />
             <span>Add Latest News</span>
          </button>
          <button 
             onClick={() => { 
                resetNewsForm(); 
                setNewsData(prev => ({ ...prev, category: 'crime' }));
                setFormType('latest'); 
                setIsNewsModalOpen(true); 
             }}
             className="w-full flex items-center space-x-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left text-sm"
          >
             <FaGavel />
             <span>Add Crime News</span>
          </button>
          <button 
             onClick={() => { 
                resetNewsForm(); 
                setNewsData(prev => ({ ...prev, category: 'jobs' }));
                setFormType('latest'); 
                setIsNewsModalOpen(true); 
             }}
             className="w-full flex items-center space-x-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left text-sm"
          >
             <FaBriefcase />
             <span>Add Job News</span>
          </button>
          <button 
             onClick={() => { 
                resetNewsForm(); 
                setNewsData(prev => ({ ...prev, category: 'education' }));
                setFormType('latest'); 
                setIsNewsModalOpen(true); 
             }}
             className="w-full flex items-center space-x-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left text-sm"
          >
             <FaGraduationCap />
             <span>Add Education News</span>
          </button>
          <button 
             onClick={() => { 
                resetNewsForm(); 
                setNewsData(prev => ({ ...prev, category: 'sports' }));
                setFormType('latest'); 
                setIsNewsModalOpen(true); 
             }}
             className="w-full flex items-center space-x-3 py-2.5 px-4 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left text-sm"
          >
             <FaTrophy />
             <span>Add Sports News</span>
          </button>
          <button 
             onClick={() => { 
                setIsMarketModalOpen(true);
             }}
             className="w-full flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left"
          >
             <FaChartLine />
             <span>Market Trends</span>
          </button>
          <button 
             onClick={() => { 
                resetAdForm();
                setIsAdModalOpen(true);
             }}
             className="w-full flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left"
          >
             <FaBullhorn />
             <span>Manage Ads</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 shadow-md">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex justify-between items-center py-4 px-8 bg-white shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 focus:outline-none md:hidden mr-4">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
               Admin: {user?.username}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          <div className="container mx-auto max-w-6xl">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <FaUsers size={24} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Admins</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalAdmins}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                   <FaUserShield size={24} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Pending Approvals</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.pendingUsers}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                   <FaUsers size={24} />
                </div>
              </div>
            </div>

            {/* Actions and Tables */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
              <div className="flex gap-4">
                  <button 
                    onClick={() => { resetNewsForm(); setIsNewsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center"
                  >
                    <FaNewspaper className="mr-2" /> Add Live News
                  </button>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center"
                  >
                    <FaPlus className="mr-2" /> Create User
                  </button>
              </div>
            </div>
            
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              <table className="min-w-max w-full table-auto">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600 uppercase text-xs leading-normal font-semibold tracking-wider">
                    <th className="py-4 px-6 text-left">Username</th>
                    <th className="py-4 px-6 text-left">Role</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 px-6 text-center text-gray-400 italic">No pending user requests at the moment.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="border-b border-gray-100 hover:bg-blue-50 transition duration-150">
                        <td className="py-4 px-6 text-left whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800">{u.username}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-left">
                          <span className="capitalize bg-gray-200 text-gray-700 py-1 px-3 rounded-full text-xs font-bold">{u.role}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="bg-yellow-100 text-yellow-700 py-1 px-3 rounded-full text-xs font-bold">Pending</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={() => handleApprove(u._id)}
                            className="bg-green-100 hover:bg-green-200 text-green-700 py-1 px-4 rounded-md text-xs font-bold transition duration-200 flex items-center justify-center mx-auto"
                          >
                             Approve
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Manage News Section */}
            <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6">Manage News</h2>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              <table className="min-w-max w-full table-auto">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600 uppercase text-xs leading-normal font-semibold tracking-wider">
                    <th className="py-4 px-6 text-left">Date</th>
                    <th className="py-4 px-6 text-left">Title</th>

                    <th className="py-4 px-6 text-center">Category</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {newsList.length === 0 ? (
                        <tr><td colSpan="5" className="py-8 text-center bg-gray-50 italic">No news articles found.</td></tr>
                    ) : (
                        newsList.map((item) => (
                            <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left whitespace-nowrap">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-6 text-left">
                                    <div className="flex items-center">
                                        {item.image && (
                                            <img src={item.image} className="w-8 h-8 rounded object-cover mr-3" />
                                        )}
                                        <span className="font-medium truncate max-w-[200px]" title={typeof item.title === 'string' ? item.title : (item.title?.marathi || item.title?.english || 'Untitled')}>
                                            {typeof item.title === 'string' ? item.title : (item.title?.marathi || item.title?.english || 'Untitled')}
                                        </span>
                                    </div>
                                </td>

                                <td className="py-3 px-6 text-center capitalize">{item.category}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <button onClick={() => handleEditNews(item)} className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDeleteNews(item._id)} className="w-4 mr-2 transform hover:text-red-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            {/* Manage Market Trends */}
            <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6">Market Trends (NFT, Gold, etc.)</h2>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 mb-10">
              <table className="min-w-max w-full table-auto">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600 uppercase text-xs leading-normal font-semibold tracking-wider">
                    <th className="py-4 px-6 text-left">Category</th>
                    <th className="py-4 px-6 text-left">Label (Marathi)</th>
                    <th className="py-4 px-6 text-right">Value</th>
                    <th className="py-4 px-6 text-center">Trend</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {marketList.length === 0 ? (
                        <tr><td colSpan="5" className="py-8 text-center bg-gray-50 italic">No market trends added.</td></tr>
                    ) : (
                        marketList.map((item) => (
                            <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left capitalize font-bold text-blue-600">{item.category}</td>
                                <td className="py-3 px-6 text-left">{item.title.marathi}</td>
                                <td className="py-3 px-6 text-right font-black text-gray-900">{item.value.marathi}</td>
                                <td className="py-3 px-6 text-center">
                                  <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                                    item.trend === 'up' ? 'bg-green-100 text-green-700' : 
                                    item.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {item.trend}
                                  </span>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <button onClick={() => handleDeleteMarket(item._id)} className="text-red-400 hover:text-red-600 transform hover:scale-110">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
              </table>
            </div>

            {/* Manage Ads Section */}
            <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6">Manage Ads (Popup & Sidebar)</h2>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 mb-10">
              <table className="min-w-max w-full table-auto">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600 uppercase text-xs leading-normal font-semibold tracking-wider">
                    <th className="py-4 px-6 text-left">Ad Preview</th>
                    <th className="py-4 px-6 text-left">Title/Link</th>
                    <th className="py-4 px-6 text-center">Position</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {adsList.length === 0 ? (
                        <tr><td colSpan="5" className="py-8 text-center bg-gray-50 italic">No ads added.</td></tr>
                    ) : (
                        adsList.map((ad) => (
                            <tr key={ad._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left">
                                    {ad.imageUrl && (
                                        <img src={ad.imageUrl} className="h-16 w-auto object-contain rounded" alt="ad preview" />
                                    )}
                                </td>
                                <td className="py-3 px-6 text-left">
                                    <div className="font-bold text-gray-800">{ad.title}</div>
                                    <a href={ad.link} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline truncate inline-block max-w-[200px]">{ad.link || 'No Link'}</a>
                                </td>
                                <td className="py-3 px-6 text-center capitalize font-semibold">{ad.position}</td>
                                <td className="py-3 px-6 text-center">
                                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                                        ad.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {ad.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <button onClick={() => handleEditAd(ad)} className="text-blue-500 hover:text-blue-700 mr-3 transform hover:scale-110">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteAd(ad._id)} className="text-red-400 hover:text-red-600 transform hover:scale-110">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Backdrop for News Drawer */}
        {isNewsModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={() => setIsNewsModalOpen(false)}
          ></div>
        )}

        {/* Add Live News Drawer (Right to Left Animation) */}
        <div 
            className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
                isNewsModalOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
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
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-md shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5 flex items-center"
                    >
                        <FaNewspaper className="mr-2"/> {isEditing ? 'Update News' : 'Publish Live'}
                    </button>
                </div>
            </div>
        </div>

      {/* Create User/Admin Modal (Centered - kept as is) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
             <button 
               onClick={() => setIsCreateModalOpen(false)}
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
             >
               ✕
             </button>
             
             <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Account</h2>
             
             {createError && <p className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{createError}</p>}
             {createSuccess && <p className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{createSuccess}</p>}
             
             <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 mt-4"
                >
                  Create Account
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Market Trend Modal */}
      {isMarketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => setIsMarketModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
             <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
               <FaChartLine className="text-blue-600" /> Add Market Trend (NFT, Gold, etc.)
             </h2>
             
             <form onSubmit={handleMarketSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                    <select 
                      value={marketData.category}
                      onChange={(e) => setMarketData({...marketData, category: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Trend</label>
                    <select 
                      value={marketData.trend}
                      onChange={(e) => setMarketData({...marketData, trend: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="up">Up (Green)</option>
                      <option value="down">Down (Red)</option>
                      <option value="neutral">Neutral (Gray)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-gray-700">Display Labels (Title)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <input placeholder="Marathi Label" value={marketData.title.marathi} onChange={(e) => setMarketData({...marketData, title: {...marketData.title, marathi: e.target.value}})} className="px-3 py-2 border rounded" required />
                    <input placeholder="Hindi Label" value={marketData.title.hindi} onChange={(e) => setMarketData({...marketData, title: {...marketData.title, hindi: e.target.value}})} className="px-3 py-2 border rounded" required />
                    <input placeholder="English Label" value={marketData.title.english} onChange={(e) => setMarketData({...marketData, title: {...marketData.title, english: e.target.value}})} className="px-3 py-2 border rounded" required />
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-gray-700">Display Values (Price/Rate)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <input placeholder="Marathi Value" value={marketData.value.marathi} onChange={(e) => setMarketData({...marketData, value: {...marketData.value, marathi: e.target.value}})} className="px-3 py-2 border rounded" required />
                    <input placeholder="Hindi Value" value={marketData.value.hindi} onChange={(e) => setMarketData({...marketData, value: {...marketData.value, hindi: e.target.value}})} className="px-3 py-2 border rounded" required />
                    <input placeholder="English Value" value={marketData.value.english} onChange={(e) => setMarketData({...marketData, value: {...marketData.value, english: e.target.value}})} className="px-3 py-2 border rounded" required />
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-200 uppercase tracking-wider">
                  Add to Live Feed
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Ad Management Modal */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-8 relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => setIsAdModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
             <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
               <FaBullhorn className="text-purple-600" /> {isEditingAd ? 'Edit Ad' : 'Create New Ad'}
             </h2>
             
             <form onSubmit={handleAdSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Ad Title (For Reference)</label>
                  <input
                    type="text"
                    value={adData.title}
                    onChange={(e) => setAdData({...adData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Target Link / URL</label>
                  <input
                    type="url"
                    value={adData.link}
                    onChange={(e) => setAdData({...adData, link: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                    placeholder="https://"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Position</label>
                    <select
                      value={adData.position}
                      onChange={(e) => setAdData({...adData, position: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                    >
                      <option value="popup">Home Page Popup</option>
                      <option value="sidebar">Sidebar Component</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                    <select
                      value={adData.active}
                      onChange={(e) => setAdData({...adData, active: e.target.value === 'true'})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Ad Image/Banner</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setAdData({...adData, image: e.target.files[0]})}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                    required={!isEditingAd}
                  />
                  {adData.image && typeof adData.image === 'string' && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Current Image:</p>
                      <img src={adData.image} alt="current ad" className="h-20 object-contain rounded border" />
                    </div>
                  )}
                  {adData.image && adData.image instanceof File && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">New Image Preview:</p>
                      <img src={URL.createObjectURL(adData.image)} alt="new ad preview" className="h-20 object-contain rounded border" />
                    </div>
                  )}
                </div>
                
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded shadow-md transition duration-200 mt-2">
                  {isEditingAd ? 'Update Ad' : 'Create Ad'}
                </button>
             </form>
          </div>
        </div>
      )}
      </div>
     </div>
  );
}
