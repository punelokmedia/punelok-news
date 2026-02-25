'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaPlay, FaRegNewspaper, FaMicrophone, FaVolumeUp, FaChevronRight, FaHeadphones, FaRegClock, FaSignal } from 'react-icons/fa';

export default function PodcastPage() {
    const { language } = useLanguage();

    const mockPodcasts = [
        { id: 1, title: 'Pune City Talk - Weekly Digest', duration: '15 min read', date: '25 Feb 2025', host: 'Ajay Kulkarni' },
        { id: 2, title: 'Political Analysis: Maharashtra elections', duration: '25 min read', date: '24 Feb 2025', host: 'Priyanka Shinde' },
        { id: 3, title: 'History of Pune: Episode 4', duration: '30 min read', date: '22 Feb 2025', host: 'Dr. Deshpande' },
        { id: 4, title: 'Startup Scene in Hinjewadi', duration: '18 min read', date: '20 Feb 2025', host: 'Sohan Rao' },
    ];

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
                                <span className="text-red-600 uppercase">PODCAST</span>
                            </div>
                            
                            <div className="flex items-center gap-5">
                                <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.3)]"></div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-['Mukta',sans-serif]">
                                    {language === 'marathi' ? 'पॉडकास्ट' : 'DIGITAL PODCASTS'}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-900 text-white px-5 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center shadow-lg uppercase">
                                <FaSignal className="mr-2 text-red-500 animate-pulse" /> STREAMING
                            </div>
                        </div>
                    </div>
                </div>

                {/* Highly Professional Featured Podcast Section */}
                <div className="max-w-6xl mx-auto mb-16">
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[48px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] p-1 md:p-1.5 border border-white/10 group">
                        <div className="bg-[#121212] rounded-[44px] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
                            
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000">
                                <FaMicrophone size={300} className="text-white" />
                            </div>
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                            {/* Album Art Styling */}
                            <div className="relative group/art cursor-pointer shrink-0">
                                <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-red-600 to-orange-500 rounded-[32px] shadow-2xl flex items-center justify-center relative z-10 overflow-hidden transform group-hover/art:rotate-3 transition-transform duration-500">
                                    <FaVolumeUp size={100} className="text-white drop-shadow-2xl animate-pulse" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/art:opacity-100 transition-opacity flex items-center justify-center">
                                         <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-red-600 shadow-2xl scale-50 group-hover/art:scale-100 transition-transform duration-500">
                                            <FaPlay size={20} className="ml-1" />
                                         </div>
                                    </div>
                                </div>
                                {/* Vinyl Effect Subtitle */}
                                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-48 h-48 bg-gray-800 rounded-full -z-10 border-4 border-gray-700 opacity-20 group-hover/art:-right-20 transition-all duration-700"></div>
                            </div>

                            <div className="flex-1 text-center lg:text-left z-10">
                                <div className="inline-flex items-center bg-red-600/10 text-red-500 border border-red-500/20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest mb-6 py-2 uppercase">
                                    AVAILABLE NOW
                                </div>
                                
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight font-['Mukta',sans-serif]">
                                    {language === 'marathi' ? 'पुणे शहर वार्ता - साप्ताहिक चर्चा' : 'Pune City Talk - Weekly Discussion'}
                                </h2>
                                
                                <p className="text-gray-400 text-lg md:text-xl font-medium mb-10 max-w-2xl leading-relaxed">
                                    {language === 'marathi' 
                                        ? 'या आठवड्यात आम्ही पुण्याच्या वाहतूक कोंडी आणि त्यावर होणाऱ्या उपाययोजनांबाबत सविस्तर चर्चा करणार आहोत.' 
                                        : 'A deep dive into Punes infrastructure challenges and the future of urbanization in the city.'}
                                </p>
                                
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <button className="bg-white text-gray-900 font-black py-4.5 px-10 rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center shadow-xl shadow-black/20 group/btn">
                                        <FaPlay className="mr-3 text-xs group-hover/btn:scale-125 transition-transform" /> {language === 'marathi' ? 'आताच ऐका' : 'LISTEN NOW'}
                                    </button>
                                    <div className="flex items-center gap-6 px-4">
                                         <div className="flex flex-col items-center lg:items-start text-[10px] font-black tracking-widest text-gray-500">
                                            <span>HOSTED BY</span>
                                            <span className="text-gray-300 text-sm mt-1 uppercase">Ajay Kulkarni</span>
                                         </div>
                                         <div className="w-[1px] h-8 bg-gray-700"></div>
                                         <div className="flex flex-col items-center lg:items-start text-[10px] font-black tracking-widest text-gray-500">
                                            <span>DURATION</span>
                                            <span className="text-gray-300 text-sm mt-1 uppercase">22:45 MIN</span>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Podcast List - Refined UI */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-5">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                            <FaHeadphones className="mr-3 text-red-600" /> 
                            {language === 'marathi' ? 'मागील भाग' : 'REVISIT EPISODES'}
                        </h3>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ORDER BY NEWEST</span>
                    </div>

                    <div className="space-y-4">
                        {mockPodcasts.map((pod, idx) => (
                            <div 
                                key={pod.id} 
                                className="group bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-6 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-red-50 hover:-translate-y-1 transition-all duration-500 cursor-pointer animate-fade-in-up"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="w-14 h-14 bg-gray-50 text-gray-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-6">
                                    <FaPlay className="ml-0.5 text-xs" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-lg md:text-xl truncate group-hover:text-red-600 transition-colors font-['Mukta',sans-serif]">
                                        {pod.title}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">By {pod.host}</p>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{pod.date}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] px-4 py-2 bg-gray-50 rounded-xl group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                    <FaRegClock size={12} />
                                    {pod.duration}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .py-4.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
                .animate-fade-in-up {
                    opacity: 0;
                    transform: translateY(20px);
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
}
