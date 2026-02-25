'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaPlay, FaRegNewspaper, FaChevronRight, FaVolumeUp, FaVideo, FaBroadcastTower } from 'react-icons/fa';

export default function LiveTVPage() {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-[#FDFDFD] pt-12 pb-20">
            <div className="container mx-auto px-4 md:px-6">
                
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                <Link href="/" className="hover:text-red-600 transition-colors">HOME</Link>
                                <span className="text-[8px] opacity-50">•</span>
                                <span className="text-red-600">{language === 'marathi' ? 'लाईव्ह टीव्ही' : 'LIVE TV'}</span>
                            </div>
                            
                            <div className="flex items-center gap-5">
                                <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.3)]"></div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-['Mukta',sans-serif]">
                                    {language === 'marathi' ? 'लाईव्ह टीव्ही' : 'LIVE TV CHANNEL'}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center shadow-lg shadow-red-500/20 animate-pulse border border-red-500">
                                <Fa BroadcastTower className="mr-2" /> ON AIR
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Main Player Section */}
                <div className="max-w-6xl mx-auto mb-16">
                    <div className="relative aspect-video bg-black rounded-[40px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-8 border-white group">
                        {/* Overlay Controls Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <button className="w-24 h-24 bg-red-600 text-white rounded-full flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 shadow-[0_10px_30px_rgba(220,38,38,0.5)] relative overflow-hidden">
                                <FaPlay className="text-3xl ml-2 shadow-inner" />
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            </button>
                        </div>

                        {/* Top Info Bar */}
                        <div className="absolute top-0 left-0 right-0 p-8 z-30 flex justify-between items-start pointer-events-none">
                            <div className="flex items-center bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-lg">
                                <div className="w-3 h-3 bg-red-600 rounded-full mr-3 animate-pulse"></div>
                                <span className="text-xs font-black text-white tracking-widest uppercase">HD STREAMING</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="bg-black/40 backdrop-blur-xl p-3 rounded-xl border border-white/10 text-white shadow-lg">
                                    <FaVolumeUp size={14} />
                                </div>
                                <div className="bg-black/40 backdrop-blur-xl p-3 rounded-xl border border-white/10 text-white shadow-lg">
                                    <FaVideo size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Video Content Placeholder */}
                        <img 
                            src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000&auto=format&fit=crop" 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                            alt="Live TV Background"
                        />
                        
                        {/* Bottom Gradient and Title */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-10 z-20">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2 font-['Mukta',sans-serif]">
                                        Punelok LIVE - 24/7 News
                                    </h2>
                                    <p className="text-gray-300 font-medium flex items-center gap-2">
                                        <FaBroadcastTower className="text-red-500" /> 
                                        {language === 'marathi' ? 'पुणे मुख्यालयातून थेट प्रक्षेपण' : 'Streaming live from Pune HQ'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-3">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-900 overflow-hidden bg-gray-800">
                                                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-white tracking-tight">
                                        12.5k {language === 'marathi' ? 'प्रेक्षक' : 'Watching'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info and Related Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-[40px] p-10 md:p-12 border border-gray-100 shadow-xl shadow-gray-100/50">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                                <FaBroadcastTower />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                {language === 'marathi' ? 'पुणेलोक न्यूझ लाईव्ह' : 'Punelok News Digital'}
                            </h3>
                        </div>
                        
                        <p className="text-gray-500 text-lg leading-relaxed mb-10 font-medium opacity-90">
                            {language === 'marathi' 
                                ? 'पुणेलोक न्यूझवर पहा महाराष्ट्रातील आणि देशातील सर्व ताज्या घडामोडी थेट. आमचे लाईव्ह प्रक्षेपणाद्वारे महत्त्वाच्या बातम्यांचे सर्वात वेगवान अपडेट्स मिळवा. २४ तास सात दिवस विनाथांबा बातम्यांचे केंद्र.' 
                                : 'Watch all the latest updates from Maharashtra and across the country live on Punelok News. Get the fastest news updates through our premium digital live streaming service, active 24/7 for you.'}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <button className="bg-red-600 text-white font-black py-4.5 px-8 rounded-[20px] hover:bg-red-700 transition-all flex items-center justify-center shadow-lg shadow-red-600/20 hover:-translate-y-1">
                                <FaPlay className="mr-3 text-sm" /> {language === 'marathi' ? 'आकृती पहा' : 'WATCH CHANNELING'}
                            </button>
                            <Link href="/" className="bg-gray-900 text-white font-black py-4.5 px-8 rounded-[20px] hover:bg-black transition-all flex items-center justify-center shadow-lg hover:-translate-y-1">
                                <FaRegNewspaper className="mr-3 text-sm" /> {language === 'marathi' ? 'ताज्या बातम्या' : 'LATEST HEADLINES'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .py-4.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
            `}</style>
        </div>
    );
}
