'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { FaClock, FaFire, FaRegNewspaper, FaHeadphones, FaThLarge, FaPlay, FaTrophy, FaBriefcase, FaGraduationCap, FaFilm, FaGavel } from 'react-icons/fa';

export default function ExplorerSidebar() {
    const pathname = usePathname();
    const { language } = useLanguage();

    const menuItems = [
        { 
            id: 1, 
            label: language === 'english' ? 'Live TV' : language === 'hindi' ? 'लाइव टीवी' : 'लाईव्ह टीव्ही', 
            icon: <FaClock />, 
            href: '/live-tv' 
        },
        { 
            id: 3, 
            label: language === 'english' ? 'Video Shorts' : language === 'hindi' ? 'वीडियो शॉर्ट्स' : 'व्हिडिओ शॉर्ट्स', 
            icon: <FaFire />, 
            href: '/shorts' 
        },
        { 
            id: 5, 
            label: language === 'english' ? 'Photo Gallery' : language === 'hindi' ? 'फोटो गैलरी' : 'फोटो गॅलरी', 
            icon: <FaRegNewspaper />, 
            href: '/photos' 
        },
        { 
            id: 6, 
            label: language === 'english' ? 'Podcast' : language === 'hindi' ? 'पॉडकास्ट' : 'पॉडकास्ट', 
            icon: <FaHeadphones />, 
            href: '/podcast' 
        },
        { 
            id: 7, 
            label: language === 'english' ? 'Sports' : language === 'hindi' ? 'खेल' : 'खेळ', 
            icon: <FaTrophy />, 
            href: '/sports' 
        },
        { 
            id: 8, 
            label: language === 'english' ? 'Jobs' : language === 'hindi' ? 'रोजगार' : 'रोजगार', 
            icon: <FaBriefcase />, 
            href: '/jobs' 
        },
        { 
            id: 9, 
            label: language === 'english' ? 'Education' : language === 'hindi' ? 'शिक्षा' : 'शिक्षण', 
            icon: <FaGraduationCap />, 
            href: '/education' 
        },
        { 
            id: 10, 
            label: language === 'english' ? 'Entertainment' : language === 'hindi' ? 'मनोरंजन' : 'मनोरंजन', 
            icon: <FaFilm />, 
            href: '/entertainment' 
        },
        { 
            id: 11, 
            label: language === 'english' ? 'Crime' : language === 'hindi' ? 'क्राइम' : 'गुन्हेगारी', 
            icon: <FaGavel />, 
            href: '/crime' 
        },
    ];

    return (
        <aside className="explorer-sidebar">
            <div className="flex flex-col items-center w-full pt-4 pb-2 cursor-default">
                 {/* Explore Dots Icon */}
                 <div className="w-6 h-6 grid grid-cols-3 gap-0.5">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-white rounded-full opacity-80" />
                    ))}
                 </div>
                 <span className="text-[10px] text-white/90 font-bold uppercase tracking-widest mt-1.5">{language === 'marathi' ? 'एक्स्प्लोर' : 'Explore'}</span>
            </div>
            
            {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link 
                        key={item.id} 
                        href={item.href}
                        className={`flex flex-col items-center justify-center w-full py-2 hover:bg-black/10 transition-colors group relative ${isActive ? 'bg-black/20' : ''}`}
                    >
                        <div className={`text-xl mb-0.5 text-white group-hover:scale-110 transition-transform`}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-medium text-white uppercase tracking-wider text-center px-1 leading-tight">
                            {item.label}
                        </span>
                        {item.id === 1 && (
                             <span className="bg-red-600 border border-white text-white text-[8px] font-bold px-1 rounded absolute top-2 right-2 animate-pulse">
                                LIVE
                             </span>
                        )}
                    </Link>
                );
            })}
        </aside>
    );
}
