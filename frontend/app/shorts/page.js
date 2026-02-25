'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaPlay, FaFire, FaRegEye, FaChevronRight, FaPlus, FaBolt } from 'react-icons/fa';

export default function ShortsPage() {
    const { language } = useLanguage();

    const mockShorts = [
        { id: 1, title: 'Pune Metro New Route Update', views: '20K', thumb: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400&fit=crop' },
        { id: 2, title: 'Shaniwar Wada Night View', views: '15K', thumb: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=400&fit=crop' },
        { id: 3, title: 'Local Food Festival', views: '10K', thumb: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&fit=crop' },
        { id: 4, title: 'Monsoon in Sahyadri', views: '45K', thumb: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=400&fit=crop' },
        { id: 5, title: 'Traffic Update: Expressway', views: '12K', thumb: 'https://images.unsplash.com/photo-1545143333-11943015ba6a?q=80&w=400&fit=crop' },
        { id: 6, title: 'IT Park Developments', views: '8K', thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&fit=crop' },
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
                                <span className="text-red-600 uppercase">{language === 'marathi' ? 'व्हिडिओ शॉर्ट्स' : 'VIDEO SHORTS'}</span>
                            </div>
                            
                            <div className="flex items-center gap-5">
                                <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.3)]"></div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-['Mukta',sans-serif]">
                                    {language === 'marathi' ? 'व्हिडिओ शॉर्ट्स' : 'NEWS SHORTS'}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-5 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center shadow-lg shadow-red-500/20 uppercase">
                                <FaBolt className="mr-2" /> DISCOVER
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shorts Professional Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                    {mockShorts.map((short, idx) => (
                        <div 
                            key={short.id} 
                            className="relative aspect-[9/16] bg-gray-900 rounded-[32px] overflow-hidden shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500 group cursor-pointer border-4 border-white animate-fade-in-up"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Thumbnail Layer */}
                            <img 
                                src={short.thumb} 
                                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-110"
                                alt={short.title}
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80"></div>
                            
                            {/* Content Overlays */}
                            <div className="absolute inset-0 p-5 flex flex-col justify-between z-20">
                                <div className="flex justify-start">
                                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                                         <FaPlus size={10} />
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-white font-bold text-sm md:text-base mb-3 line-clamp-2 leading-tight font-['Mukta',sans-serif] group-hover:underline decoration-red-600 underline-offset-4 decoration-2">
                                        {short.title}
                                    </h3>
                                    <div className="flex items-center justify-between text-[10px] text-gray-300 font-black tracking-widest">
                                        <div className="flex items-center">
                                            <FaRegEye className="mr-1.5 text-white" /> {short.views}
                                        </div>
                                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transform translate-x-10 group-hover:translate-x-0 transition-transform duration-500">
                                            <FaPlay className="ml-1 text-[8px]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 scale-150 group-hover:scale-100 transition-transform duration-500">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-xl">
                                        <FaPlay size={14} className="ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Professional Empty/Coming Soon State */}
                <div className="mt-20">
                    <div className="bg-white rounded-[40px] p-12 text-center border border-gray-50 shadow-inner flex flex-col items-center max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                            <FaBolt size={24} />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
                            {language === 'marathi' ? 'नवीन व्हिडिओ येत आहेत' : 'NEW SHORTS LOADING'}
                        </p>
                        <h4 className="text-gray-900 font-black text-xl mb-4">
                            {language === 'marathi' ? 'लवकरच आणखी व्हिडिओ पाहायला मिळतील' : 'Stay tuned for more premium shorts'}
                        </h4>
                        <div className="flex gap-2">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }}></div>
                            ))}
                        </div>
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
}
