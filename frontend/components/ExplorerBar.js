'use client';

import { useLanguage } from '@/context/LanguageContext';
import { FaClock, FaFire, FaRegNewspaper, FaHeadphones, FaThLarge } from 'react-icons/fa';
import './ExplorerBar.css';

export default function ExplorerBar() {
  const { language } = useLanguage();

  const items = [
    { label: language === 'english' ? 'Live TV' : language === 'hindi' ? 'लाइव टीवी' : 'लाईव्ह टीव्ही', icon: <FaClock />, live: true },
    { label: language === 'english' ? 'Videos' : language === 'hindi' ? 'वीडियो' : 'व्हिडिओ', icon: <span className="explorer-play">►</span>, live: false },
    { label: language === 'english' ? 'Short Video' : language === 'hindi' ? 'शॉर्ट व्हिडियो' : 'शॉर्ट व्हिडिओ', icon: <FaFire />, live: false },
    { label: language === 'english' ? 'Web Stories' : language === 'hindi' ? 'वेब स्टोरीज़' : 'वेब स्टोरिज्', icon: <FaThLarge />, live: false },
    { label: language === 'english' ? 'Photo Gallery' : language === 'hindi' ? 'फोटो गैलरी' : 'फोटो गॅलरी', icon: <FaRegNewspaper />, live: false },
    { label: language === 'english' ? 'Podcast' : language === 'hindi' ? 'पॉडकास्ट' : 'पॉडकास्ट', icon: <FaHeadphones />, live: false },
  ];

  return (
    <div className="explorer-bar-wrap">
      <div className="explorer-bar-glow" aria-hidden />
      <div className="explorer-bar">
        <div className="explorer-bar-left">
          <div className="explorer-bar-inner">
            <a href="#" className="explorer-bar-item explorer-main">
              <span className="explorer-dots">
                {[...Array(9)].map((_, i) => <span key={i} className="explorer-dot" />)}
              </span>
              <span className="explorer-label">एक्स्प्लोर</span>
            </a>
            {items.map((item, idx) => (
              <a key={idx} href="#" className="explorer-bar-item">
                {item.icon}
                {item.live && <span className="explorer-live-badge">LIVE</span>}
                <span className="explorer-label">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="explorer-bar-right" />
      </div>
    </div>
  );
}
