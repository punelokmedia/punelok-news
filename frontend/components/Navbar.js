'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';
import LoginModal from './LoginModal';
import { 
  FaXTwitter, 
  FaFacebookF, 
  FaAt, 
  FaYoutube, 
  FaInstagram, 
  FaTelegram, 
  FaWhatsapp,
  FaBitcoin,
  FaImage,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from 'react-icons/fa6';
import { GiGoldBar, GiWeight } from 'react-icons/gi';
import './Navbar.css';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const safeT = t.nav;
  const ft = t.footerTop;
  const fl = t.footer.links;

  const languages = [
    { code: 'marathi', label: 'मराठी', color: '#ffcc00' }, // First one highlighted yellow
    { code: 'hindi', label: 'हिंदी' },
    { code: 'english', label: 'English' }
  ];

  // Latest News State
  const [latestNews, setLatestNews] = useState([]);
  const [isLatestHovered, setIsLatestHovered] = useState(false);
  const latestHoverTimeoutRef = useRef(null);

  // Politics State
  const [politicsNews, setPoliticsNews] = useState([]);
  const [isPoliticsHovered, setIsPoliticsHovered] = useState(false);
  const politicsHoverTimeoutRef = useRef(null);

  // Maharashtra State
  const [maharashtraNews, setMaharashtraNews] = useState([]);
  const [isMaharashtraHovered, setIsMaharashtraHovered] = useState(false);
  const maharashtraHoverTimeoutRef = useRef(null);

  // Entertainment State
  const [entertainmentNews, setEntertainmentNews] = useState([]);
  const [isEntertainmentHovered, setIsEntertainmentHovered] = useState(false);
  const entertainmentHoverTimeoutRef = useRef(null);

  // Sports State
  const [sportsNews, setSportsNews] = useState([]);
  const [isSportsHovered, setIsSportsHovered] = useState(false);
  const sportsHoverTimeoutRef = useRef(null);

  // Business State
  const [businessNews, setBusinessNews] = useState([]);
  const [isBusinessHovered, setIsBusinessHovered] = useState(false);
  const businessHoverTimeoutRef = useRef(null);

  // Lifestyle State
  const [lifestyleNews, setLifestyleNews] = useState([]);
  const [isLifestyleHovered, setIsLifestyleHovered] = useState(false);
  const lifestyleHoverTimeoutRef = useRef(null);

  // More State
  const [moreNews, setMoreNews] = useState([]);
  const [isMoreHovered, setIsMoreHovered] = useState(false);
  const moreHoverTimeoutRef = useRef(null);
  
  // Market Trends State
  const [marketTrends, setMarketTrends] = useState([]);

  // Fetch news for dropdowns
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?limit=10&language=${language}`);
        const nonLiveNews = res.data.filter(item => item.isLive !== true).slice(0, 6);
        setLatestNews(nonLiveNews);
        setMoreNews(nonLiveNews); // Use same latest news for 'More' dropdown
      } catch (err) {
        console.error("Failed to fetch latest news for navbar", err);
      }
    };
    
    const fetchPolitics = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?category=politics&limit=6&language=${language}`);
            const politicsItems = res.data.filter(item => item.category === 'politics').slice(0, 6);
            setPoliticsNews(politicsItems);
        } catch (err) {
             console.error("Failed to fetch politics news for navbar", err);
        }
    }

    const fetchMaharashtra = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?category=maharashtra&limit=6&language=${language}`);
            const maharashtraItems = res.data.filter(item => item.category === 'maharashtra').slice(0, 6);
            setMaharashtraNews(maharashtraItems);
        } catch (err) {
             console.error("Failed to fetch maharashtra news for navbar", err);
        }
    }

    const fetchEntertainment = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?category=entertainment&limit=6&language=${language}`);
            const items = res.data.filter(item => item.category === 'entertainment').slice(0, 6);
            setEntertainmentNews(items);
        } catch (err) { console.error("Failed to fetch entertainment news", err); }
    }

    const fetchSports = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?category=sports&limit=6&language=${language}`);
            const items = res.data.filter(item => item.category === 'sports').slice(0, 6);
            setSportsNews(items);
        } catch (err) { console.error("Failed to fetch sports news", err); }
    }

    const fetchBusiness = async () => {
         try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?category=business&limit=6&language=${language}`);
            const items = res.data.filter(item => item.category === 'business').slice(0, 6);
            setBusinessNews(items);
        } catch (err) { console.error("Failed to fetch business news", err); }
    }

    const fetchLifestyle = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?category=lifestyle&limit=6&language=${language}`);
            const items = res.data.filter(item => item.category === 'lifestyle').slice(0, 6);
            setLifestyleNews(items);
        } catch (err) { console.error("Failed to fetch lifestyle news", err); }
    }

    const fetchMarket = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/market`);
            setMarketTrends(res.data);
        } catch (err) {
            console.error("Failed to fetch market trends for ticker", err);
        }
    };

    fetchLatest();
    fetchPolitics();
    fetchMaharashtra();
    fetchEntertainment();
    fetchSports();
    fetchBusiness();
    fetchLifestyle();
    fetchMarket();
  }, [language]);

  const getLocalizedTitle = (item) => {
      if (!item || !item.title) return '';
      if (typeof item.title === 'string') return item.title;
      return item.title[language] || item.title.marathi || item.title.hindi || item.title.english || '';
  };
  
  const handleLatestMouseEnter = () => {
    if (latestHoverTimeoutRef.current) clearTimeout(latestHoverTimeoutRef.current);
    setIsLatestHovered(true);
  };

  const handleLatestMouseLeave = () => {
    latestHoverTimeoutRef.current = setTimeout(() => {
      setIsLatestHovered(false);
    }, 300);
  };

  const handlePoliticsMouseEnter = () => {
    if (politicsHoverTimeoutRef.current) clearTimeout(politicsHoverTimeoutRef.current);
    setIsPoliticsHovered(true);
  };

  const handlePoliticsMouseLeave = () => {
    politicsHoverTimeoutRef.current = setTimeout(() => {
      setIsPoliticsHovered(false);
    }, 300);
  };

  const handleMaharashtraMouseEnter = () => {
    if (maharashtraHoverTimeoutRef.current) clearTimeout(maharashtraHoverTimeoutRef.current);
    setIsMaharashtraHovered(true);
  };

  const handleMaharashtraMouseLeave = () => {
    maharashtraHoverTimeoutRef.current = setTimeout(() => {
      setIsMaharashtraHovered(false);
    }, 300);
  };

  // Entertainment Handlers
  const handleEntertainmentMouseEnter = () => {
    if (entertainmentHoverTimeoutRef.current) clearTimeout(entertainmentHoverTimeoutRef.current);
    setIsEntertainmentHovered(true);
  };
  const handleEntertainmentMouseLeave = () => {
    entertainmentHoverTimeoutRef.current = setTimeout(() => setIsEntertainmentHovered(false), 300);
  };

  // Sports Handlers
  const handleSportsMouseEnter = () => {
    if (sportsHoverTimeoutRef.current) clearTimeout(sportsHoverTimeoutRef.current);
    setIsSportsHovered(true);
  };
  const handleSportsMouseLeave = () => {
    sportsHoverTimeoutRef.current = setTimeout(() => setIsSportsHovered(false), 300);
  };

  // Business Handlers
  const handleBusinessMouseEnter = () => {
    if (businessHoverTimeoutRef.current) clearTimeout(businessHoverTimeoutRef.current);
    setIsBusinessHovered(true);
  };
  const handleBusinessMouseLeave = () => {
    businessHoverTimeoutRef.current = setTimeout(() => setIsBusinessHovered(false), 300);
  };

  // Lifestyle Handlers
  const handleLifestyleMouseEnter = () => {
    if (lifestyleHoverTimeoutRef.current) clearTimeout(lifestyleHoverTimeoutRef.current);
    setIsLifestyleHovered(true);
  };
  const handleLifestyleMouseLeave = () => {
    lifestyleHoverTimeoutRef.current = setTimeout(() => setIsLifestyleHovered(false), 300);
  };
  
  // More Handlers
  const handleMoreMouseEnter = () => {
    if (moreHoverTimeoutRef.current) clearTimeout(moreHoverTimeoutRef.current);
    setIsMoreHovered(true);
  };
  const handleMoreMouseLeave = () => {
    moreHoverTimeoutRef.current = setTimeout(() => setIsMoreHovered(false), 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
    }
  };

  const MarketTickerCategoryIcon = ({ category }) => {
    const sz = 20;
    switch (category) {
      case 'gold':
        return <GiGoldBar size={sz} className="text-amber-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.5)]" aria-hidden />;
      case 'silver':
        return <GiWeight size={sz} className="text-gray-200 drop-shadow-[0_0_6px_rgba(229,231,235,0.45)]" aria-hidden />;
      case 'crypto':
        return <FaBitcoin size={sz} className="text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.5)]" aria-hidden />;
      case 'nft':
        return <FaImage size={sz} className="text-fuchsia-300 drop-shadow-[0_0_6px_rgba(232,121,249,0.45)]" aria-hidden />;
      default:
        return <FaChartLine size={sz} className="text-white/90" aria-hidden />;
    }
  };

  return (
    <header className="navbar-wrapper">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-left-section">
            <div className="language-compact-list">
              {languages.map((lang, index) => (
                <React.Fragment key={lang.code}>
                  <button
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`lang-btn-minimal ${language === lang.code ? 'active' : ''}`}
                  >
                    {lang.label}
                  </button>
                  {index < languages.length - 1 && <span className="lang-separator">|</span>}
                </React.Fragment>
              ))}
            </div>
            
            <div className="live-market-label">
              <span className="live-dot"></span>
              LIVE
            </div>
          </div>
          {marketTrends.length > 0 && (
            <div className="market-ticker-container">
              <div className="market-ticker-track">
                {[...marketTrends, ...marketTrends].map((item, index) => {
                  const getBg = (cat) => {
                    switch(cat) {
                      case 'gold': 
                        return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop';
                      case 'silver': 
                        return 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=600&auto=format&fit=crop';
                      case 'crypto': 
                        return 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600&auto=format&fit=crop';
                      case 'nft': 
                        return 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop';
                      default: 
                        return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop';
                    }
                  };
                  return (
                    <div 
                      key={index} 
                      className="ticker-item-square"
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${getBg(item.category)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderLeft: item.category === 'gold' ? '3px solid #FFd700' : item.category === 'silver' ? '3px solid #C0C0C0' : '3px solid #ddd'
                      }}
                    >
                      <div className="ticker-icon-box">
                        <MarketTickerCategoryIcon category={item.category} />
                      </div>
                      <div className="ticker-info">
                        <span className="ticker-label-small">{item.title[language] || item.title.english}</span>
                        <div className="ticker-value-row">
                          <span className="ticker-value-bold">{item.value[language] || item.value.english}</span>
                          <span className={`ticker-trend-box ${item.trend}`}>
                            {item.trend === 'up' ? (
                              <FaArrowUp size={11} className="inline-block align-middle" aria-hidden />
                            ) : item.trend === 'down' ? (
                              <FaArrowDown size={11} className="inline-block align-middle" aria-hidden />
                            ) : (
                              <FaMinus size={9} className="inline-block align-middle opacity-90" aria-hidden />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="social-icons">
             <a href="#" className="social-icon"><FaXTwitter size={14} /></a>
             <a href="#" className="social-icon"><FaFacebookF size={14} /></a>
             <a href="#" className="social-icon"><FaAt size={14} /></a>
             <a href="#" className="social-icon"><FaYoutube size={14} /></a>
             <a href="#" className="social-icon"><FaInstagram size={14} /></a>
             <a href="#" className="social-icon"><FaTelegram size={14} /></a>
             <a href="#" className="social-icon"><FaWhatsapp size={14} /></a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="main-navbar">
        <div className="main-navbar-container">
          {/* Logo */}
          <Link href="/" className="logo-section">
            <img src="/logo.png" alt="Punelok" className="navbar-logo-img" />
          </Link>

          {/* Desktop Menu */}
          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link href="/" className="nav-item active">{safeT.home}</Link>
            
            {/* Latest News with Dropdown */}
            <div 
              className="nav-item-wrapper"
              onMouseEnter={handleLatestMouseEnter}
              onMouseLeave={handleLatestMouseLeave}
            >
                <Link href="/latest" className="nav-item">{safeT.latest}</Link>
                {isLatestHovered && latestNews.length > 0 && (
                    <div className="mega-menu-dropdown">
                        <div className="mega-menu-container">
                            {latestNews.map((item) => (
                                <Link href={`/news/${item._id}`} key={item._id} className="mega-menu-item">
                                    <div className="mega-menu-header">
                                        <span className="mega-menu-category">{item.category || safeT.maharashtra}</span>
                                        <span className="mega-menu-icon" style={{color: '#FF0100'}}>⚡</span>
                                    </div>
                                    <div className="mega-menu-image-container">
                                        <img 
                                            src={item.image || 'https://placehold.co/600x400/png?text=News'} 
                                            alt={getLocalizedTitle(item)} 
                                            className="mega-menu-image"
                                            onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/600x400/png?text=News"}}
                                        />
                                    </div>
                                    <h4 className="mega-menu-title">
                                        {getLocalizedTitle(item)}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                        <div className="dropdown-footer">
                             <Link href="/latest" className="view-all-link">View All</Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Maharashtra with Dropdown */}
            <div 
              className="nav-item-wrapper"
              onMouseEnter={handleMaharashtraMouseEnter}
              onMouseLeave={handleMaharashtraMouseLeave}
            >
                <Link href="/maharashtra" className="nav-item">{safeT.maharashtra}</Link>
                {isMaharashtraHovered && maharashtraNews.length > 0 && (
                    <div className="mega-menu-dropdown">
                        <div className="mega-menu-container">
                            {maharashtraNews.map((item) => (
                                <Link href={`/news/${item._id}`} key={item._id} className="mega-menu-item">
                                    <div className="mega-menu-header">
                                        <span className="mega-menu-category">{item.category || safeT.maharashtra}</span>
                                        <span className="mega-menu-icon" style={{color: '#FF0100'}}>⚡</span>
                                    </div>
                                    <div className="mega-menu-image-container">
                                        <img 
                                            src={item.image || 'https://placehold.co/600x400/png?text=News'} 
                                            alt={getLocalizedTitle(item)} 
                                            className="mega-menu-image"
                                            onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/600x400/png?text=News"}}
                                        />
                                    </div>
                                    <h4 className="mega-menu-title">
                                        {getLocalizedTitle(item)}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                        <div className="dropdown-footer">
                             <Link href="/maharashtra" className="view-all-link">View All</Link>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Politics with Dropdown */}
            <div 
              className="nav-item-wrapper"
              onMouseEnter={handlePoliticsMouseEnter}
              onMouseLeave={handlePoliticsMouseLeave}
            >
                <Link href="/politics" className="nav-item">{safeT.politics}</Link>
                {isPoliticsHovered && politicsNews.length > 0 && (
                    <div className="mega-menu-dropdown">
                        <div className="mega-menu-container">
                            {politicsNews.map((item) => (
                                <Link href={`/news/${item._id}`} key={item._id} className="mega-menu-item">
                                    <div className="mega-menu-header">
                                        <span className="mega-menu-category">{item.category || safeT.politics}</span>
                                        <span className="mega-menu-icon" style={{color: '#FF0100'}}>⚡</span>
                                    </div>
                                    <div className="mega-menu-image-container">
                                        <img 
                                            src={item.image || 'https://placehold.co/600x400/png?text=News'} 
                                            alt={getLocalizedTitle(item)} 
                                            className="mega-menu-image"
                                            onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/600x400/png?text=News"}}
                                        />
                                    </div>
                                    <h4 className="mega-menu-title">
                                        {getLocalizedTitle(item)}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                        <div className="dropdown-footer">
                             <Link href="/politics" className="view-all-link">View All</Link>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Entertainment with Dropdown */}
            <div className="nav-item-wrapper" onMouseEnter={handleEntertainmentMouseEnter} onMouseLeave={handleEntertainmentMouseLeave}>
                <Link href="/category/entertainment" className="nav-item">{safeT.entertainment}</Link>
                {isEntertainmentHovered && entertainmentNews.length > 0 && (
                    <div className="mega-menu-dropdown">
                        <div className="mega-menu-container">
                            {entertainmentNews.map((item) => (
                                <Link href={`/news/${item._id}`} key={item._id} className="mega-menu-item">
                                    <div className="mega-menu-header"><span className="mega-menu-category">{item.category || safeT.entertainment}</span><span className="mega-menu-icon" style={{color: '#FF0100'}}>⚡</span></div>
                                    <div className="mega-menu-image-container"><img src={item.image || 'https://placehold.co/600x400/png?text=News'} alt={getLocalizedTitle(item)} className="mega-menu-image" onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/600x400/png?text=News"}} /></div>
                                    <h4 className="mega-menu-title">{getLocalizedTitle(item)}</h4>
                                </Link>
                            ))}
                        </div>
                        <div className="dropdown-footer"><Link href="/category/entertainment" className="view-all-link">View All</Link></div>
                    </div>
                )}
            </div>

            {/* Sports with Dropdown */}
            <div className="nav-item-wrapper" onMouseEnter={handleSportsMouseEnter} onMouseLeave={handleSportsMouseLeave}>
                <Link href="/category/sports" className="nav-item">{safeT.sports}</Link>
                {isSportsHovered && sportsNews.length > 0 && (
                    <div className="mega-menu-dropdown">
                        <div className="mega-menu-container">
                            {sportsNews.map((item) => (
                                <Link href={`/news/${item._id}`} key={item._id} className="mega-menu-item">
                                    <div className="mega-menu-header"><span className="mega-menu-category">{item.category || safeT.sports}</span><span className="mega-menu-icon" style={{color: '#FF0100'}}>⚡</span></div>
                                    <div className="mega-menu-image-container"><img src={item.image || 'https://placehold.co/600x400/png?text=News'} alt={getLocalizedTitle(item)} className="mega-menu-image" onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/600x400/png?text=News"}} /></div>
                                    <h4 className="mega-menu-title">{getLocalizedTitle(item)}</h4>
                                </Link>
                            ))}
                        </div>
                        <div className="dropdown-footer"><Link href="/category/sports" className="view-all-link">View All</Link></div>
                    </div>
                )}
            </div>

            {/* Business with Dropdown */}
            <div className="nav-item-wrapper" onMouseEnter={handleBusinessMouseEnter} onMouseLeave={handleBusinessMouseLeave}>
                <Link href="/category/business" className="nav-item">{safeT.business}</Link>
                {isBusinessHovered && businessNews.length > 0 && (
                    <div className="mega-menu-dropdown">
                        <div className="mega-menu-container">
                            {businessNews.map((item) => (
                                <Link href={`/news/${item._id}`} key={item._id} className="mega-menu-item">
                                    <div className="mega-menu-header"><span className="mega-menu-category">{item.category || safeT.business}</span><span className="mega-menu-icon" style={{color: '#FF0100'}}>⚡</span></div>
                                    <div className="mega-menu-image-container"><img src={item.image || 'https://placehold.co/600x400/png?text=News'} alt={getLocalizedTitle(item)} className="mega-menu-image" onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/600x400/png?text=News"}} /></div>
                                    <h4 className="mega-menu-title">{getLocalizedTitle(item)}</h4>
                                </Link>
                            ))}
                        </div>
                        <div className="dropdown-footer"><Link href="/category/business" className="view-all-link">View All</Link></div>
                    </div>
                )}
            </div>

            {/* Lifestyle with Dropdown */}
            <div className="nav-item-wrapper" onMouseEnter={handleLifestyleMouseEnter} onMouseLeave={handleLifestyleMouseLeave}>
                <Link href="/category/lifestyle" className="nav-item">{safeT.lifestyle}</Link>
                {isLifestyleHovered && lifestyleNews.length > 0 && (
                    <div className="mega-menu-dropdown">
                        <div className="mega-menu-container">
                            {lifestyleNews.map((item) => (
                                <Link href={`/news/${item._id}`} key={item._id} className="mega-menu-item">
                                    <div className="mega-menu-header"><span className="mega-menu-category">{item.category || safeT.lifestyle}</span><span className="mega-menu-icon" style={{color: '#FF0100'}}>⚡</span></div>
                                    <div className="mega-menu-image-container"><img src={item.image || 'https://placehold.co/600x400/png?text=News'} alt={getLocalizedTitle(item)} className="mega-menu-image" onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/600x400/png?text=News"}} /></div>
                                    <h4 className="mega-menu-title">{getLocalizedTitle(item)}</h4>
                                </Link>
                            ))}
                        </div>
                        <div className="dropdown-footer"><Link href="/category/lifestyle" className="view-all-link">View All</Link></div>
                    </div>
                )}
            </div>
                {/* More with Dropdown */}
            <div className="nav-item-wrapper" onMouseEnter={handleMoreMouseEnter} onMouseLeave={handleMoreMouseLeave}>
                <Link href="/more" className="nav-item more-dropdown">{safeT.more}</Link>
                {isMoreHovered && (
                    <div className="mega-menu-dropdown right-aligned" style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center'}}>
                        
                        {/* Sidebar Categories */}
                        <div className="sidebar-categories" style={{
                            width: '200px', 
                            padding: '14px 16px', 
                            borderRight: '1px solid #eee',
                            backgroundColor: '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                             {[
                                { name: safeT.explore, link: '/category/explore' },
                                { name: 'LIVE', link: '/live' },
                                { name: safeT.videoShorts, link: '/shorts' },
                                { name: ft.photoGallery, link: '/gallery' },
                                { name: ft.podcast, link: '/podcast' },
                                { name: safeT.astro, link: '/category/astro' },
                                { name: safeT.sports, link: '/category/sports' },
                                { name: safeT.jobs, link: '/category/jobs' },
                                { name: fl.education, link: '/category/education' },
                                { name: safeT.entertainment, link: '/category/entertainment' },
                                { name: fl.crime, link: '/category/crime' }
                             ].map((cat, idx) => (
                                 <Link key={idx} href={cat.link} className="sidebar-link" style={{
                                     textDecoration: 'none',
                                     color: '#333',
                                     fontWeight: '600',
                                     fontSize: '14px',
                                    lineHeight: '1.1',
                                    padding: '5px 8px',
                                     borderRadius: '4px',
                                     transition: 'background-color 0.2s, color 0.2s'
                                 }}
                                 onMouseOver={(e) => {e.currentTarget.style.color = '#FF0100'; e.currentTarget.style.backgroundColor = '#f9f9f9'}}
                                 onMouseOut={(e) => {e.currentTarget.style.color = '#333'; e.currentTarget.style.backgroundColor = 'transparent'}}
                                 >
                                     {cat.name}
                                 </Link>
                             ))}
                        </div>

                        {/* Recent News Grid */}
                        <div style={{flex: 1,  maxWidth: '1200px'}}>
                            {moreNews.length > 0 ? (
                                <>
                                <div className="mega-menu-container" style={{padding: '30px', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px'}}> {/* Slightly adjusted for sidebar space */}
                                    {moreNews.slice(0, 5).map((item) => ( // Show 5 to fit well with sidebar
                                        <Link href={`/news/${item._id}`} key={item._id} className="mega-menu-item">
                                            <div className="mega-menu-header"><span className="mega-menu-category">{item.category || safeT.latest}</span><span className="mega-menu-icon" style={{color: '#FF0100'}}>⚡</span></div>
                                            <div className="mega-menu-image-container"><img src={item.image || 'https://placehold.co/600x400/png?text=News'} alt={getLocalizedTitle(item)} className="mega-menu-image" onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/600x400/png?text=News"}} /></div>
                                            <h4 className="mega-menu-title">{getLocalizedTitle(item)}</h4>
                                        </Link>
                                    ))}
                                </div>
                                <div className="dropdown-footer"><Link href="/latest" className="view-all-link">View All</Link></div>
                                </>
                            ) : (
                                <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
                                    {safeT.loadingNews}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
          </nav>

          {/* Right Actions — Login before search so it stays visible when space is tight */}
          <div className="nav-actions">
            <button type="button" onClick={() => setIsLoginModalOpen(true)} className="login-btn-nav">
              {safeT.login || 'Login'}
            </button>

            <button type="button" className="search-btn" onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label={safeT.search}>
              {isSearchOpen ? (
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>×</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              )}
            </button>

            <button
              type="button"
              className="mobile-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
        
        {/* Search Overlay Dropdown */}
        {isSearchOpen && (
          <div className="search-dropdown-container">
             <form onSubmit={handleSearch} className="search-dropdown-form">
               <svg className="search-icon-input" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
               </svg>
               <input 
                 type="text" 
                 placeholder={safeT.search + "..."}
                 className="search-input-dropdown"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 autoFocus
               />
               <button type="button" className="close-search-dropdown" onClick={() => setIsSearchOpen(false)}>×</button>
             </form>
          </div>
        )}
      </div>
    </header>
  );
}
