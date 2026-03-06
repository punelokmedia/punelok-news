'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { FaClock, FaFire, FaRegNewspaper, FaHeadphones, FaThLarge, FaPlay, FaTrophy, FaBriefcase, FaGraduationCap, FaFilm, FaGavel } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ExplorerSidebar() {
    const pathname = usePathname();
    const { language } = useLanguage();

    const menuItems = [
        { id: 1, label: language === 'english' ? 'Live TV' : language === 'hindi' ? 'लाइव टीवी' : 'लाईव्ह टीव्ही', icon: <FaPlay />, href: '/live-tv' },
        { id: 2, label: 'LIVE', icon: <div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse" />, href: '/live' },
        { id: 3, label: language === 'english' ? 'Video Shorts' : language === 'hindi' ? 'वीडियो शॉर्ट्स' : 'व्हिडिओ शॉर्ट्स', icon: <FaFilm />, href: '/shorts' },
        { id: 5, label: language === 'english' ? 'Photo Gallery' : language === 'hindi' ? 'फोटो गैलरी' : 'फोटो गॅलरी', icon: <FaRegNewspaper />, href: '/gallery' },
        { id: 6, label: language === 'english' ? 'Podcast' : language === 'hindi' ? 'पॉडकास्ट' : 'पॉडकास्ट', icon: <FaHeadphones />, href: '/podcast' },
        { id: 7, label: language === 'english' ? 'Sports' : language === 'hindi' ? 'खेल' : 'खेळ', icon: <FaTrophy />, href: '/category/sports' },
        { id: 8, label: language === 'english' ? 'Jobs' : language === 'hindi' ? 'रोजगार' : 'रोजगार', icon: <FaBriefcase />, href: '/category/jobs' },
        { id: 9, label: language === 'english' ? 'Education' : language === 'hindi' ? 'शिक्षा' : 'शिक्षण', icon: <FaGraduationCap />, href: '/category/education' },
        { id: 10, label: language === 'english' ? 'Entertainment' : language === 'hindi' ? 'मनोरंजन' : 'मनोरंजन', icon: <FaFilm />, href: '/category/entertainment' },
        { id: 11, label: language === 'english' ? 'Crime' : language === 'hindi' ? 'क्राइम' : 'गुन्हेगारी', icon: <FaGavel />, href: '/category/crime' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    return (
        <aside className="explorer-sidebar overflow-x-hidden">
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col items-center w-full"
            >
                <div className="flex flex-col items-center w-full pt-4 pb-2 cursor-default">
                    <FaThLarge className="text-white opacity-80" />
                    <span className="text-[10px] text-white/90 font-bold uppercase tracking-widest mt-1.5">{language === 'marathi' ? 'एक्स्प्लोर' : 'Explore'}</span>
                </div>
                
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <motion.div key={item.id} variants={itemVariants} className="w-full">
                            <Link 
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-full py-2 hover:bg-black/10 transition-colors group relative ${isActive ? 'bg-black/20' : ''}`}
                            >
                                <motion.div 
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    className={`text-xl mb-0.5 text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all`}
                                >
                                    {item.icon}
                                </motion.div>
                                <span className="text-[10px] font-medium text-white uppercase tracking-wider text-center px-1 leading-tight group-hover:text-red-100 transition-colors">
                                    {item.label}
                                </span>
                                {item.id === 1 && (
                                    <span className="bg-red-600 border border-white text-white text-[8px] font-bold px-1 rounded absolute top-2 right-2 animate-pulse shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                                        LIVE
                                    </span>
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </aside>
    );
}
