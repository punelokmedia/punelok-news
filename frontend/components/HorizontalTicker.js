'use client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const HorizontalTicker = ({ title, items, bgColor = "bg-red-600", titleColor = "bg-red-800" }) => {
    const router = useRouter();
    const { language } = useLanguage();

    const getLocalizedContent = (item, field) => {
        if (!item || !item[field]) return '';
        if (typeof item[field] === 'string') return item[field];
        if (typeof item[field] === 'object') {
            return item[field][language] || item[field].english || item[field].marathi || item[field].hindi || '';
        }
        return '';
    };

    if (!items || items.length === 0) return null;

    return (
      <div className={`group w-full ${bgColor} text-white overflow-hidden flex items-center h-10 sm:h-12 border-b border-white/10 relative z-20 shadow-sm`}>
         {/* Skewed Title Label */}
         <div className={`${titleColor} px-4 sm:px-8 h-full flex items-center justify-center font-bold text-xs sm:text-[15px] tracking-[0.15em] shrink-0 z-30 uppercase relative`}>
            {title}
            <span className="w-1.5 h-1.5 bg-white rounded-full ml-3 animate-pulse shadow-[0_0_10px_white]"></span>
            {/* Slanted Edge Effect */}
            <div className={`absolute top-0 right-0 translate-x-1/2 w-5 h-full ${titleColor} skew-x-[-20deg] z-[-1]`}></div>
         </div>
         
         {/* Scrolling Content with Fade Mask - Scrollable on Hover */}
         <div className="flex-1 min-w-0 flex overflow-hidden relative items-center pl-6 mask-marquee-fade">
            {/* The wrapper div needs to be duplicated to create the infinite scroll effect seamlessly */}
            <div className="animate-marquee whitespace-nowrap flex items-center gap-12 will-change-transform">
               {/* Repeat items x4 to ensure enough content for wide screens before loop resets */}
               {[...items, ...items, ...items, ...items].map((item, idx) => (
                  <span 
                    key={idx} 
                    className="flex items-center text-[16px] sm:text-[19px] font-medium tracking-tight whitespace-nowrap hover:text-yellow-300 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                        if (typeof item === 'object') {
                            router.push(`/news/${item._id || item.id}`);
                        }
                    }}
                  >
                     <span className="text-white opacity-50 text-[11px] mx-4">•</span>
                     {typeof item === 'string' ? item : getLocalizedContent(item, 'title')}
                  </span>
               ))}
            </div>
         </div>
      </div>
    );
};

export default HorizontalTicker;
