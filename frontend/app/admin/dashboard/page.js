'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FaPlus, FaNewspaper, FaUsers, FaUserShield, FaCloudUploadAlt } from 'react-icons/fa';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0, pendingUsers: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  
  // News Management State
  const [newsList, setNewsList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNewsId, setCurrentNewsId] = useState(null);

  // New User Form State
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  
  // News Form State
  // We keep track of the *previous* language to know what to translate FROM
  const [newsData, setNewsData] = useState({ title: '', content: '', category: 'maharashtra', language: 'marathi', image: null, videoUrl: '', topUpdates: [] });
  const [newsError, setNewsError] = useState('');
  const [newsSuccess, setNewsSuccess] = useState('');
  
  // Ref to store previous language to detect changes
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
      const [pendingRes, statsRes, newsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/auth/pending-users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/auth/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/news?limit=50') // Get latest 50 news
      ]);
      
      setUsers(pendingRes.data);
      setStats(statsRes.data);
      setNewsList(newsRes.data);
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
          if (newsData.videoUrl) formData.append('videoUrl', newsData.videoUrl);
          
          if (newsData.image instanceof File) {
              formData.append('image', newsData.image);
          } else if (newsData.image && isEditing) {
              // Should pass existing image URL if not changed? 
              // Backend logic handles "existingImage" if needed, or we just don't send "image" field to keep old one
              formData.append('existingImage', newsData.image);
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


  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/');
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-64 bg-gray-900 text-white flex flex-col fixed md:relative z-30 h-full transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xl`}>
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
             onClick={() => { resetNewsForm(); setIsNewsModalOpen(true); }}
             className="w-full flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left"
          >
             <FaNewspaper />
             <span>Add Live News</span>
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
                      <FaNewspaper className="mr-3 text-red-600"/> {isEditing ? 'Edit News' : 'Add Live News'}
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
                                        <option value="politics">Politics</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="sports">Sports</option>
                                        <option value="business">Business</option>
                                        <option value="astro">Astro</option>
                                        <option value="lifestyle">Lifestyle</option>
                                        <option value="world">World</option>
                                        <option value="india">India</option>
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

                        {/* Top Updates Section */}
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
      </div>
     </div>
  );
}
