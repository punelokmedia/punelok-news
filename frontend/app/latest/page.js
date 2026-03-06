'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaPlay, FaClock, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function LatestNewsPage() {
    const { language } = useLanguage();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const getLocalized = (item, field) => {
        if (!item[field]) return '';
        if (typeof item[field] === 'string') return item[field];
        return item[field][language] || item[field]['marathi'] || item[field]['english'] || '';
    };

    useEffect(() => {
        const fetchLatestNews = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?limit=20&language=${language}`);
                setNews(res.data);
            } catch (error) {
                console.error("Failed to fetch latest news", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLatestNews();
    }, [language]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div>
            </div>
        );
    }

    const title = language === 'marathi' ? 'ताज्या बातम्या' : language === 'hindi' ? 'ताज़ा ख़बर' : 'Latest News';

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4 lg:pl-[140px]">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-gray-400 mb-6">
                    <Link href="/" className="hover:text-red-600">HOME</Link>
                    <FaChevronRight size={8} className="opacity-50" />
                    <span className="text-gray-900">{title}</span>
                </div>

                {/* Section Title */}
                <div className="flex items-center gap-3 mb-10 border-b border-gray-100 pb-6">
                    <div className="w-1.5 h-8 bg-red-600"></div>
                    <h1 className="text-xl sm:text-[24px] font-semibold text-gray-900 tracking-tight uppercase">
                        {title}
                    </h1>
                </div>

                {news.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">
                            {language === 'marathi' ? 'बातम्या उपलब्ध नाहीत' : 'No news available'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {news.map((item) => (
                            <Link href={`/news/${item._id}`} key={item._id} className="group flex flex-col no-underline shadow-sm hover:shadow-md transition-shadow p-3 rounded-2xl border border-gray-50">
                                <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                                    <img 
                                        src={item.image || 'https://placehold.co/600x400/png?text=News'} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        alt={getLocalized(item, 'title')}
                                    />
                                    {item.isLive && (
                                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md animate-pulse">
                                            LIVE
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-2 text-[10px] font-black tracking-widest">
                                    <span className="text-red-600 uppercase">
                                        {item.category || 'LATEST'}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-400 uppercase">
                                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </span>
                                </div>

                                <h3 className="text-[16px] font-semibold text-gray-900 leading-[1.3] group-hover:text-red-600 transition-colors line-clamp-3 tracking-tight h-[64px]">
                                    {getLocalized(item, 'title')}
                                </h3>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
