'use client';

import { useLanguage } from '@/context/LanguageContext';
import { FaClock, FaFire, FaRegNewspaper, FaHeadphones, FaThLarge } from 'react-icons/fa';
import './ExplorerBar.css';

export default function ExplorerBar() {
  const { t } = useLanguage();
  const ft = t.footerTop;
  const nav = t.nav;

  const items = [
    { label: ft.liveTv, icon: <FaClock />, live: true },
    { label: ft.video, icon: <span className="explorer-play">►</span>, live: false },
    { label: ft.shortVideo, icon: <FaFire />, live: false },
    { label: nav.webStories, icon: <FaThLarge />, live: false },
    { label: ft.photoGallery, icon: <FaRegNewspaper />, live: false },
    { label: ft.podcast, icon: <FaHeadphones />, live: false },
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
              <span className="explorer-label">{nav.explore}</span>
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
