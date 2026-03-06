'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';

export default function MorePage() {
    const { language } = useLanguage();

    const categories = [
        { id: 'maharashtra', marathi: 'महाराष्ट्र', hindi: 'महाराष्ट्र', english: 'Maharashtra' },
        { id: 'politics', marathi: 'राजकारण', hindi: 'राजनीति', english: 'Politics' },
        { id: 'entertainment', marathi: 'मनोरंजन', hindi: 'मनोरंजन', english: 'Entertainment' },
        { id: 'sports', marathi: 'क्रीडा', hindi: 'खेल', english: 'Sports' },
        { id: 'business', marathi: 'बिझनेस', hindi: 'बिज़नेस', english: 'Business' },
        { id: 'astro', marathi: 'भविष्य', hindi: 'राशिफल', english: 'Astro' },
        { id: 'lifestyle', marathi: 'लाईफस्टाईल', hindi: 'लाइफस्टाइल', english: 'Lifestyle' },
        { id: 'crime', marathi: 'गुन्हेगारी', hindi: 'क्राइम', english: 'Crime' },
        { id: 'jobs', marathi: 'रोजगार', hindi: 'करियर', english: 'Jobs' },
        { id: 'education', marathi: 'शिक्षण', hindi: 'शिक्षा', english: 'Education' }
    ];

    const specials = [
        { id: 'live-tv', marathi: 'लाईव्ह टीव्ही', hindi: 'लाईव्ह टीवी', english: 'Live TV', link: '/live-tv' },
        { id: 'live', marathi: 'लाईव्ह', hindi: 'लाइव', english: 'LIVE', link: '/live' },
        { id: 'shorts', marathi: 'व्हिडिओ शॉर्ट्स', hindi: 'शॉर्ट वीडियो', english: 'Video Shorts', link: '/shorts' },
        { id: 'gallery', marathi: 'फोटो गॅलरी', hindi: 'फोटो गैलरी', english: 'Photo Gallery', link: '/gallery' },
        { id: 'podcast', marathi: 'पॉडकास्ट', hindi: 'पॉडकास्ट', english: 'Podcast', link: '/podcast' }
    ];

    const title = language === 'marathi' ? 'सर्व विभाग' : language === 'hindi' ? 'सभी विभाग' : 'All Categories';

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="container mx-auto px-4 lg:pl-[140px]">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-gray-400 mb-6">
                    <Link href="/" className="hover:text-red-600">HOME</Link>
                    <FaChevronRight size={8} className="opacity-50" />
                    <span className="text-gray-900">{title}</span>
                </div>

                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b-4 border-red-600 inline-block pb-2">{title}</h1>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <Link 
                                key={cat.id} 
                                href={`/category/${cat.id}`}
                                className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-all group"
                            >
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                                    {cat[language] || cat.english}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">News Section</p>
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b-4 border-black inline-block pb-2">
                        {language === 'marathi' ? 'विशेष' : language === 'hindi' ? 'विशेष' : 'Specials'}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {specials.map((sp) => (
                            <Link 
                                key={sp.id} 
                                href={sp.link}
                                className="p-4 bg-black text-white rounded-xl hover:bg-red-600 transition-colors text-center font-bold uppercase text-sm tracking-tighter"
                            >
                                {sp[language] || sp.english}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
