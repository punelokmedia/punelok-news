'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FaPlay, FaClock, FaChevronRight } from 'react-icons/fa';

export default function CategoryPage() {
    const { slug } = useParams();
    const { language } = useLanguage();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const categoryNames = {
        marathi: {
            maharashtra: 'महाराष्ट्र', politics: 'राजकारण', entertainment: 'मनोरंजन', sports: 'खेळ',
            business: 'बिझनेस', astro: 'भविष्य', lifestyle: 'लाईफस्टाईल', crime: 'गुन्हेगारी',
            jobs: 'रोजगार', education: 'शिक्षण', world: 'आंतरराष्ट्रीय', india: 'भारत',
            'live-tv': 'लाईव्ह टीव्ही', live: 'लाईव्ह', shorts: 'व्हिडिओ शॉर्ट्स', gallery: 'फोटो गॅलरी', podcast: 'पॉडकास्ट'
        },
        english: {
            maharashtra: 'Maharashtra', politics: 'Politics', entertainment: 'Entertainment', sports: 'Sports',
            business: 'Business', astro: 'Astro', lifestyle: 'Lifestyle', crime: 'Crime',
            jobs: 'Jobs', education: 'Education', world: 'World', india: 'India',
            'live-tv': 'Live TV', live: 'LIVE', shorts: 'Video Shorts', gallery: 'Photo Gallery', podcast: 'Podcast'
        }
    };

    const getCategoryDisplayName = () => {
        const lang = language === 'marathi' ? 'marathi' : 'english';
        return categoryNames[lang][slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
    };

    const getLocalized = (item, field) => {
        if (!item[field]) return '';
        if (typeof item[field] === 'string') return item[field];
        return item[field][language] || item[field]['marathi'] || item[field]['english'] || '';
    };

    useEffect(() => {
        const fetchCategoryNews = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/news?category=${slug}&language=${language}`);
                setNews(res.data);
            } catch (error) {
                console.error("Failed to fetch category news", error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchCategoryNews();
    }, [slug, language]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-gray-400 mb-6">
                    <Link href="/" className="hover:text-red-600">HOME</Link>
                    <FaChevronRight size={8} className="opacity-50" />
                    <span className="text-gray-900">{getCategoryDisplayName()}</span>
                </div>

                {/* Section Title */}
                <div className="flex items-center gap-3 mb-10 border-b border-gray-100 pb-6">
                    <div className="w-1.5 h-8 bg-black"></div>
                    <h1 className="text-xl sm:text-[24px] font-semibold text-gray-900 tracking-tight uppercase">
                        {getCategoryDisplayName()}
                    </h1>
                </div>

                {news.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">
                            {language === 'marathi' ? 'लवकरच येत आहे...' : 'Coming Soon...'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {news.map((item) => (
                            <Link href={`/news/${item._id}`} key={item._id} className="group flex flex-col no-underline">
                                {/* Image Container */}
                                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                                    <img 
                                        src={item.image || 'https://placehold.co/600x400/png?text=News'} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        alt={getLocalized(item, 'title')}
                                    />
                                    {/* Play Button Overlay (always visible if video or just for style like screenshot) */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110">
                                            <FaPlay size={14} className="ml-1" />
                                        </div>
                                    </div>
                                </div>

                                {/* Meta Data */}
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-black tracking-widest">
                                    <span className="text-red-600 uppercase">
                                        {slug === 'maharashtra' ? (language === 'marathi' ? 'महाराष्ट्र' : 'MAHARASHTRA') : slug.toUpperCase()}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-400 uppercase">
                                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-[16px] font-normal text-gray-900 leading-[1.3] group-hover:text-red-600 transition-colors line-clamp-2 tracking-tight">
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
