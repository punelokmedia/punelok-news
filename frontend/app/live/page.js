'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaPlay, FaRegNewspaper, FaClock, FaSignal, FaChevronRight, FaGlobeAmericas, FaWifi } from 'react-icons/fa';

export default function LivePage() {
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
                                <span className="text-red-600 uppercase">LIVE FEED</span>
                            </div>
                            
                            <div className="flex items-center gap-5">
                                <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.3)]"></div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-['Mukta',sans-serif]">
                                    {language === 'marathi' ? 'लाईव्ह न्यूज' : 'LIVE DIGITAL FEED'}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="bg-red-50 text-red-600 px-5 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center shadow-sm uppercase border border-red-100">
                                <FaSignal className="mr-2 animate-pulse" /> CONNECTION STABLE
                            </div>
                        </div>
                    </div>
                </div>

                {/* Highly Professional LIVE Status Section */}
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-[48px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-gray-100 relative group p-2">
                        <div className="bg-gray-900 aspect-video rounded-[42px] relative flex flex-col items-center justify-center text-center p-12 overflow-hidden shadow-inner">
                            
                            {/* Animated Background Scan Elements */}
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan opacity-40"></div>
                            </div>

                            <div className="relative z-10 max-w-2xl">
                                <div className="relative mb-12 flex justify-center">
                                    <div className="w-24 h-24 bg-red-600/20 backdrop-blur-3xl rounded-full flex items-center justify-center animate-pulse border border-red-500/30">
                                        <FaWifi className="text-red-500 text-3xl" />
                                    </div>
                                    <div className="absolute top-0 right-0 w-8 h-8 bg-red-600 rounded-full border-4 border-gray-900 animate-ping"></div>
                                </div>
                                
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight font-['Mukta',sans-serif]">
                                    {language === 'marathi' ? 'लाईव्ह ब्रॉडकास्ट लवकरच' : 'INITIATING LIVE SCAN...'}
                                </h2>
                                
                                <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 leading-relaxed opacity-80">
                                    {language === 'marathi' 
                                        ? 'येथे लवकरच तुम्ही पुणेलोकचे विशेष लाईव्ह प्रक्षेपण पाहू शकाल. ताज्या घडामोडींसाठी सज्ज राहा.' 
                                        : 'Our digital news infrastructure is preparing for the next big broadcast. Stay connected for lightning-fast live updates.'}
                                </p>
                                
                                <div className="flex flex-wrap items-center justify-center gap-6">
                                    <Link href="/live-tv" className="bg-red-600 text-white font-black py-4.5 px-10 rounded-2xl hover:bg-red-700 transition-all shadow-[0_15px_30px_rgba(220,38,38,0.3)] hover:-translate-y-1 active:translate-y-0">
                                        {language === 'marathi' ? 'लाईव्ह टीव्ही पहा' : 'SWITCH TO LIVE TV'}
                                    </Link>
                                    <Link href="/" className="bg-white/10 backdrop-blur-xl text-white border border-white/20 font-black py-4.5 px-10 rounded-2xl hover:bg-white/20 transition-all hover:-translate-y-1">
                                        {language === 'marathi' ? 'होम पेजवर जा' : 'BACK TO NEWS HOME'}
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Decorative World Map Overlay */}
                            <div className="absolute bottom-10 right-10 text-white/5 pointer-events-none">
                                <FaGlobeAmericas size={200} />
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure Status - Professional Micro UI */}
                    <div className="mt-16 text-center">
                        <div className="inline-flex items-center gap-8 bg-white px-10 py-6 rounded-3xl border border-gray-100 shadow-sm shadow-gray-200/50">
                            {[
                                { label: 'SERVERS', status: 'ACTIVE', color: 'text-green-500' },
                                { label: 'LATENCY', status: '12MS', color: 'text-blue-500' },
                                { label: 'UPLINK', status: 'STABLE', color: 'text-orange-500' }
                            ].map((s, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <span className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-1">{s.label}</span>
                                    <span className={`text-xs font-black italic ${s.color}`}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .py-4.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
                @keyframes scan {
                    0% { transform: translateY(0); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: translateY(400px); opacity: 0; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
            `}</style>
        </div>
    );
}
