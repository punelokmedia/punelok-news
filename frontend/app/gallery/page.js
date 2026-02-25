'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaImage, FaCamera, FaChevronRight, FaPlus, FaExpandAlt, FaRegHeart } from 'react-icons/fa';

export default function GalleryPage() {
    const { language } = useLanguage();

    const albums = [
        { id: 1, title: 'Pune Metro Trial Run', count: 12, thumb: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600&fit=crop' },
        { id: 2, title: 'Ganpati Festival Celebrations', count: 45, thumb: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600&fit=crop' },
        { id: 3, title: 'Food Street - Saras Baug', count: 8, thumb: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&fit=crop' },
        { id: 4, title: 'Historical Landmarks of Pune', count: 20, thumb: 'https://images.unsplash.com/photo-1514894630517-27a4fc2cb1dc?q=80&w=600&fit=crop' },
        { id: 5, title: 'Shivaji Road Reconstruction', count: 15, thumb: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=600&fit=crop' },
        { id: 6, title: 'Kothrud Cultural Night', count: 32, thumb: 'https://images.unsplash.com/photo-1514525253361-b83f8r8905c?q=80&w=600&fit=crop' },
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
                                <span className="text-red-600 uppercase">PHOTO GALLERY</span>
                            </div>
                            
                            <div className="flex items-center gap-5">
                                <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.3)]"></div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-['Mukta',sans-serif]">
                                    {language === 'marathi' ? 'फोटो गॅलरी' : 'VISUAL STORIES'}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="bg-white text-gray-900 border border-gray-100 px-5 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center shadow-sm uppercase">
                                <FaCamera className="mr-2 text-red-600" /> CURATED ALBUMS
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Photo Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {albums.map((album, idx) => (
                        <div 
                            key={album.id} 
                            className="group relative flex flex-col bg-white rounded-[40px] overflow-hidden border border-gray-50 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 animate-fade-in-up"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Image Part */}
                            <div className="relative h-80 overflow-hidden">
                                <img 
                                    src={album.thumb} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    alt={album.title}
                                />
                                
                                {/* Photo Count Bubble */}
                                <div className="absolute top-6 left-6 z-20">
                                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black px-4 py-1.5 rounded-full flex items-center shadow-lg uppercase tracking-tighter">
                                        <FaCamera className="mr-2 text-red-500" /> {album.count} {language === 'marathi' ? 'फोटो' : 'Photos'}
                                    </div>
                                </div>

                                {/* Floating Action Buttons */}
                                <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex flex-col gap-2">
                                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-xl hover:bg-red-600 hover:text-white transition-all transform hover:rotate-12">
                                        <FaExpandAlt size={14} />
                                    </button>
                                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-xl hover:bg-red-600 hover:text-white transition-all transform hover:-rotate-12">
                                        <FaRegHeart size={14} />
                                    </button>
                                </div>

                                {/* Bottom Gradient */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
                                
                                <div className="absolute bottom-6 left-6 right-6 z-20">
                                    <span className="text-[10px] font-black tracking-widest text-red-500 uppercase mb-2 block">
                                        EXCLUSIVE GALLERY
                                    </span>
                                    <h2 className="text-xl md:text-2xl font-black text-white leading-tight font-['Mukta',sans-serif]">
                                        {album.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Info Part */}
                            <div className="p-8 group-hover:bg-red-600 transition-colors duration-500">
                                <div className="flex justify-between items-center text-red-600 group-hover:text-white transition-colors duration-500 font-black text-[11px] uppercase tracking-[0.2em]">
                                    <span className="flex items-center">{language === 'marathi' ? 'गॅलरी उघडा' : 'OPEN GALLERY'} <FaPlus className="ml-3 text-[9px]" /></span>
                                    <FaChevronRight className="text-[10px] transform group-hover:translate-x-2 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Styled Load More or Footer */}
                <div className="mt-20 text-center">
                    <button className="inline-flex items-center gap-3 bg-gray-900 text-white font-black px-12 py-5 rounded-3xl hover:bg-red-600 transition-all shadow-xl hover:-translate-y-1">
                        {language === 'marathi' ? 'आणखी अल्बम पाहा' : 'EXPLORE MORE ALBUMS'}
                        <FaChevronRight size={10} className="text-gray-400" />
                    </button>
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
