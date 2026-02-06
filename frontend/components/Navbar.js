'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';
import './Navbar.css';

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[language];

  // Fallback if translation is missing
  const safeT = t?.nav || translations.marathi.nav;

  const languages = [
    { code: 'marathi', label: 'मराठी', color: '#ffcc00' }, // First one highlighted yellow
    { code: 'hindi', label: 'हिंदी' },
    { code: 'english', label: 'English' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="navbar-wrapper">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="language-list">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`lang-btn ${language === lang.code ? 'active' : ''}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <div className="top-right-section">
            <div className="social-icons">
               <a href="#" className="social-icon">𝕏</a>
               <a href="#" className="social-icon">f</a>
               <a href="#" className="social-icon">@</a>
               <a href="#" className="social-icon">▶</a>
               <a href="#" className="social-icon">📷</a>
               <a href="#" className="social-icon">✈</a>
               <a href="#" className="social-icon">💬</a>
            </div>
            <a href="/advertise" className="advertise-link">
              {safeT.advertise}
            </a>
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
            <Link href="/latest" className="nav-item">{safeT.latest}</Link>
            <Link href="/maharashtra" className="nav-item">{safeT.maharashtra}</Link>
            <Link href="/politics" className="nav-item">{safeT.politics}</Link>
            <Link href="/entertainment" className="nav-item">{safeT.entertainment}</Link>
            <Link href="/sports" className="nav-item">{safeT.sports}</Link>
            <Link href="/business" className="nav-item">{safeT.business}</Link>
            <Link href="/astro" className="nav-item">{safeT.astro}</Link>
            <Link href="/lifestyle" className="nav-item">{safeT.lifestyle}</Link>
            <Link href="/more" className="nav-item more-dropdown">
              {safeT.more}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="nav-actions">
             <button className="search-btn" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                {isSearchOpen ? (
                  <span style={{fontSize: '24px', fontWeight: 'bold'}}>×</span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                )}
              </button>
            <button 
              className="mobile-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
