'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { translations } from '../../../utils/translations';
import Image from 'next/image'; // Added Import
import { FaWhatsapp, FaFacebook, FaTwitter, FaShareAlt, FaClock, FaUser, FaFire } from 'react-icons/fa';
import HorizontalTicker from '@/components/HorizontalTicker';
import SidebarAds from '@/components/SidebarAds';

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
    const [isLiked, setIsLiked] = useState(false); // Local state to prevent multiple likes in one session (simple check)

    useEffect(() => {
        if (id) {
            fetchNewsDetails();
            fetchRelatedNews();
        }
    }, [id]);

    const fetchNewsDetails = async () => {
        try {
            setLoading(true);
            // 1. Get Details
            const response = await axios.get(`http://localhost:5000/api/news/${id}`);
            setNews(response.data);
            setComments(response.data.comments || []);
            setViewCount(response.data.views || 0);
            setLikeCount(response.data.likes || 0);

            // 2. Increment View Count (Background)
            axios.patch(`http://localhost:5000/api/news/${id}/view`)
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
            const response = await axios.get('http://localhost:5000/api/news');
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
            if (item[field][language]) return item[field][language];
            if (item[field]['english']) return item[field]['english'];
            // Fallback to first value
            return Object.values(item[field])[0] || '';
        }
        return '';
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await axios.post(`http://localhost:5000/api/news/${id}/comment`, {
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
        if (isLiked) return;
        try {
            const response = await axios.patch(`http://localhost:5000/api/news/${id}/like`);
            setLikeCount(response.data.likes);
            setIsLiked(true);
        } catch (error) {
            console.error('Error liking news:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
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

    const t = translations[language] || translations['english'];

    return (
        <div className="bg-gray-50 min-h-screen pb-12 pt-0">
            <HorizontalTicker 
                title={language === 'marathi' ? 'ताज्या बातम्या' : 'LATEST NEWS'} 
                items={relatedNews}
                bgColor="bg-[#cc0000]"
                titleColor="bg-[#990000]"
            />
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                
                {/* Breadcrumb */}
                <nav className="flex text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap items-center">
                   <span className="cursor-pointer hover:text-red-600 font-medium transition-colors" onClick={() => router.push('/')}>
                        Home
                   </span>
                   <span className="mx-2 text-gray-400">/</span>
                   <span className="cursor-pointer hover:text-red-600 font-medium transition-colors">
                        {news.category || (language === 'marathi' ? 'ताज्या बातम्या' : 'Latest News')}
                   </span>
                   <span className="mx-2 text-gray-400">/</span>
                   <span className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-md">
                        {getLocalizedContent(news, 'title')}
                   </span>
                </nav>

                <div className="lg:flex lg:gap-8 items-start">
                    {/* Main Content (Left Column 70%) */}
                    <main className="lg:w-[70%] bg-white mb-8 lg:mb-0">
                        {/* Headline */}
                        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold text-gray-900 leading-tight mb-4 text-justify">
                            {getLocalizedContent(news, 'title')}
                        </h1>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                        <FaUser size={12} />
                                    </div>
                                    <span className="font-bold text-gray-900">Punelok Bureau</span>
                                </div>
                                    <span>
                                        {new Date(news.createdAt).toLocaleDateString(undefined, { 
                                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                        })}
                                    </span> 
                                <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                                <div className="flex items-center gap-1.5 text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">
                                    <FaFire />
                                    <span>{viewCount.toLocaleString()} Views</span>
                                </div>
                            </div>
                            
                            {/* Share Buttons */}
                            <div className="flex items-center gap-2">
                                <button className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Share on WhatsApp">
                                    <FaWhatsapp size={16} />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Share on Facebook">
                                    <FaFacebook size={16} />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Share on Twitter">
                                    <FaTwitter size={16} />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors" title="Copy Link">
                                    <FaShareAlt size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Like Button (Floating or separate?) - Let's integrate nicely */}
                        <div className="mb-6 flex items-center gap-4">
                            <button 
                                onClick={handleLike}
                                disabled={isLiked}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${isLiked ? 'bg-red-100 text-red-600 cursor-default' : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'}`}
                            >
                                <span className={isLiked ? "" : "animate-bounce"}>❤️</span>
                                <span>{isLiked ? 'Liked' : 'Like'}</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-sm ml-1">{likeCount.toLocaleString()}</span>
                            </button>
                        </div>

                        {/* Feature Image */}
                        <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-sm group">
                            <Image 
                                src={news.image || 'https://placehold.co/800x600/png?text=News'} 
                                alt={getLocalizedContent(news, 'title')}
                                fill
                                priority
                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                sizes="(max-width: 1024px) 100vw, 70vw"
                            />
                            {news.isLive && (
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded shadow animate-pulse uppercase tracking-wider">
                                        LIVE
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Article Content */}
                        {/* Article Content */}
                        <div className="prose prose-lg prose-red max-w-none text-gray-800 leading-loose text-justify text-base">
                            {/* Simple mapping for paragraphs with advanced formatting */}
                            {getLocalizedContent(news, 'content').split('\n').map((paragraph, idx) => {
                                if (!paragraph.trim()) return null;
                                // Add Drop Cap for the first paragraph
                                const isFirst = idx === 0;
                                return (
                                    <p key={idx} className={`mb-6 font-normal ${isFirst ? 'first-letter:text-5xl first-letter:font-bold first-letter:text-red-600 first-letter:float-left first-letter:mr-3 first-letter:mt-[-6px]' : ''}`}>
                                        {paragraph}
                                    </p>
                                );
                            })}
                        </div>

                        {/* Bottom Tags (Mock) */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                             <div className="flex flex-wrap gap-2">
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors">
                                    #{news.category || 'News'}
                                </span>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors">
                                    #Maharashtra
                                </span>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors">
                                    #LatestUpdates
                                </span>
                             </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-10 pt-8 border-t border-gray-200">
                             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                Comments <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{comments.length}</span>
                             </h3>
                             
                             {/* Comment Form */}
                             <form onSubmit={handlePostComment} className="mb-8">
                                <textarea
                                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
                                    rows="3"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                ></textarea>
                                <div className="mt-2 flex justify-end">
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                        disabled={!newComment.trim()}
                                    >
                                        Post Comment
                                    </button>
                                </div>
                             </form>

                             {/* Comments List */}
                             <div className="space-y-6">
                                {comments.map((comment, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg shrink-0">
                                            {comment.user.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900">{comment.user}</span>
                                                <span className="text-xs text-gray-400">{new Date(comment.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-sm">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <p className="text-gray-500 text-center py-4 italic">No comments yet. Be the first to share your thoughts!</p>
                                )}
                             </div>
                        </div>

                    </main>

                    {/* Sidebar (Right Column 30%) - Scrollable */}
                    <aside className="lg:w-[30%] space-y-8 sticky top-32 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
                        {/* Ad Unit 1 */}
                        <SidebarAds />

                        {/* Trending / Recommended Widget */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 bg-white z-10 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 uppercase text-[14px] tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'ट्रेंडिंग न्यूज' : 'Trending News'}
                                </h3>
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {relatedNews.slice(0, 5).map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="p-3 flex gap-3 hover:bg-red-50 cursor-pointer transition-colors group"
                                        onClick={() => router.push(`/news/${item._id}`)}
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
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Maharashtra News Widget (Sidebar) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 bg-white z-10 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'महाराष्ट्र' : 'Maharashtra'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {relatedNews.slice(2, 7).map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="p-3 flex gap-3 hover:bg-red-50 cursor-pointer transition-colors group"
                                        onClick={() => router.push(`/news/${item._id}`)}
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
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sports News Widget (Sidebar) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 bg-white z-10 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'क्रीडा' : language === 'hindi' ? 'खेल' : 'Sports'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {relatedNews.slice(0, 5).map((item, idx) => ( // Reusing slice 0-5 for demo as we have strictly limited mock data
                                    <div 
                                        key={idx} 
                                        className="p-3 flex gap-3 hover:bg-red-50 cursor-pointer transition-colors group"
                                        onClick={() => router.push(`/news/${item._id}`)}
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
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Jobs News Widget (Sidebar) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 bg-white z-10 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'रोजगार' : language === 'hindi' ? 'रोजगार' : 'Jobs'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {relatedNews.slice(1, 6).map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="p-3 flex gap-3 hover:bg-red-50 cursor-pointer transition-colors group"
                                        onClick={() => router.push(`/news/${item._id}`)}
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
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education News Widget (Sidebar) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 bg-white z-10 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'शिक्षण' : language === 'hindi' ? 'शिक्षा' : 'Education'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {relatedNews.slice(3, 8).map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="p-3 flex gap-3 hover:bg-red-50 cursor-pointer transition-colors group"
                                        onClick={() => router.push(`/news/${item._id}`)}
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
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Entertainment News Widget (Sidebar) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 bg-white z-10 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'मनोरंजन' : language === 'hindi' ? 'मनोरंजन' : 'Entertainment'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {relatedNews.slice(0, 5).map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="p-3 flex gap-3 hover:bg-red-50 cursor-pointer transition-colors group"
                                        onClick={() => router.push(`/news/${item._id}`)}
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
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Crime News Widget (Sidebar) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 bg-white z-10 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide border-l-4 border-red-600 pl-3">
                                    {language === 'marathi' ? 'गुन्हेगारी' : language === 'hindi' ? 'क्राइम' : 'Crime'}
                                </h3>
                                <span className="text-xs text-red-600 font-bold cursor-pointer">View All</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {relatedNews.slice(2, 7).map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="p-3 flex gap-3 hover:bg-red-50 cursor-pointer transition-colors group"
                                        onClick={() => router.push(`/news/${item._id}`)}
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
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Ad Unit 2 - Vertical */}
                        <SidebarAds />

                    </aside>
                </div>

                {/* Bottom Section: Related News Grid (Specific Request "like ABP Majha") */}
                <section className="mt-12 lg:mt-16 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center pl-3 border-l-8 border-red-600">
                            <h2 className="text-xl sm:text-[24px] font-semibold text-gray-800 uppercase tracking-tight">
                                {language === 'marathi' ? 'आणखी बातम्या वाचा' : language === 'hindi' ? 'और भी पढ़ें' : 'Read More News'}
                            </h2>
                        </div>
                        <button className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors uppercase border border-red-200 px-4 py-1.5 rounded-full hover:bg-red-50">
                            View All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                        {relatedNews.slice(0, 8).map((item, idx) => (
                            <div 
                                key={idx} 
                                className="group cursor-pointer flex flex-col h-full"
                                onClick={() => router.push(`/news/${item._id}`)}
                            >
                                <div className="aspect-video relative overflow-hidden rounded-md bg-gray-100 mb-3">
                                    <Image 
                                        src={item.image || 'https://placehold.co/400x225/png?text=News'} 
                                        alt={getLocalizedContent(item, 'title')}
                                        fill
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                    />
                                    {/* Play Icon Overlay if Video - Mock logic */}
                                    {item.videoUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                           <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg pl-1">
                                             <span className="text-xs">▶</span>
                                           </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
                                            {item.category || 'NEWS'}
                                        </span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="font-normal text-gray-900 text-[16px] leading-snug line-clamp-3 mb-2 group-hover:text-red-700 transition-colors">
                                        {getLocalizedContent(item, 'title')}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* Final spacer */}
                <div className="mb-20"></div>

            </div>
        </div>
    );
}
