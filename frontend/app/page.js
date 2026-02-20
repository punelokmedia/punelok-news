'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import Image from 'next/image'; // Added Import
import { useRouter } from 'next/navigation';
import { FaChevronRight, FaBolt, FaCaretRight, FaClock, FaFire, FaRegNewspaper, FaHeadphones, FaThLarge, FaTrophy, FaGraduationCap, FaBriefcase, FaChartLine } from 'react-icons/fa';
import HorizontalTicker from '@/components/HorizontalTicker';
import CricketDashboard from '@/components/CricketDashboard';

// ... (NewsTicker component remains unchanged) ...
const NewsTicker = ({ items, getLocalizedContent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 4) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000); // Faster tick for smoother feel
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className="flex flex-col h-full min-h-0 relative overflow-hidden mask-linear-fade">
      <div 
        className="flex flex-col space-y-4 transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${currentIndex * 60}px)` }} // Approximate height of each item + gap
      >
        {items.map((item, idx) => (
          <div key={idx} className="group cursor-pointer flex items-start gap-3 min-w-0 overflow-hidden shrink-0 h-[48px]"> 
              <FaCaretRight className="text-white mt-[5px] text-lg shrink-0 flex-shrink-0 drop-shadow-md" />
              <p className="hero-bullet-text text-base sm:text-lg font-medium text-white leading-snug flex-1 text-left line-clamp-2 font-['Kohinoor_Devanagari','Mukta',sans-serif] drop-shadow-sm">
                {typeof item === 'string' ? item : getLocalizedContent(item, 'title')}
              </p>
          </div>
        ))}
      </div>
      {/* Gradient mask at bottom to fade out text */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#c40404] to-transparent pointer-events-none"></div>
    </div>
  );
};

