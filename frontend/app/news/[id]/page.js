'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslationBundle } from '../../../utils/i18n';
import Image from 'next/image'; // Added Import
import { FaWhatsapp, FaFacebook, FaTwitter, FaShareAlt, FaClock, FaFire, FaHeart, FaPlay } from 'react-icons/fa';
import HorizontalTicker from '@/components/HorizontalTicker';
import SidebarAds from '@/components/SidebarAds';
import { motion } from 'framer-motion';
import { NewsDetailSkeleton } from '@/components/Skeleton';

export default function NewsDetail() {
    const { id } = useParams();
    const router = useRouter();
    const { language } = useLanguage();
    const [news, setNews] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewCount, setViewCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        if (id) {
            fetchNewsDetails();
            fetchRelatedNews();
        }
    }, [id, language]);

    const fetchNewsDetails = async () => {
        try {
            setLoading(true);
            // 1. Get Details — backend fills missing title/content for selected language
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news/${id}?language=${encodeURIComponent(language)}`
            );
            setNews(response.data);
            setComments(response.data.comments || []);
            setViewCount(response.data.views || 0);
            setLikeCount(response.data.likes || 0);

            // 2. Increment View Count (Background)
            axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news/${id}/view`)
                 .then(res => setViewCount(res.data.views))
                 .catch(err => console.error(err));

        } catch (error) {
            console.error('Error fetching news details:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedNews = async () => {
        try {
            // Fetch all news and filter (ideally backend should support fetching related by category)
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news?language=${encodeURIComponent(language)}&limit=40`
            );
            // Mock related news by excluding current one
            if (response.data && Array.isArray(response.data)) {
                setRelatedNews(response.data.filter(n => n._id !== id).slice(0, 8));
            }
        } catch (error) {
            console.error('Error fetching related news:', error);
        }
    };

    const getLocalizedContent = (item, field) => {
        if (!item) return '';
        // Field itself is string
        if (typeof item[field] === 'string') return item[field];
        
        // Field is object
        if (item[field]) {
            const block = item[field];
            if (block[language]) return block[language];
            if (block.marathi) return block.marathi;
            if (block.hindi) return block.hindi;
            if (block.english) return block.english;
            return Object.values(block)[0] || '';
        }
        return '';
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news/${id}/comment`, {
                content: newComment,
                user: 'Reader' // In a real app, from auth context
            });
            setComments(response.data); // Backend returns updated list
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment');
        }
    };

    const handleLike = async () => {
        if (isLiked || isLiking) return;
        setIsLiking(true);
        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/news/${id}/like`);
            setLikeCount(response.data.likes);
            setIsLiked(true);
        } catch (error) {
            console.error('Error liking news:', error);
        } finally {
            setTimeout(() => setIsLiking(false), 500);
        }
    };

    const handleShare = (platform) => {
        const url = window.location.href;
        const title = getLocalizedContent(news, 'title');
        
        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`, '_blank');
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(url).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            });
        }
    };

    if (loading) {
        return <NewsDetailSkeleton />;
    }

    if (!news) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] pt-20">
                <h2 className="text-2xl font-bold text-gray-700">News not found</h2>
                <button 
                    onClick={() => router.push('/')}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const t = getTranslationBundle(language);
    const localeTag = language === 'english' ? 'en-IN' : language === 'hindi' ? 'hi-IN' : 'mr-IN';
    const categoryFromNews = getLocalizedContent(news, 'category') || (typeof news.category === 'string' ? news.category : '');
    const categoryLabel = categoryFromNews?.trim()
        ? categoryFromNews.trim()
        : language === 'marathi'
          ? 'बातमी'
          : language === 'hindi'
            ? 'ख़बर'
            : 'News';

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-white pb-14 pt-0"
        >
            <HorizontalTicker 
                title={t.nav.latest} 
                items={relatedNews}
                bgColor="bg-[#cc0000]"
                titleColor="bg-[#990000]"
            />
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                
                {/* Breadcrumb */}
                <nav className="flex text-sm text-stone-500 mb-8 overflow-x-auto whitespace-nowrap items-center gap-1.5 sm:gap-2 border-b border-stone-200/80 pb-4">
                   <Link href="/" className="hover:text-[#c40404] font-medium transition-colors shrink-0">
                        {language === 'marathi' ? 'मुखपृष्ठ' : language === 'hindi' ? 'होम' : 'Home'}
                   </Link>
                   <span className="text-stone-300 select-none">/</span>
                   <span className="font-medium text-stone-600 truncate max-w-[28vw] sm:max-w-none">{categoryLabel}</span>
                   <span className="text-stone-300 select-none hidden sm:inline">/</span>
                   <span className="font-semibold text-stone-800 truncate max-w-[140px] sm:max-w-md min-w-0">
                        {getLocalizedContent(news, 'title')}
                   </span>
                </nav>

                <div className="lg:flex lg:gap-12 lg:items-start">
                    {/* Main story — flat article column (no card chrome) */}
                    <main className="mb-10 w-full max-w-full lg:mb-0 lg:w-[70%]">
                        <article className="news-story mx-auto w-full max-w-[42rem] lg:mx-0 lg:max-w-none lg:pr-4">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#c40404]">
                            {categoryLabel}
                        </p>
                        <h1 className="news-story-title mb-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-stone-900 sm:text-3xl lg:text-[2.125rem]">
                            {getLocalizedContent(news, 'title')}
                        </h1>
                        <div className="news-title-rule mb-6" aria-hidden />

                        {/* Byline — single text line */}
                        <p className="mb-6 border-b border-stone-200 pb-5 text-sm leading-relaxed text-stone-700">
                            <span className="font-semibold text-stone-900">Punelok Bureau</span>
                            <span className="mx-2 text-stone-300" aria-hidden>|</span>
                            <FaClock className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom text-stone-400" aria-hidden />
                            {new Date(news.createdAt).toLocaleString(localeTag, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                            <span className="mx-2 text-stone-300" aria-hidden>|</span>
                            <FaFire className="mr-1 inline-block h-3 w-3 align-text-bottom text-[#c40404]" aria-hidden />
                            {viewCount.toLocaleString(localeTag)}{' '}
                            {language === 'english' ? 'views' : 'व्ह्यूज'}
                        </p>

                        {/* Actions: like + share — divider strips only */}
                        <div className="mb-8 flex flex-col gap-4 border-y border-stone-200 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={handleLike}
                                disabled={isLiked || isLiking}
                                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${isLiked ? 'bg-white text-[#c40404] ring-2 ring-red-100' : 'bg-[#c40404] text-white hover:bg-[#a30303] shadow-md'}`}
                            >
                                <FaHeart
                                    className={`h-4 w-4 shrink-0 ${isLiked ? 'animate-heart-pop text-[#c40404]' : 'text-white opacity-95'} ${isLiking ? 'animate-ping' : ''}`}
                                    aria-hidden
                                />
                                <span>{isLiked ? (language === 'english' ? 'Liked' : language === 'hindi' ? 'पसंद किया' : 'आवडले') : (language === 'english' ? 'Like' : language === 'hindi' ? 'पसंद करें' : 'लाइक करा')}</span>
                                <span className={`rounded-md px-2 py-0.5 text-xs ${isLiked ? 'bg-red-50' : 'bg-white/20'}`}>{likeCount.toLocaleString(localeTag)}</span>
                            </button>
                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                <span className="mr-1 hidden text-xs font-semibold uppercase tracking-wide text-stone-500 sm:inline">{language === 'english' ? 'Share' : language === 'hindi' ? 'शेयर' : 'शेअर'}</span>
                                <button type="button" onClick={() => handleShare('whatsapp')} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:scale-105 active:scale-95" title="WhatsApp">
                                    <FaWhatsapp size={18} />
                                </button>
                                <button type="button" onClick={() => handleShare('facebook')} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm transition hover:scale-105 active:scale-95" title="Facebook">
                                    <FaFacebook size={18} />
                                </button>
                                <button type="button" onClick={() => handleShare('twitter')} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DA1F2] text-white shadow-sm transition hover:scale-105 active:scale-95" title="Twitter">
                                    <FaTwitter size={18} />
                                </button>
                                <button type="button" onClick={() => handleShare('copy')} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-stone-700 text-white shadow-sm transition hover:scale-105 active:scale-95" title="Copy link">
                                    <FaShareAlt size={16} />
                                    {copySuccess && (
                                        <span className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[10px] text-white animate-bounce">
                                            {language === 'english' ? 'Copied!' : language === 'hindi' ? 'कॉपी हो गया!' : 'कॉपी केले!'}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Hero image */}
                        <figure className="mb-8 max-w-none sm:mb-10">
                            <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                                <Image
                                    src={news.image || 'https://placehold.co/800x600/png?text=News'}
                                    alt={getLocalizedContent(news, 'title')}
                                    fill
                                    priority
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 70vw"
                                />
                                {news.isLive && (
                                    <div className="absolute left-4 top-4">
                                        <span className="rounded bg-[#c40404] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow animate-pulse">
                                            LIVE
                                        </span>
                                    </div>
                                )}
                            </div>
                            <figcaption className="news-figure-caption px-1 sm:px-0">
                                {language === 'english' ? 'Photo' : language === 'hindi' ? 'फ़ोटो' : 'फोटो'} · {categoryLabel} · Punelok
                            </figcaption>
                        </figure>

                        {/* Article body */}
                        <div className="news-story-body text-left lg:mx-0">
                            {getLocalizedContent(news, 'content').split('\n').map((paragraph, idx) => {
                                if (!paragraph.trim()) return null;
                                const isFirst = idx === 0;
                                const lede =
                                    isFirst && language === 'english'
                                        ? 'news-story-lede news-story-dropcap'
                                        : isFirst
                                          ? 'news-story-lede'
                                          : '';
                                return (
                                    <p key={idx} className={lede}>
                                        {paragraph}
                                    </p>
                                );
                            })}
                        </div>

                        {/* Topics — inline text, no pill cards */}
                        <div className="mt-10 border-t border-stone-200 pt-6">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                                {language === 'english' ? 'Topics' : 'विषय'}
                            </p>
                            <p className="mt-2 text-sm text-stone-700">
                                <span>{news.category || categoryLabel}</span>
                                <span className="mx-2 text-stone-300">·</span>
                                <span>Maharashtra</span>
                                <span className="mx-2 text-stone-300">·</span>
                                <span>Punelok</span>
                            </p>
                        </div>

                        </article>

                        {/* Comments — flat section */}
                        <div className="mx-auto mt-12 max-w-[42rem] border-t border-stone-300 pt-10 lg:mx-0 lg:max-w-none">
                             <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-stone-900">
                                {language === 'english' ? 'Comments' : language === 'hindi' ? 'टिप्पणियाँ' : 'टिप्पण्या'}
                                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-sm font-semibold text-stone-600">{comments.length}</span>
                             </h3>

                             <form onSubmit={handlePostComment} className="mb-8">
                                <textarea
                                    className="w-full resize-none rounded border border-stone-300 bg-white p-4 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#c40404] focus:ring-1 focus:ring-[#c40404]/30"
                                    rows="3"
                                    placeholder={language === 'english' ? 'Write a comment…' : language === 'hindi' ? 'टिप्पणी लिखें…' : 'टिप्पणी लिहा…'}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-[#c40404] px-6 py-2.5 font-semibold text-white transition hover:bg-[#a30303] disabled:opacity-50"
                                        disabled={!newComment.trim()}
                                    >
                                        {language === 'english' ? 'Post comment' : language === 'hindi' ? 'पोस्ट करें' : 'पोस्ट करा'}
                                    </button>
                                </div>
                             </form>

                             <div className="divide-y divide-stone-200">
                                {comments.map((comment, idx) => (
                                    <div key={idx} className="flex gap-4 py-5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-stone-200 text-sm font-bold text-stone-600">
                                            {comment.user.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-stone-900">{comment.user}</span>
                                                <span className="text-xs text-stone-400">{new Date(comment.date).toLocaleDateString(localeTag)}</span>
                                            </div>
                                            <p className="text-sm leading-relaxed text-stone-700">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <p className="py-8 text-center text-sm italic text-stone-500">
                                        {language === 'english' ? 'No comments yet. Start the conversation.' : language === 'hindi' ? 'अभी कोई टिप्पणी नहीं।' : 'अजून टिप्पण्या नाहीत.'}
                                    </p>
                                )}
                             </div>
                        </div>

                    </main>

                    {/* Sidebar (Right Column 30%) - Scrollable */}
                    <aside className="lg:w-[30%] space-y-8 sticky top-32 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <style jsx>{`
                            aside::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                        {/* Ad Unit 1 */}
                        <SidebarAds />

                        {/* Trending / Recommended Widget */}
                        <div className="mt-10 border-t border-stone-300 pt-8">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-2">
                                <h3 className="font-semibold text-gray-900 uppercase text-[14px] tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'ट्रेंडिंग न्यूज' : 'Trending News'}
                                </h3>
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                            </div>
                            <div className="divide-y divide-stone-200">
                                {relatedNews.slice(0, 5).map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/news/${item._id || item.id}`}
                                        prefetch={false}
                                        className="p-3 flex gap-3 hover:bg-red-50 transition-colors group text-inherit no-underline touch-manipulation block active:bg-red-50/90"
                                    >
                                        <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden shrink-0 relative">
                                            <Image 
                                                src={item.image || 'https://placehold.co/100x100/png?text=News'} 
                                                alt={getLocalizedContent(item, 'title')}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                sizes="100px"
                                            />
                                            {idx === 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 skew-x-[-10deg]"></span>}
                                        </div>
                                        <div>
                                            <h4 className="text-[16px] font-normal text-gray-800 line-clamp-2 group-hover:text-red-700 leading-snug mb-1">
                                                {getLocalizedContent(item, 'title')}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">{item.category}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Maharashtra News Widget (Sidebar) */}
                        <div className="mt-10 border-t border-stone-300 pt-8">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-2">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'महाराष्ट्र' : 'Maharashtra'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-stone-200">
                                {relatedNews.slice(2, 7).map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/news/${item._id || item.id}`}
                                        prefetch={false}
                                        className="p-3 flex gap-3 hover:bg-red-50 transition-colors group text-inherit no-underline touch-manipulation block active:bg-red-50/90"
                                    >
                                        <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden shrink-0 relative">
                                            <Image 
                                                src={item.image || 'https://placehold.co/100x100/png?text=News'} 
                                                alt={getLocalizedContent(item, 'title')}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                sizes="100px"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-red-700 leading-snug mb-1">
                                                {getLocalizedContent(item, 'title')}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">Maharashtra</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Sports News Widget (Sidebar) */}
                        <div className="mt-10 border-t border-stone-300 pt-8">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-2">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'क्रीडा' : language === 'hindi' ? 'खेल' : 'Sports'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-stone-200">
                                {relatedNews.slice(0, 5).map((item, idx) => ( // Reusing slice 0-5 for demo as we have strictly limited mock data
                                    <Link
                                        key={idx}
                                        href={`/news/${item._id || item.id}`}
                                        prefetch={false}
                                        className="p-3 flex gap-3 hover:bg-red-50 transition-colors group text-inherit no-underline touch-manipulation block active:bg-red-50/90"
                                    >
                                        <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden shrink-0 relative">
                                            <Image 
                                                src={item.image || 'https://placehold.co/100x100/png?text=News'} 
                                                alt={getLocalizedContent(item, 'title')}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                sizes="100px"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-red-700 leading-snug mb-1">
                                                {getLocalizedContent(item, 'title')}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">Sports</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Jobs News Widget (Sidebar) */}
                        <div className="mt-10 border-t border-stone-300 pt-8">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-2">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'रोजगार' : language === 'hindi' ? 'रोजगार' : 'Jobs'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-stone-200">
                                {relatedNews.slice(1, 6).map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/news/${item._id || item.id}`}
                                        prefetch={false}
                                        className="p-3 flex gap-3 hover:bg-red-50 transition-colors group text-inherit no-underline touch-manipulation block active:bg-red-50/90"
                                    >
                                        <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden shrink-0 relative">
                                            <Image 
                                                src={item.image || 'https://placehold.co/100x100/png?text=News'} 
                                                alt={getLocalizedContent(item, 'title')}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                sizes="100px"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-red-700 leading-snug mb-1">
                                                {getLocalizedContent(item, 'title')}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">Jobs</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Education News Widget (Sidebar) */}
                        <div className="mt-10 border-t border-stone-300 pt-8">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-2">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'शिक्षण' : language === 'hindi' ? 'शिक्षा' : 'Education'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-stone-200">
                                {relatedNews.slice(3, 8).map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/news/${item._id || item.id}`}
                                        prefetch={false}
                                        className="p-3 flex gap-3 hover:bg-red-50 transition-colors group text-inherit no-underline touch-manipulation block active:bg-red-50/90"
                                    >
                                        <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden shrink-0 relative">
                                            <Image 
                                                src={item.image || 'https://placehold.co/100x100/png?text=News'} 
                                                alt={getLocalizedContent(item, 'title')}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                sizes="100px"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-red-700 leading-snug mb-1">
                                                {getLocalizedContent(item, 'title')}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">Education</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Entertainment News Widget (Sidebar) */}
                        <div className="mt-10 border-t border-stone-300 pt-8">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-2">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'मनोरंजन' : language === 'hindi' ? 'मनोरंजन' : 'Entertainment'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-stone-200">
                                {relatedNews.slice(0, 5).map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/news/${item._id || item.id}`}
                                        prefetch={false}
                                        className="p-3 flex gap-3 hover:bg-red-50 transition-colors group text-inherit no-underline touch-manipulation block active:bg-red-50/90"
                                    >
                                        <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden shrink-0 relative">
                                            <Image 
                                                src={item.image || 'https://placehold.co/100x100/png?text=News'} 
                                                alt={getLocalizedContent(item, 'title')}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                sizes="100px"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-red-700 leading-snug mb-1">
                                                {getLocalizedContent(item, 'title')}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">Entertainment</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Crime News Widget (Sidebar) */}
                        <div className="mt-10 border-t border-stone-300 pt-8">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-2">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'गुन्हेगारी' : language === 'hindi' ? 'क्राइम' : 'Crime'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-stone-200">
                                {relatedNews.slice(2, 7).map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/news/${item._id || item.id}`}
                                        prefetch={false}
                                        className="p-3 flex gap-3 hover:bg-red-50 transition-colors group text-inherit no-underline touch-manipulation block active:bg-red-50/90"
                                    >
                                        <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden shrink-0 relative">
                                            <Image 
                                                src={item.image || 'https://placehold.co/100x100/png?text=News'} 
                                                alt={getLocalizedContent(item, 'title')}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                sizes="100px"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-red-700 leading-snug mb-1">
                                                {getLocalizedContent(item, 'title')}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">Crime</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        
                        {/* Ad Unit 2 - Vertical */}
                        <SidebarAds />

                    </aside>
                </div>

                {/* Related — list layout (newspaper style, not card grid) */}
                <section className="mt-14 border-t-2 border-stone-800 pt-8">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
                        <h2 className="text-lg font-bold uppercase tracking-wide text-stone-900 sm:text-xl">
                            {language === 'marathi' ? 'आणखी बातम्या' : language === 'hindi' ? 'और भी पढ़ें' : 'More coverage'}
                        </h2>
                        <Link href="/" className="text-sm font-semibold text-[#c40404] hover:underline">
                            {language === 'english' ? 'Home' : language === 'hindi' ? 'और समाचार' : 'मुखपृष्ठ'}
                        </Link>
                    </div>

                    <ul className="divide-y divide-stone-200">
                        {relatedNews.slice(0, 8).map((item, idx) => (
                            <li key={idx}>
                                <Link
                                    href={`/news/${item._id || item.id}`}
                                    prefetch={false}
                                    className="group flex gap-4 py-4 text-inherit no-underline transition-colors hover:bg-stone-50/80 sm:gap-5 sm:py-5 touch-manipulation active:bg-stone-100/80"
                                >
                                    <div className="relative h-[4.5rem] w-28 shrink-0 overflow-hidden bg-stone-100 sm:h-24 sm:w-36">
                                        <Image
                                            src={item.image || 'https://placehold.co/400x225/png?text=News'}
                                            alt={getLocalizedContent(item, 'title')}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                            sizes="(max-width: 768px) 112px, 144px"
                                        />
                                        {item.videoUrl && (
                                            <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                                                <span className="flex h-9 w-9 items-center justify-center bg-[#c40404] text-white">
                                                    <FaPlay className="ml-0.5 h-3.5 w-3.5" aria-hidden />
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#c40404]">
                                            {item.category || 'News'}
                                            <span className="mx-2 font-normal text-stone-300">·</span>
                                            <span className="font-normal text-stone-500">
                                                {new Date(item.createdAt).toLocaleDateString(localeTag, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </p>
                                        <h3 className="text-base font-semibold leading-snug text-stone-900 group-hover:text-[#c40404] sm:text-[17px]">
                                            {getLocalizedContent(item, 'title')}
                                        </h3>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
                
                {/* Final spacer */}
                <div className="mb-8"></div>

            </div>
        </motion.div>
    );
}
