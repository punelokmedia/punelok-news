'use client';

import { FaArrowUp, FaArrowDown, FaMinus, FaBitcoin, FaImage, FaCoins, FaChartLine } from 'react-icons/fa6';
import { GiGoldBar, GiWeight } from 'react-icons/gi';
import { useLanguage } from '@/context/LanguageContext';
import './MarketTrends.css';

const CategoryIcon = ({ category }) => {
  switch (category) {
    case 'gold': return <GiGoldBar className="text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]" />;
    case 'silver': return <GiWeight className="text-gray-300 drop-shadow-[0_0_12px_rgba(209,213,219,0.7)]" />;
    case 'crypto': return <FaBitcoin className="text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]" />;
    case 'nft': return <FaImage className="text-purple-400 drop-shadow-[0_0_12px_rgba(192,132,252,0.7)]" />;
    case 'stock': return <FaChartLine className="text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.7)]" />;
    default: return <FaChartLine className="text-gray-200" />;
  }
};

const MarketTrends = ({ data }) => {
  const { language } = useLanguage();

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full bg-[#f8f9fa] py-16 my-16 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="border-l-[10px] border-[#FF0100] pl-8">
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-3">
              {language === 'marathi' ? 'बाजार भाव आणि ट्रेंडिंग' : language === 'hindi' ? 'बाजार भाव और ट्रेंडिंग' : 'Market Rates & Trending'}
            </h2>
            <p className="text-gray-500 font-extrabold text-sm uppercase tracking-[0.4em]">
              Premium Financial Analytics
            </p>
          </div>
          <div className="h-[3px] hidden md:block flex-1 bg-gradient-to-r from-gray-200 to-transparent mx-10 mb-5"></div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md border border-gray-100 mb-2">
             <div className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
             </div>
             <span className="text-xs font-black text-gray-800 uppercase tracking-widest">Global Live Market</span>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {data.map((item, idx) => {
            const getBg = (category) => {
              const cat = (category || '').toLowerCase();
              if (cat.includes('gold')) return 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=800&auto=format&fit=crop';
              if (cat.includes('silver')) return 'https://images.unsplash.com/photo-1572948854141-8f5538f9f6e5?q=80&w=800&auto=format&fit=crop';
              if (cat.includes('crypto') || cat.includes('btc')) return 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop';
              if (cat.includes('nft') || cat.includes('image')) return 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop';
              return 'https://images.unsplash.com/photo-1611974714400-983086eb2970?q=80&w=1000&auto=format&fit=crop';
            };
            
            return (
              <div 
                key={item._id || idx} 
                className="market-card-container relative h-[260px] rounded-[24px] overflow-hidden shadow-2xl group"
              >
                {/* Background Image Layer */}
                <img 
                  src={getBg(item.category)} 
                  alt="" 
                  className="market-bg-img absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop';
                  }}
                />
                
                {/* Dynamic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-[1]"></div>
                
                {/* Shine Animation Effect */}
                <div className="market-card-shine"></div>

                {/* Content Layer */}
                <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-[18px] border border-white/20 flex items-center justify-center text-3xl transition-transform group-hover:scale-110 duration-500">
                        <CategoryIcon category={item.category} />
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase backdrop-blur-xl border-2 flex items-center gap-2 ${
                        item.trend === 'up' ? 'bg-green-500/20 text-green-400 border-green-500/30 trend-up-glow' : 
                        item.trend === 'down' ? 'bg-red-500/20 text-red-400 border-red-500/30 trend-down-glow' : 'bg-white/5 text-gray-300 border-white/10'
                      }`}>
                        {item.trend === 'up' && <FaArrowUp size={12} />}
                        {item.trend === 'down' && <FaArrowDown size={12} />}
                        {item.trend === 'neutral' && <FaMinus size={12} />}
                        <span>{item.trend}</span>
                      </div>
                    </div>

                    <h3 className="text-white text-xs font-black uppercase tracking-[0.1em] mb-1 drop-shadow-lg opacity-90 overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.title[language] || item.title.english}
                    </h3>
                    <p className="text-2xl font-black text-white tracking-tight drop-shadow-2xl leading-tight">
                      {item.value[language] || item.value.english}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-5 border-t border-white/10">
                    <div className="flex items-center gap-3">
                       <div className="w-2.5 h-2.5 bg-green-500 rounded-full live-badge-glow"></div>
                       <span className="text-xs text-white/90 font-black uppercase tracking-[0.15em]">Live Market</span>
                    </div>
                    <span className="text-[11px] text-white/40 font-black uppercase tracking-widest">Verified Feed</span>
                  </div>
                </div>

                {/* Floating Branded Watermark */}
                <img 
                  src="/logo.png" 
                  alt="Punelok" 
                  className="watermark-float absolute -right-6 -bottom-6 w-40 opacity-[0.08] grayscale brightness-200 pointer-events-none"
                />
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
            <div className="inline-block p-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full max-w-2xl mb-6"></div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.5em] opacity-60">
              Powered by Punelok Intelligence Network • Real-time Financial Data
            </p>
        </div>
      </div>
    </div>
  );
};

export default MarketTrends;
