'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { FaClock, FaFire, FaRegNewspaper, FaHeadphones, FaThLarge, FaPlay, FaTrophy, FaBriefcase, FaGraduationCap, FaFilm, FaGavel } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ExplorerSidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const nav = t.nav;
    const ft = t.footerTop;
    const fl = t.footer.links;

    const menuItems = [
        { id: 1, label: ft.liveTv, icon: <FaPlay />, href: '/live-tv' },
        { id: 2, label: 'LIVE', icon: <div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse" />, href: '/live' },
        { id: 3, label: nav.videoShorts, icon: <FaFilm />, href: '/shorts' },
        { id: 5, label: ft.photoGallery, icon: <FaRegNewspaper />, href: '/gallery' },
        { id: 6, label: ft.podcast, icon: <FaHeadphones />, href: '/podcast' },
        { id: 7, label: nav.sports, icon: <FaTrophy />, href: '/category/sports' },
        { id: 8, label: nav.jobs, icon: <FaBriefcase />, href: '/category/jobs' },
        { id: 9, label: fl.education, icon: <FaGraduationCap />, href: '/category/education' },
        { id: 10, label: nav.entertainment, icon: <FaFilm />, href: '/category/entertainment' },
        { id: 11, label: fl.crime, icon: <FaGavel />, href: '/category/crime' },
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
                <div className="flex flex-col items-center w-full pt-2 pb-1 cursor-default">
                    <FaThLarge className="text-white opacity-80 text-lg" />
                    <span className="text-[10px] text-white/90 font-bold uppercase tracking-widest mt-1">{nav.explore}</span>
                </div>
                
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <motion.div key={item.id} variants={itemVariants} className="w-full">
                            <Link 
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-full py-1.5 hover:bg-black/10 transition-colors group relative ${isActive ? 'bg-black/20' : ''}`}
                            >
                                <motion.div 
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    className={`text-lg mb-0 text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all`}
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