export default function Home() {
  const { language } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Only set interval if we have live items
    const liveCount = news.filter(n => n.isLive).length;
    if (liveCount <= 1) return;

    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % liveCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [news]);

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

  // --- Horizontal Ticker Component ---
  // Moved to components/HorizontalTicker.js

  // Live News (hero) = sirf isLive true wale; Latest News = baki sab (jo tum add karte ho)
  const liveItems = news.filter(item => item.isLive);
  
  // Ensure we don't go out of bounds if liveItems changes
  const safeIndex = activeHeroIndex < liveItems.length ? activeHeroIndex : 0;
  const featured = liveItems[safeIndex] || null;
  
  // Side links: all live items EXCEPT the current featured one
  const sideLinks = liveItems.filter((_, idx) => idx !== safeIndex);

  // We want to exclude ALL live items from lower sections to avoid duplication
  const allLiveIds = new Set(liveItems.map(n => n._id || n.id));
  
  const latestNewsItems = news
    .filter(item => !item.isLive)
    .filter(item => !allLiveIds.has(item._id || item.id))
    .filter((item, index, arr) => arr.findIndex(n => (n._id || n.id) === (item._id || item.id)) === index);
  const stripItems = latestNewsItems.slice(0, 6);
  const shownInStripIds = new Set(stripItems.map(n => n._id || n.id));
  const gridStories = news.filter(
    item => !allLiveIds.has(item._id || item.id) && !shownInStripIds.has(item._id || item.id)
  );
  
  // Politics Section Filter
  const allPoliticsNews = news
    .filter(item => item.category === 'politics' && !item.isLive)
    // Filter duplicates
    .filter((item, index, arr) => arr.findIndex(n => (n._id || n.id) === (item._id || item.id)) === index);
    
  const politicsNews = allPoliticsNews.slice(0, 4);

  const shownPoliticsIds = new Set(politicsNews.map(n => n._id || n.id));

  // Maharashtra Section Filter
  const allMaharashtraNews = news
    .filter(item => item.category === 'maharashtra' && !item.isLive)
    // Filter duplicates
    .filter((item, index, arr) => arr.findIndex(n => (n._id || n.id) === (item._id || item.id)) === index);
    
  const maharashtraNews = allMaharashtraNews.slice(0, 4);
  const shownMaharashtraIds = new Set(maharashtraNews.map(n => n._id || n.id));

  // Entertainment Section Filter
  const allEntertainmentNews = news.filter(item => item.category === 'entertainment' && !item.isLive)
    .filter((item, index, arr) => arr.findIndex(n => (n._id || n.id) === (item._id || item.id)) === index);
  const entertainmentNews = allEntertainmentNews.slice(0, 4);
  const shownEntertainmentIds = new Set(entertainmentNews.map(n => n._id || n.id));

  // Sports Section Filter
  const allSportsNews = news.filter(item => item.category === 'sports' && !item.isLive)
    .filter((item, index, arr) => arr.findIndex(n => (n._id || n.id) === (item._id || item.id)) === index);
  const sportsNews = allSportsNews.slice(0, 4);
  const shownSportsIds = new Set(sportsNews.map(n => n._id || n.id));

  // Business Section Filter
  const allBusinessNews = news.filter(item => item.category === 'business' && !item.isLive)
    .filter((item, index, arr) => arr.findIndex(n => (n._id || n.id) === (item._id || item.id)) === index);
  const businessNews = allBusinessNews.slice(0, 4);
  const shownBusinessIds = new Set(businessNews.map(n => n._id || n.id));

  // Astro Section Filter
  const allAstroNews = news.filter(item => item.category === 'astro' && !item.isLive)
    .filter((item, index, arr) => arr.findIndex(n => (n._id || n.id) === (item._id || item.id)) === index);
  const astroNews = allAstroNews.slice(0, 4);
  const shownAstroIds = new Set(astroNews.map(n => n._id || n.id));

  // Lifestyle Section Filter
  const allLifestyleNews = news.filter(item => item.category === 'lifestyle' && !item.isLive)
    .filter((item, index, arr) => arr.findIndex(n => (n._id || n.id) === (item._id || item.id)) === index);
  const lifestyleNews = allLifestyleNews.slice(0, 4);
  const shownLifestyleIds = new Set(lifestyleNews.map(n => n._id || n.id));

  // Crime Section Filter (New)
  const allCrimeNews = news.filter(item => item.category === 'crime' && !item.isLive)
    .filter((item, index, arr) => arr.findIndex(n => (n._id || n.id) === (item._id || item.id)) === index);
  const crimeNews = allCrimeNews.slice(0, 1); // We only need 1 for the bottom features
  const shownCrimeIds = new Set(crimeNews.map(n => n._id || n.id));

  // Update gridStories to exclude ALL items shown in dedicated sections
  const remainingGridStories = gridStories.filter(item => 
    !shownPoliticsIds.has(item._id || item.id) && 
    !shownMaharashtraIds.has(item._id || item.id) &&
    !shownEntertainmentIds.has(item._id || item.id) &&
    !shownSportsIds.has(item._id || item.id) &&
    !shownBusinessIds.has(item._id || item.id) &&
    !shownAstroIds.has(item._id || item.id) &&
    !shownAstroIds.has(item._id || item.id) &&
    !shownLifestyleIds.has(item._id || item.id) &&
    !shownCrimeIds.has(item._id || item.id)
  );

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

  // Split hero title into two lines: first black, second dark red (reference design)
  const getHeroTitleLines = (item) => {
    const full = getLocalizedContent(item, 'title') || '';
    // Added hyphen to regex for better splitting
    const splitAt = full.match(/[।?!.,-]\s*/);
    const idx = splitAt ? full.indexOf(splitAt[0]) + splitAt[0].length : Math.ceil(full.length / 2);
    const line1 = full.slice(0, idx).trim();
    const line2 = full.slice(idx).trim();
    return { line1, line2 };
  };

  const getLocalizedUpdates = (item) => {
      if (!item || !item.topUpdates) return [];
      
      // If it's an old array structure (legacy), return it
      if (Array.isArray(item.topUpdates)) return item.topUpdates;

      // New object structure: try current language, then fallbacks
      const updates = item.topUpdates;
      if (updates[language] && updates[language].length > 0) return updates[language];
      if (updates.english && updates.english.length > 0) return updates.english;
      if (updates.marathi && updates.marathi.length > 0) return updates.marathi;
      if (updates.hindi && updates.hindi.length > 0) return updates.hindi;
      
      return [];
  };



  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full max-w-full pt-0"> 
       
      {/* Container – lg pe left se start, no gap: content sidebar ke turant right me */}
      <div className="w-full max-w-full mx-auto px-0 pt-0 pb-0 sm:pb-5 lg:mx-0 lg:px-0 lg:pt-0 lg:pb-0 overflow-x-hidden">
        
        <div className="w-full overflow-x-hidden">
            {/* Ticker 1: Breaking / Live (Red) */}
            <HorizontalTicker 
                title={language === 'marathi' ? 'ब्रेकिंग न्यूज' : 'BREAKING NEWS'} 
                items={liveItems}
                bgColor="bg-[#cc0000]"
                titleColor="bg-[#990000]"
            />
            
            {/* Ticker 2: Top Stories (Black/Dark) */}
            <HorizontalTicker 
                title={language === 'marathi' ? 'महत्त्वाच्या बातम्या' : 'TOP STORIES'} 
                items={latestNewsItems.slice(0, 8)}
                bgColor="bg-gray-900"
                titleColor="bg-black"
            />
        </div>

         {/* Main Layout – content only (sidebar fixed left, navbar ke niche) */}
       <div className="relative w-full overflow-x-hidden lg:flex lg:flex-row lg:items-start px-0 sm:px-0 md:px-0 lg:px-0 mt-0">
        {/* Left Sidebar – sticky, jitna content utna height, scroll with page */}


        {/* Main Content Area – no top margin so aligns with sidebar */}
        <div className="flex-1 min-w-0 min-h-0">
            {/* Hero Section (Live News) – top = एक्स्प्लोर top */}
            {featured ? (
              <div className="bg-[#c40404] overflow-hidden shadow-lg border-2 border-white rounded-lg min-h-0 w-full max-w-full min-w-0 mt-0 pt-0 lg:h-[340px]" style={{ minWidth: 0 }}>
                {/* Exact reference: 3 Columns - Image | Title | List */}
                <div key={featured._id || safeIndex} className="flex flex-col lg:flex-row h-full animate-in fade-in duration-700">
                  
                  {/* Column 1: Image (Auto Width / Aspect Video) - Forces 16:9 Ratio on Desktop */}
                  <div className="w-full lg:w-auto lg:aspect-video lg:min-w-0 relative min-w-0 flex flex-col shrink-0 lg:h-full h-[200px] sm:h-[250px] bg-black overflow-hidden group">
                    <Image 
                      src={featured.image || 'https://placehold.co/800x600/png?text=News'} 
                      alt={getLocalizedContent(featured, 'title')}
                      fill
                      priority
                      className="object-fill transition-transform duration-700 ease-in-out group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    {featured.isLive && (
                      <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)] rounded-br-xl z-10 flex items-center gap-2 backdrop-blur-sm bg-opacity-90 border-r border-b border-red-400">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping shadow-[0_0_10px_white]"></span>
                        LIVE
                      </div>
                    )}
                    {/* Progress Bar for the slide timer */}
                    <div key={activeHeroIndex} className="absolute bottom-0 left-0 h-1 bg-red-600 animate-[width_5s_linear_forward]" style={{ animationName: 'growWidth', animationDuration: '5s', animationTimingFunction: 'linear' }}></div>
                    <style jsx>{`
                      @keyframes growWidth {
                        from { width: 0%; }
                        to { width: 100%; }
                      }
                    `}</style>
                  </div>

                  {/* Column 2: Big Title Text (Flex Fill) - Auto width */}
                  <div 
                    className="flex w-full lg:flex-1 p-3 sm:p-5 flex-col justify-center text-white border-b lg:border-b-0 lg:border-r border-white/20 bg-gradient-to-br from-[#c40404] to-[#a00000] overflow-hidden h-full relative backdrop-blur-md cursor-pointer hover:bg-black/10 transition-colors"
                    onClick={() => router.push(`/news/${featured._id || featured.id}`)} // Updated onClick
                  >
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                         <FaBolt className="text-6xl text-white" />
                      </div>
                      <h1 className="font-['Kohinoor_Devanagari','Mukta',sans-serif] font-bold drop-shadow-md w-full max-h-full z-10">
                        {(() => {
                            const { line1, line2 } = getHeroTitleLines(featured);
                            // Clean up hyphens for display
                            const displayLine1 = line1.replace(/[-–—]*$/, '').trim();
                            const displayLine2 = line2.replace(/^[-–—]*/, '').trim();
                            
                            return (
                              <div className="flex flex-col gap-1 items-start justify-center h-full">
                                <span className="text-xl sm:text-2xl lg:text-3xl text-white block leading-tight tracking-tight break-words font-extrabold line-clamp-4 animate-in slide-in-from-bottom-2 duration-500 drop-shadow-lg">
                                  {displayLine1}
                                </span>
                                {/* Decorative line */}
                                <div className="w-12 h-1.5 bg-[#ffcc00] rounded-full shrink-0 my-1 shadow-sm opacity-90"></div>
                                <span className="text-xl sm:text-2xl lg:text-3xl text-[#ffcc00] block leading-tight tracking-tight break-words font-extrabold line-clamp-4 animate-in slide-in-from-bottom-4 duration-700 delay-100 drop-shadow-lg filter brightness-110">
                                  {displayLine2}
                                </span>
                              </div>
                            );
                        })()}
                      </h1>
                  </div>

                  {/* Column 3: List (30%) */}
                  <div className="w-full lg:w-[30%] lg:min-w-0 py-3 px-3 sm:py-4 sm:px-4 lg:py-3 lg:px-4 flex flex-col justify-center min-w-0 bg-[#c40404] overflow-hidden">
                    <div className="mb-2 pb-1 border-b border-white/20">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                           {language === 'marathi' ? 'टॉप न्यूज अपडेट' : 'Top News Update'}
                        </h3>
                    </div>
                    {/* Darker background for list to separate from Title */}
                    <div className="flex-1 min-h-0 relative -mx-4 px-4 bg-black/10">
                       <div className="h-2"></div>
                       <NewsTicker 
                          items={((getLocalizedUpdates(featured).length > 0 ? getLocalizedUpdates(featured) : sideLinks).length > 0 
                              ? (getLocalizedUpdates(featured).length > 0 ? getLocalizedUpdates(featured) : sideLinks) 
                              : ['Staying tuned for more updates...']
                          )}
                          getLocalizedContent={getLocalizedContent}
                       />
                       <div className="h-2"></div>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
               <div className="bg-gray-100 p-12 text-center rounded text-gray-500 italic mb-10 border-2 border-dashed border-gray-300">
                  <div className="text-4xl mb-2 text-gray-300">📰</div>
                   News feed is empty. Please add news from the Admin Dashboard.
               </div>
            )}
            
            {/* Category Ticker (Thin Red Line) */}

            <div className="mt-6 sm:mt-8 mb-6 sm:mb-8 border-t border-b border-gray-200 py-4 sm:py-6 pl-4">
                <div className="flex items-center mb-5 pl-4 border-l-[6px] border-[#c40404]">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter font-['Kohinoor_Devanagari','Mukta',sans-serif] leading-none">
                        {language === 'marathi' ? 'ताज्या बातम्या' : language === 'hindi' ? 'ताज़ा ख़बर' : 'Latest News'}
                    </h2>
                    <FaBolt className="text-[#c40404] text-lg ml-3 drop-shadow-sm" />
                </div>
                
                {/* Scrollable Category Line under Latest News Header */}
                <div className="mb-6 w-full overflow-x-hidden">
                  <HorizontalTicker 
                      title={language === 'marathi' ? 'ताज्या बातम्या' : language === 'hindi' ? 'ताज़ा ख़बर' : 'LATEST NEWS'} 
                      items={latestNewsItems.length > 0 ? latestNewsItems : [
                          language === 'marathi' ? 'ताज्या बातम्या उपलब्ध नाहीत...' : 
                          language === 'hindi' ? 'ताज़ा ख़बरें उपलब्ध नहीं हैं...' : 
                          'No latest news available...'
                      ]}
                      bgColor="bg-[#cc0000]"
                      titleColor="bg-[#990000]"
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stripItems.map((item, idx) => (
                        <div 
                            key={item._id || item.id || idx} 
                            className="flex flex-col group cursor-pointer"
                            onClick={() => router.push(`/news/${item._id || item.id}`)} // Added onClick
                        >
                            {/* Category Header */}
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-red-600 font-bold text-[10px] uppercase tracking-wide">
                                    {item.category ? getLocalizedContent(item, 'category') : (language === 'marathi' ? 'महाराष्ट्र' : 'Maharashtra')}
                                </span>
                            </div>
                            
                            {/* Image Card */}
                            <div className="relative aspect-video mb-2 overflow-hidden rounded-md bg-gray-100">
                                <Image 
                                    src={item.image || 'https://placehold.co/600x400/png?text=News'} 
                                    alt={getLocalizedContent(item, 'title')}
                                    fill
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                />
                                {item.isLive && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse z-10">
                                        LIVE
                                    </div>
                                )}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">
                                {getLocalizedContent(item, 'title')}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Maharashtra Section */}
            {maharashtraNews.length > 0 && (
            <div className="mt-6 sm:mt-8 border-t border-b border-gray-200 py-4 sm:py-6 pl-4">
                <div className="flex items-center mb-5 pl-4 border-l-[6px] border-[#c40404]">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter font-['Kohinoor_Devanagari','Mukta',sans-serif] leading-none">
                        {language === 'marathi' ? 'महाराष्ट्र' : 'MAHARASHTRA'}
                    </h2>
                    <FaBolt className="text-[#c40404] text-lg ml-3 drop-shadow-sm" />
                </div>

                {/* Scrollable Maharashtra Line */}
                <div className="mb-6 w-full overflow-x-hidden">
                  <HorizontalTicker 
                      title={language === 'marathi' ? 'महाराष्ट्र' : 'MAHARASHTRA'} 
                      items={allMaharashtraNews.length > 0 ? allMaharashtraNews : [
                          language === 'marathi' ? 'महाराष्ट्र बातम्या उपलब्ध नाहीत...' : 
                          'No maharashtra news available...'
                      ]}
                      bgColor="bg-[#a00000]"
                      titleColor="bg-[#800000]"
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {maharashtraNews.map((item, idx) => (
                        <div 
                            key={item._id || item.id || idx} 
                            className="flex flex-col group cursor-pointer"
                            onClick={() => router.push(`/news/${item._id || item.id}`)}
                        >
                            {/* Category Header */}
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-red-600 font-bold text-[10px] uppercase tracking-wide">
                                    {language === 'marathi' ? 'महाराष्ट्र' : 'MAHARASHTRA'}
                                </span>
                            </div>
                            
                            {/* Image Card */}
                            <div className="relative aspect-video mb-2 overflow-hidden rounded-md bg-gray-100">
                                <Image 
                                    src={item.image || 'https://placehold.co/600x400/png?text=News'} 
                                    alt={getLocalizedContent(item, 'title')}
                                    fill
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                />
                                {item.isLive && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse z-10">
                                        LIVE
                                    </div>
                                )}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">
                                {getLocalizedContent(item, 'title')}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
            )}

            {/* Entertainment Section */}
            {entertainmentNews.length > 0 && (
            <div className="mt-6 sm:mt-8 border-t border-b border-gray-200 py-4 sm:py-6 pl-4">
                <div className="flex items-center mb-5 pl-4 border-l-[6px] border-[#c40404]">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter font-['Kohinoor_Devanagari','Mukta',sans-serif] leading-none">
                        {language === 'marathi' ? 'मनोरंजन' : 'ENTERTAINMENT'}
                    </h2>
                    <FaBolt className="text-[#c40404] text-lg ml-3 drop-shadow-sm" />
                </div>

                <div className="mb-6 w-full overflow-x-hidden">
                  <HorizontalTicker 
                      title={language === 'marathi' ? 'मनोरंजन' : 'ENTERTAINMENT'} 
                      items={allEntertainmentNews.length > 0 ? allEntertainmentNews : [language === 'marathi' ? 'बातम्या उपलब्ध नाहीत...' : 'No news available...']}
                      bgColor="bg-[#a00000]"
                      titleColor="bg-[#800000]"
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {entertainmentNews.map((item, idx) => (
                        <div key={item._id || item.id || idx} className="flex flex-col group cursor-pointer" onClick={() => router.push(`/news/${item._id || item.id}`)}>
                            <div className="flex items-center justify-between mb-1.5"><span className="text-red-600 font-bold text-[10px] uppercase tracking-wide">{language === 'marathi' ? 'मनोरंजन' : 'ENTERTAINMENT'}</span></div>
                            <div className="relative aspect-video mb-2 overflow-hidden rounded-md bg-gray-100">
                                <Image src={item.image || 'https://placehold.co/600x400/png?text=News'} alt={getLocalizedContent(item, 'title')} fill className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out" sizes="(max-width: 768px) 100vw, 25vw" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">{getLocalizedContent(item, 'title')}</h3>
                        </div>
                    ))}
                </div>
            </div>
            )}

            {/* Sports Section */}
            {sportsNews.length > 0 && (
            <div className="mt-6 sm:mt-8 border-t border-b border-gray-200 py-4 sm:py-6 pl-4">
                <div className="flex items-center mb-5 pl-4 border-l-[6px] border-[#c40404]">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter font-['Kohinoor_Devanagari','Mukta',sans-serif] leading-none">
                        {language === 'marathi' ? 'क्रीडा' : 'SPORTS'}
                    </h2>
                    <FaBolt className="text-[#c40404] text-lg ml-3 drop-shadow-sm" />
                </div>
                <div className="mb-6 w-full overflow-x-hidden">
                  <HorizontalTicker title={language === 'marathi' ? 'क्रीडा' : 'SPORTS'} items={allSportsNews.length > 0 ? allSportsNews : [language === 'marathi' ? 'बातम्या उपलब्ध नाहीत...' : 'No news available...']} bgColor="bg-[#a00000]" titleColor="bg-[#800000]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sportsNews.map((item, idx) => (
                        <div key={item._id || item.id || idx} className="flex flex-col group cursor-pointer" onClick={() => router.push(`/news/${item._id || item.id}`)}>
                            <div className="flex items-center justify-between mb-1.5"><span className="text-red-600 font-bold text-[10px] uppercase tracking-wide">{language === 'marathi' ? 'क्रीडा' : 'SPORTS'}</span></div>
                            <div className="relative aspect-video mb-2 overflow-hidden rounded-md bg-gray-100">
                                <Image src={item.image || 'https://placehold.co/600x400/png?text=News'} alt={getLocalizedContent(item, 'title')} fill className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out" sizes="(max-width: 768px) 100vw, 25vw" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">{getLocalizedContent(item, 'title')}</h3>
                        </div>
                    ))}
                </div>
            </div>
            )}

            {/* Business Section */}
            {businessNews.length > 0 && (
            <div className="mt-6 sm:mt-8 border-t border-b border-gray-200 py-4 sm:py-6 pl-4">
                <div className="flex items-center mb-5 pl-4 border-l-[6px] border-[#c40404]">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter font-['Kohinoor_Devanagari','Mukta',sans-serif] leading-none">
                        {language === 'marathi' ? 'बिझनेस' : 'BUSINESS'}
                    </h2>
                    <FaBolt className="text-[#c40404] text-lg ml-3 drop-shadow-sm" />
                </div>
                 <div className="mb-6 w-full overflow-x-hidden">
                  <HorizontalTicker title={language === 'marathi' ? 'बिझनेस' : 'BUSINESS'} items={allBusinessNews.length > 0 ? allBusinessNews : [language === 'marathi' ? 'बातम्या उपलब्ध नाहीत...' : 'No news available...']} bgColor="bg-[#a00000]" titleColor="bg-[#800000]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {businessNews.map((item, idx) => (
                        <div key={item._id || item.id || idx} className="flex flex-col group cursor-pointer" onClick={() => router.push(`/news/${item._id || item.id}`)}>
                             <div className="relative aspect-video mb-2 overflow-hidden rounded-md bg-gray-100">
                                <Image src={item.image || 'https://placehold.co/600x400/png?text=News'} alt={getLocalizedContent(item, 'title')} fill className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out" sizes="(max-width: 768px) 100vw, 25vw" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">{getLocalizedContent(item, 'title')}</h3>
                        </div>
                    ))}
                </div>
            </div>
            )}

            {/* Astro Section */}
            {astroNews.length > 0 && (
            <div className="mt-6 sm:mt-8 border-t border-b border-gray-200 py-4 sm:py-6 pl-4">
                <div className="flex items-center mb-5 pl-4 border-l-[6px] border-[#c40404]">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter font-['Kohinoor_Devanagari','Mukta',sans-serif] leading-none">
                        {language === 'marathi' ? 'भविष्य' : 'ASTRO'}
                    </h2>
                    <FaBolt className="text-[#c40404] text-lg ml-3 drop-shadow-sm" />
                </div>
                <div className="mb-6 w-full overflow-x-hidden">
                  <HorizontalTicker title={language === 'marathi' ? 'भविष्य' : 'ASTRO'} items={allAstroNews.length > 0 ? allAstroNews : [language === 'marathi' ? 'बातम्या उपलब्ध नाहीत...' : 'No news available...']} bgColor="bg-[#a00000]" titleColor="bg-[#800000]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {astroNews.map((item, idx) => (
                        <div key={item._id || item.id || idx} className="flex flex-col group cursor-pointer" onClick={() => router.push(`/news/${item._id || item.id}`)}>
                            <div className="relative aspect-video mb-2 overflow-hidden rounded-md bg-gray-100">
                                <Image src={item.image || 'https://placehold.co/600x400/png?text=News'} alt={getLocalizedContent(item, 'title')} fill className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out" sizes="(max-width: 768px) 100vw, 25vw" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">{getLocalizedContent(item, 'title')}</h3>
                        </div>
                    ))}
                </div>
            </div>
            )}

            {/* Lifestyle Section */}
            {lifestyleNews.length > 0 && (
            <div className="mt-6 sm:mt-8 border-t border-b border-gray-200 py-4 sm:py-6 pl-4">
                <div className="flex items-center mb-5 pl-4 border-l-[6px] border-[#c40404]">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter font-['Kohinoor_Devanagari','Mukta',sans-serif] leading-none">
                        {language === 'marathi' ? 'लाईफस्टाईल' : 'LIFESTYLE'}
                    </h2>
                    <FaBolt className="text-[#c40404] text-lg ml-3 drop-shadow-sm" />
                </div>
                <div className="mb-6 w-full overflow-x-hidden">
                  <HorizontalTicker title={language === 'marathi' ? 'लाईफस्टाईल' : 'LIFESTYLE'} items={allLifestyleNews.length > 0 ? allLifestyleNews : [language === 'marathi' ? 'बातम्या उपलब्ध नाहीत...' : 'No news available...']} bgColor="bg-[#a00000]" titleColor="bg-[#800000]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {lifestyleNews.map((item, idx) => (
                        <div key={item._id || item.id || idx} className="flex flex-col group cursor-pointer" onClick={() => router.push(`/news/${item._id || item.id}`)}>
                            <div className="relative aspect-video mb-2 overflow-hidden rounded-md bg-gray-100">
                                <Image src={item.image || 'https://placehold.co/600x400/png?text=News'} alt={getLocalizedContent(item, 'title')} fill className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out" sizes="(max-width: 768px) 100vw, 25vw" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">{getLocalizedContent(item, 'title')}</h3>
                        </div>
                    ))}
                </div>
            </div>
            )}

            {/* Politics Section */}
            {politicsNews.length > 0 && (
            <div className="mt-6 sm:mt-8 border-t border-b border-gray-200 py-4 sm:py-6 pl-4">
                <div className="flex items-center mb-5 pl-4 border-l-[6px] border-[#c40404]">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter font-['Kohinoor_Devanagari','Mukta',sans-serif] leading-none">
                        {language === 'marathi' ? 'राजकारण' : 'POLITICS'}
                    </h2>
                    <FaBolt className="text-[#c40404] text-lg ml-3 drop-shadow-sm" />
                </div>

                {/* Scrollable Politics Line */}
                <div className="mb-6 w-full overflow-x-hidden">
                  <HorizontalTicker 
                      title={language === 'marathi' ? 'राजकारण' : 'POLITICS'} 
                      items={allPoliticsNews.length > 0 ? allPoliticsNews : [
                          language === 'marathi' ? 'राजकारण बातम्या उपलब्ध नाहीत...' : 
                          'No politics news available...'
                      ]}
                      bgColor="bg-[#a00000]"
                      titleColor="bg-[#800000]"
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {politicsNews.map((item, idx) => (
                        <div 
                            key={item._id || item.id || idx} 
                            className="flex flex-col group cursor-pointer"
                            onClick={() => router.push(`/news/${item._id || item.id}`)}
                        >
                            {/* Category Header */}
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-red-600 font-bold text-[10px] uppercase tracking-wide">
                                    {language === 'marathi' ? 'राजकारण' : 'POLITICS'}
                                </span>
                            </div>
                            
                            {/* Image Card */}
                            <div className="relative aspect-video mb-2 overflow-hidden rounded-md bg-gray-100">
                                <Image 
                                    src={item.image || 'https://placehold.co/600x400/png?text=News'} 
                                    alt={getLocalizedContent(item, 'title')}
                                    fill
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                />
                                {item.isLive && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse z-10">
                                        LIVE
                                    </div>
                                )}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">
                                {getLocalizedContent(item, 'title')}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
            )}

            {/* Grid Section Below */}

        {/* Clean Grid Section – responsive */}
        {remainingGridStories.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="flex items-center mb-4 sm:mb-6 pl-2 border-l-4 border-red-600">
               <h2 className="text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-tight">
                  {language === 'marathi' ? 'ताज्या बातम्या' : 'Recent Stories'}
               </h2>
            </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-x-6 sm:gap-y-10">
                {remainingGridStories.map(item => (
                   <div key={item._id} className="group cursor-pointer flex flex-col h-full">
                      {/* Image Container - No Radius, No Shadow */}
                      <div className="relative aspect-video mb-3 overflow-hidden bg-gray-100">
                         <Image 
                            src={item.image || 'https://placehold.co/600x400/png?text=News'} 
                            alt={getLocalizedContent(item, 'title')}
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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

        {/* Bottom Feature Section: Crime, Business, Sports (Single Large Cards) */}
        <div className="mt-12 mb-8 border-t border-gray-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Crime Column */}
                <div className="flex flex-col">
                    <div className="bg-[#cc0000] text-white font-bold text-xl px-4 py-2 mb-4 w-fit shadow-sm">
                        {language === 'marathi' ? 'क्राईम' : 'CRIME'}
                    </div>
                    {allCrimeNews.length > 0 ? (
                        <div 
                            className="relative w-full h-[250px] group cursor-pointer overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                            onClick={() => router.push(`/news/${allCrimeNews[0]._id || allCrimeNews[0].id}`)}
                        >
                            <Image 
                                src={allCrimeNews[0].image || 'https://placehold.co/600x400/png?text=News'} 
                                alt={getLocalizedContent(allCrimeNews[0], 'title')}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90"></div>
                            
                            {/* Title Overlay */}
                            <h3 className="absolute bottom-0 left-0 right-0 p-4 text-white text-lg sm:text-xl font-bold leading-snug drop-shadow-md">
                                {getLocalizedContent(allCrimeNews[0], 'title')}
                            </h3>
                        </div>
                    ) : (
                         <div className="h-[250px] bg-gray-100 flex items-center justify-center text-gray-400 italic border border-gray-200">
                            No crime news available
                         </div>
                    )}
                </div>

                {/* 2. Business Column */}
                <div className="flex flex-col">
                    <div className="bg-[#cc0000] text-white font-bold text-xl px-4 py-2 mb-4 w-fit shadow-sm">
                        {language === 'marathi' ? 'व्यवसाय' : 'BUSINESS'}
                    </div>
                    {allBusinessNews.length > 0 ? (
                        <div 
                            className="relative w-full h-[250px] group cursor-pointer overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                            onClick={() => router.push(`/news/${allBusinessNews[0]._id || allBusinessNews[0].id}`)}
                        >
                             <Image 
                                src={allBusinessNews[0].image || 'https://placehold.co/600x400/png?text=News'} 
                                alt={getLocalizedContent(allBusinessNews[0], 'title')}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90"></div>
                            <h3 className="absolute bottom-0 left-0 right-0 p-4 text-white text-lg sm:text-xl font-bold leading-snug drop-shadow-md">
                                {getLocalizedContent(allBusinessNews[0], 'title')}
                            </h3>
                        </div>
                    ) : (
                        <div className="h-[250px] bg-gray-100 flex items-center justify-center text-gray-400 italic border border-gray-200">
                             No business news available
                        </div>
                    )}
                </div>

                {/* 3. Sports (Play) Column */}
                <div className="flex flex-col">
                    <div className="bg-[#cc0000] text-white font-bold text-xl px-4 py-2 mb-4 w-fit shadow-sm">
                        {language === 'marathi' ? 'खेळ' : 'SPORTS'}
                    </div>
                    {allSportsNews.length > 0 ? (
                        <div 
                            className="relative w-full h-[250px] group cursor-pointer overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                            onClick={() => router.push(`/news/${allSportsNews[0]._id || allSportsNews[0].id}`)}
                        >
                            <Image 
                                src={allSportsNews[0].image || 'https://placehold.co/600x400/png?text=News'} 
                                alt={getLocalizedContent(allSportsNews[0], 'title')}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90"></div>
                            <h3 className="absolute bottom-0 left-0 right-0 p-4 text-white text-lg sm:text-xl font-bold leading-snug drop-shadow-md">
                                {getLocalizedContent(allSportsNews[0], 'title')}
                            </h3>
                        </div>
                    ) : (
                        <div className="h-[250px] bg-gray-100 flex items-center justify-center text-gray-400 italic border border-gray-200">
                             No sports news available
                        </div>
                    )}
                </div>

            </div>
        </div>
        
        </div>
        {/* flex-1 main content ends – saari news one by one yahi khatam */}

        </div>
        {/* lg:flex row ends – iske niche ab cricket full width */}

        {/* Cricket Center – sabse niche, footer se pehle; sidebar ke andar nahi */}
        <div className="mt-12 w-full">
           <CricketDashboard />
        </div>

      </div>
     </div>
  );
}
