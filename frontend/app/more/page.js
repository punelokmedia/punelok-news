'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaChevronRight, FaPlus, FaNewspaper, FaImage, FaPlay, FaMicrophone, FaBriefcase, FaGraduationCap, FaGavel, FaTrophy, FaThLarge, FaSearch } from 'react-icons/fa';

export default function MorePage() {
    const { language } = useLanguage();

    const sections = [
        { 
            name: { marathi: 'लाईव्ह टीव्ही', english: 'Live TV' },
            icon: <FaPlay />,
            link: '/live-tv',
            color: 'bg-red-600',
            desc: { marathi: 'थेट बातम्यांचे प्रक्षेपण पहा', english: 'Streaming live 24x7 news' }
        },
        { 
            name: { marathi: 'व्हिडिओ शॉर्ट्स', english: 'Video Shorts' },
            icon: <FaPlus className="rotate-45" />,
            link: '/shorts',
            color: 'bg-orange-500',
            desc: { marathi: 'महत्त्वाच्या बातम्या थोडक्यात', english: 'Fast news in short videos' }
        },
        { 
            name: { marathi: 'फोटो गॅलरी', english: 'Photo Gallery' },
            icon: <FaImage />,
            link: '/gallery',
            color: 'bg-blue-600',
            desc: { marathi: 'बातम्यांचे विशेष क्षण फोटोंमध्ये', english: 'Visual news in pictures' }
        },
        { 
            name: { marathi: 'पॉडकास्ट', english: 'Podcast' },
            icon: <FaMicrophone />,
            link: '/podcast',
            color: 'bg-purple-600',
            desc: { marathi: 'ऐका महत्त्वाच्या विषयांवर चर्चा', english: 'Listen to news discussions' }
        },
        { 
            name: { marathi: 'क्रीडा', english: 'Sports' },
            icon: <FaTrophy />,
            link: '/category/sports',
            color: 'bg-yellow-600',
            desc: { marathi: 'क्रीडा जगतातील सर्व घडामोडी', english: 'Latest sports updates' }
        },
        { 
            name: { marathi: 'गुन्हेगारी', english: 'Crime' },
            icon: <FaGavel />,
            link: '/category/crime',
            color: 'bg-gray-800',
            desc: { marathi: 'गुन्हेगारी विश्वातील ताज्या बातम्या', english: 'Latest crime reports' }
        },
        { 
            name: { marathi: 'रोजगार', english: 'Jobs' },
            icon: <FaBriefcase />,
            link: '/category/jobs',
            color: 'bg-green-600',
            desc: { marathi: 'नवीन नोकरीच्या संधी', english: 'Hot career & job news' }
        },
        { 
            name: { marathi: 'शिक्षण', english: 'Education' },
            icon: <FaGraduationCap />,
            link: '/category/education',
            color: 'bg-indigo-600',
            desc: { marathi: 'शैक्षणिक क्षेत्रातील अपडेट्स', english: 'Updates in education' }
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFD] pt-12 pb-20">
            <div className="container mx-auto px-4 md:px-6">
                
                {/* Header Section */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-12">
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400">
                                <Link href="/" className="hover:text-red-600 transition-colors">HOME</Link>
                                <span className="opacity-50">•</span>
                                <span className="text-red-600">EXPLORE</span>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-5">
                                    <div className="w-2 h-10 bg-black rounded-full"></div>
                                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight font-['Mukta',sans-serif]">
                                        {language === 'marathi' ? 'आणखी पहा' : 'ALL SECTIONS'}
                                    </h1>
                                </div>
                                <p className="text-gray-500 text-lg font-medium leading-relaxed opacity-80">
                                    {language === 'marathi' 
                                        ? 'पुणेलोकच्या सर्व विशेष विभागांमध्ये सहजपणे प्रवेश करा आणि आपल्या आवडीच्या बातम्या मिळवा.' 
                                        : 'Navigate through our specialized news categories and digital sections. Everything you need in one powerful hub.'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-400 border border-gray-50">
                                <FaSearch size={22} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Highly Professional Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {sections.map((section, idx) => (
                        <Link 
                            key={idx} 
                            href={section.link}
                            className="group p-1 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:border-red-100 transition-all duration-700 flex flex-col animate-fade-in-up"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="p-8 flex flex-col h-full bg-white rounded-[38px] transition-colors duration-500 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-gray-50/50">
                                <div className={`w-16 h-16 ${section.color} text-white rounded-[22px] flex items-center justify-center text-2xl mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                    {section.icon}
                                </div>
                                
                                <h2 className="text-2xl font-black text-gray-900 mb-4 font-['Mukta',sans-serif] group-hover:text-red-700 transition-colors">
                                    {language === 'marathi' ? section.name.marathi : section.name.english}
                                </h2>
                                
                                <p className="text-gray-500 text-sm font-medium mb-10 flex-1 leading-relaxed opacity-80 font-['Mukta',sans-serif]">
                                    {language === 'marathi' ? section.desc.marathi : section.desc.english}
                                </p>
                                
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="flex items-center text-red-600 font-black text-[10px] uppercase tracking-[0.3em] group-hover:gap-4 gap-2 transition-all">
                                        {language === 'marathi' ? 'पहा' : 'EXPLORE'}
                                        <FaChevronRight className="text-[8px]" />
                                    </span>
                                    <div className="w-10 h-10 border border-gray-50 rounded-full flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-50 transition-all duration-500">
                                        <FaPlus size={10} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Professional Discover Footer */}
                <div className="mt-24 border-t border-gray-100 pt-16 flex flex-col items-center">
                    <div className="bg-gray-50 p-12 rounded-[60px] max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-24 bg-red-600 rounded-[30px] flex items-center justify-center text-white text-3xl shadow-xl shadow-red-600/20">
                                <FaNewspaper />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Stay ahead with Punelok</h3>
                                <p className="text-gray-500 font-medium">Subscribe to our digital editions today.</p>
                            </div>
                        </div>
                        <button className="bg-black text-white font-black px-10 py-5 rounded-3xl hover:bg-red-600 transition-all shadow-xl hover:-translate-y-1">
                            GET STARTED NOW
                        </button>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .animate-fade-in-up {
                    opacity: 0;
                    transform: translateY(30px);
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
 section}
