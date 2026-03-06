'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaPlay, FaChevronRight } from 'react-icons/fa';

export default function MaharashtraNewsPage() {
    const { language } = useLanguage();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const getLocalized = (item, field) => {
        if (!item[field]) return '';
        if (typeof item[field] === 'string') return item[field];
        return item[field][language] || item[field]['marathi'] || item[field]['english'] || '';
    };

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?category=maharashtra&language=${language}`);
                setNews(res.data);
            } catch (error) {
                console.error("Failed to fetch maharashtra news", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [language]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div>
            </div>
        );
    }

    const title = language === 'marathi' ? 'महाराष्ट्र' : language === 'hindi' ? 'महाराष्ट्र' : 'Maharashtra';

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4 lg:pl-[140px]">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-gray-400 mb-6">
                    <Link href="/" className="hover:text-red-600">HOME</Link>
                    <FaChevronRight size={8} className="opacity-50" />
                    <span className="text-gray-900">{title}</span>
                </div>

                <div className="flex items-center gap-3 mb-10 border-b border-gray-100 pb-6">
                    <div className="w-1.5 h-8 bg-red-600"></div>
                    <h1 className="text-xl sm:text-[24px] font-semibold text-gray-900 tracking-tight uppercase">
                        {title}
                    </h1>
                </div>

                {news.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">
                            {language === 'marathi' ? 'या श्रेणीत बातम्या उपलब्ध नाहीत' : 'No news in this category'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {news.map((item) => (
                            <Link href={`/news/${item._id}`} key={item._id} className="group flex flex-col no-underline">
                                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                                    <img 
                                        src={item.image || 'https://placehold.co/600x400/png?text=Maharashtra'} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        alt={getLocalized(item, 'title')}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                </div>
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-black tracking-widest text-red-600 uppercase">
                                    {title}
                                </div>
                                <h3 className="text-[16px] font-normal text-gray-900 leading-[1.3] group-hover:text-red-600 transition-colors line-clamp-3">
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
