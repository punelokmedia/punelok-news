'use client';

import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';
import './Footer.css';
import { useState } from 'react';
import { FaWhatsapp, FaTelegramPlane, FaFacebookF, FaInstagram, FaYoutube, FaChevronDown, FaAt } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { BsChatDots } from 'react-icons/bs';

export default function Footer() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language]?.footer || translations.marathi.footer; 
  const topT = translations[language]?.footerTop || translations.marathi.footerTop;

  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages = [
    { code: 'marathi', label: 'मराठी' },
    { code: 'hindi', label: 'हिंदी' },
    { code: 'english', label: 'English' }
  ];

  const getCurrentLangLabel = () => {
      const current = languages.find(l => l.code === language);
      return current ? current.label : 'मराठी';
  };

  return (
    <footer className="footer-wrapper overflow-x-hidden w-full max-w-full relative z-[10]">
      <div className="lg:pl-[280px] md:pl-[100px] pl-0">
          {/* Footer Top Bar (Red Background) */}
          <div className="footer-red-bar">
              <div className="footer-container red-bar-flex">
                  <div className="red-bar-left">
                     <div className="footer-logo">
                        <img src="/logo.png" alt="Punelok" className="footer-logo-img" />
                     </div>
                     
                     <div className="lang-dropdown-wrapper">
                         <button className="lang-dropdown-btn" onClick={() => setIsLangOpen(!isLangOpen)}>
                            {getCurrentLangLabel()} <FaChevronDown size={12} />
                         </button>
                         {isLangOpen && (
                             <div className="lang-dropdown-menu">
                                 {languages.map(lang => (
                                     <div 
                                        key={lang.code} 
                                        className="lang-option"
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setIsLangOpen(false);
                                        }}
                                     >
                                         {lang.label}
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                  </div>

                  <div className="red-bar-right">
                      <a href="#" className="red-pill-btn">{topT?.games}</a>
                      <a href="#" className="red-pill-btn">{topT?.liveTv}</a>
                      <a href="#" className="red-pill-btn">{topT?.video}</a>
                      <a href="#" className="red-pill-btn">{topT?.photoGallery}</a>
                      <a href="#" className="red-pill-btn">{topT?.podcast}</a>
                      <a href="#" className="red-pill-btn">{topT?.shortVideo}</a>
                  </div>
              </div>
          </div>


          {/* Main Footer Links (Dark Red Background) */}
          <div className="footer-link-section">
            <div className="footer-container link-grid">
                {/* Column 1 */}
                <div className="link-column">
                    <h3>{t.headers?.trending}</h3>
                    <a href="#">{t.headers?.photoGallery}</a>
                    <a href="#">{t.headers?.auto}</a>
                    <a href="#">{t.headers?.lifestyle}</a>
                    <a href="#">{t.headers?.elections}</a>
                    <a href="#">{t.headers?.entertainment}</a>
                    <a href="#">{t.headers?.video}</a>
                    <a href="#">{t.headers?.liveblog}</a>
                    <a href="#">{t.headers?.astro}</a>
                </div>

                {/* Column 2 */}
                <div className="link-column">
                    <h3>{t.headers?.maharashtra}</h3>
                    <a href="#">{t.links?.pune}</a>
                    <a href="#">{t.links?.mumbai}</a>
                    <a href="#">{t.links?.nashik}</a>
                    <a href="#">{t.links?.nagpur}</a>
                    <a href="#">{t.links?.chhatrapatisambhajinagar}</a>
                    <a href="#">{t.links?.ahilyanagar}</a>
                    <a href="#">{t.links?.nanded}</a>
                </div>

                 {/* Column 3 */}
                 <div className="link-column">
                    <h3>{t.headers?.sports}</h3>
                    <a href="#">{t.links?.photoGallery}</a>
                    <a href="#">{t.links?.asiaCup}</a>
                    <a href="#">{t.links?.cricket}</a>
                    <a href="#">{t.links?.ipl}</a>
                    <a href="#">{t.links?.t20}</a>
                </div>

                {/* Column 4 */}
                <div className="link-column">
                    <h3>{t.headers?.marathiNews}</h3>
                    <a href="#">{t.links?.crime}</a>
                    <a href="#">{t.links?.news}</a>
                    <a href="#">{t.links?.education}</a>
                    <a href="#">{t.links?.india}</a>
                    <a href="#">{t.links?.world}</a>
                    <a href="#">{t.links?.business}</a>
                </div>
            </div>
          </div>

          {/* Middle Section: Static Links */}
          <div className="footer-middle">
              <div className="footer-container middle-links">
                 <a href="/about">{t.headers?.about}</a>
                 <a href="/feedback">{t.headers?.feedback}</a>
                 <a href="/careers">{t.headers?.careers}</a>
                 <a href="/advertise">{t.headers?.advertise}</a>
                 <a href="/sitemap">{t.headers?.sitemap}</a>
                 <a href="/disclaimer">{t.headers?.disclaimer}</a>
                 <a href="/privacy">{t.headers?.privacy}</a>
                 <a href="/contact">{t.headers?.contact}</a>
              </div>
          </div>

          {/* Removed Newsletter & Connect Section */}

          {/* Bottom Section: Copyright & Socials */}
          <div className="footer-bottom">
              <div className="footer-container bottom-flex">
                 <div className="copyright-text">
                     {t.copyright}
                 </div>
                 <div className="footer-socials">
                     <span className="follow-text">{t.headers?.follow}</span>
                     <a href="#" className="social-circle" title="X (Twitter)"><FaXTwitter /></a>
                     <a href="#" className="social-circle" title="Facebook"><FaFacebookF /></a>
                     <a href="#" className="social-circle" title="Email"><FaAt /></a>
                     <a href="#" className="social-circle" title="YouTube"><FaYoutube /></a>
                     <a href="#" className="social-circle" title="Instagram"><FaInstagram /></a>
                     <a href="#" className="social-circle" title="Telegram"><FaTelegramPlane /></a>
                     <a href="#" className="social-circle" title="Chat"><BsChatDots /></a>
                 </div>
                 <div className="ad-box">
                    <a href="/advertise" className="footer-ad-btn">{t.headers?.advertise}</a>
                 </div>
              </div>
          </div>
      </div>
    </footer>
  );
}
