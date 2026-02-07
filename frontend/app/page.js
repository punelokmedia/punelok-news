'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaCalendarAlt, FaFire, FaRegNewspaper, FaClock, FaChevronRight } from 'react-icons/fa';

export default function Home() {
  const { language } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/news?language=${language}`);
        setNews(res.data);
      } catch (error) {
        console.error("Failed to fetch news", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [language]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading Latest News...</p>
        </div>
      </div>
    );
  }

  // Determine main story, side links (next 3), and grid stories (rest)
  const featured = news[0];
  const sideLinks = news.slice(1, 4);
  const gridStories = news.slice(4);

  // Helper to get localized content safely
  const getLocalizedContent = (item, field) => {
    if (!item || !item[field]) return '';
    
    // Legacy support: if field is a string, return it directly
    if (typeof item[field] === 'string') return item[field];
    
    // New object structure
    if (typeof item[field] === 'object') {
        // Return the requested language if it exists and is valid
        const localizedText = item[field][language];
        if (localizedText && localizedText.trim().length > 0) {
            return localizedText;
        }

        // Fallback priority
        return item[field].english || item[field].marathi || item[field].hindi || '';
    }
    return '';
  };

  const getLocalizedUpdates = (item) => {
      if (!item || !item.topUpdates) return [];
      if (Array.isArray(item.topUpdates) && typeof item.topUpdates[0] === 'string') {
          // Backward compatibility if it was just array of strings (unlikely now)
          return item.topUpdates;
      }
      // New object structure
      if (item.topUpdates[language]) {
          return item.topUpdates[language];
      }
      return item.topUpdates.english || [];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Container */}
      <div className="container mx-auto max-w-[1200px] px-4 py-6">

        {/* Hero Section - News Portal Style */}
      {/* Main Layout Container */}
      <div className="container mx-auto max-w-[1280px] px-2 py-4 flex gap-4">
        
        {/* Left Explorer Sidebar (Desktop Only) */}
        <div className="hidden lg:flex flex-col w-[100px] shrink-0 space-y-4 pt-2">
            <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-12 h-12 bg-[#b30000] rounded-full flex items-center justify-center text-white mb-1 shadow-md group-hover:bg-red-700 transition">
                    <div className="grid grid-cols-3 gap-0.5">
                        {[...Array(9)].map((_,i)=><div key={i} className="w-1 h-1 bg-white rounded-full"></div>)}
                    </div>
                </div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">Explore</span>
            </div>

            {[
                { label: language === 'english' ? 'Live TV' : language === 'hindi' ? 'लाइव टीवी' : 'लाईव्ह टीव्ही', icon: <FaClock /> },
                { label: language === 'english' ? 'Videos' : language === 'hindi' ? 'वीडियो' : 'व्हिडिओ', icon: <div className="text-xl">▶</div> },
                { label: language === 'english' ? 'Shorts' : language === 'hindi' ? 'शॉर्ट्स' : 'शॉर्ट्स', icon: <FaFire /> },
                { label: language === 'english' ? 'Gallery' : language === 'hindi' ? 'गैलरी' : 'गॅलरी', icon: <FaRegNewspaper /> },
            ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-pointer text-gray-600 hover:text-[#b30000] transition">
                    <div className="text-2xl mb-1 opacity-70 group-hover:opacity-100">{item.icon}</div>
                    <span className="text-[10px] font-bold text-center leading-tight">{item.label}</span>
                </div>
            ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
            {/* Hero Section - Red Banner Style */}
            {/* Hero Section - Red Banner Style (ABP Layout) */}
            {featured ? (
              <div className="flex flex-col lg:flex-row shadow-2xl overflow-hidden bg-black min-h-[450px] border-b-4 border-red-600">
                  
                  {/* Part 1: Main Story (Image + Headline Overlay) - 70% */}
                  <div className="lg:w-[70%] relative group cursor-pointer overflow-hidden">
                      {/* Main Image */}
                      <div className="absolute inset-0">
                          <img 
                              src={featured.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'} 
                              alt={getLocalizedContent(featured, 'title')}
                              className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                              onError={(e) => {e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1600&auto=format&fit=crop&q=60"}} 
                          />
                          {/* Dark Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-6 lg:p-10 flex flex-col justify-end h-full">
                          <div className="self-start">
                              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-sm mb-3 inline-block">
                                  {featured.category} | BREAKING
                              </span>
                          </div>
                          
                          <h1 className="text-2xl lg:text-4xl font-extrabold text-white leading-tight mb-3 drop-shadow-md line-clamp-3 group-hover:text-red-400 transition-colors">
                              {getLocalizedContent(featured, 'title')}
                          </h1>

                          <p className="hidden md:block text-gray-200 text-sm md:text-base font-medium mb-4 drop-shadow-sm line-clamp-2 max-w-3xl opacity-90 leading-relaxed">
                              {getLocalizedContent(featured, 'content')}
                          </p>
                          
                          <div className="flex items-center text-gray-300 text-xs font-semibold uppercase tracking-widest mt-1">
                              {/* Optional: Add Time or Author here */}
                              <span className="flex items-center"><FaClock className="mr-2" /> Live Updates</span>
                          </div>
                      </div>
                  </div>

                  {/* Part 2: Top Updates List (Right) - 30% */}
                  <div className="lg:w-[30%] bg-[#b30000] p-6 flex flex-col relative w-full border-l border-red-800">
                      <div className="flex items-center justify-between mb-5 border-b border-red-800 pb-3">
                        <h3 className="text-white uppercase text-sm font-extrabold flex items-center tracking-wide">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
                            Top Updates
                        </h3>
                         <span className="text-[10px] text-red-200 font-mono animate-pulse">LIVE</span>
                      </div>
                      
                      <div className="flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[300px] lg:max-h-none">
                          {(getLocalizedUpdates(featured).length > 0 ? getLocalizedUpdates(featured) : sideLinks).map((item, idx) => (
                              <div key={idx} className="group cursor-pointer flex items-start p-2 rounded hover:bg-black/20 transition-colors">
                                  <span className="text-yellow-400 mr-3 mt-1 text-sm">▶</span>
                                  <p className="text-sm font-medium leading-snug text-white group-hover:text-yellow-100 transition-colors line-clamp-3">
                                      {typeof item === 'string' ? item : getLocalizedContent(item, 'title')}
                                  </p>
                              </div>
                          ))}
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-red-800 text-center">
                           <a href="/latest" className="inline-block px-6 py-2 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-red-700 transition-all">
                               View All News
                           </a>
                      </div>
                  </div>
              </div>
            ) : (
               <div className="bg-gray-100 p-12 text-center rounded text-gray-500 italic mb-10 border-2 border-dashed border-gray-300">
                  <div className="text-4xl mb-2 text-gray-300">📰</div>
                   News feed is empty. Please add news from the Admin Dashboard.
               </div>
            )}
            
            {/* Grid Section Below */}

        {/* Clean Grid Section */}
        {gridStories.length > 0 && (
          <div>
            <div className="flex items-center mb-6 pl-2 border-l-4 border-red-600">
               <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">
                  {language === 'marathi' ? 'ताज्या बातम्या' : 'Recent Stories'}
               </h2>
            </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {gridStories.map(item => (
                   <div key={item._id} className="group cursor-pointer flex flex-col h-full">
                      {/* Image Container - No Radius, No Shadow */}
                      <div className="relative aspect-video mb-3 overflow-hidden bg-gray-100">
                         <img 
                            src={item.image} 
                            alt={getLocalizedContent(item, 'title')}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                            onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/600x400/png?text=News"}}
                         />
                         {/* Play Icon Placeholder - Optional visual cue */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                             <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                <FaChevronRight className="text-white ml-0.5" />
                             </div>
                         </div>
                      </div>
                      
                      {/* Text Content - Low visual noise */}
                      <div className="flex flex-col flex-1">
                         <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-red-700 transition-colors">
                            {getLocalizedContent(item, 'title')}
                         </h3>
                         <div className="flex items-center text-xs text-gray-500 mt-auto font-medium">
                            <span className="text-red-600 uppercase mr-2">{item.category}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}
        </div>
      </div>
     </div>
    </div>
  );
}
