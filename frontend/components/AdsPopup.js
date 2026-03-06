'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdsPopup() {
    const [ads, setAds] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ads?active=true&position=popup`);
                if (res.data.length > 0) {
                    setAds(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch popup ads', error);
            }
        };

        fetchAds();
    }, []);

    useEffect(() => {
        if (ads.length <= 1 || isClosed) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 5000); 

        return () => clearInterval(interval);
    }, [ads, isClosed]);

    if (ads.length === 0 || isClosed) return null;

    const currentAd = ads[currentIndex];

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="fixed bottom-4 right-4 z-50 shadow-2xl rounded-lg overflow-hidden border border-gray-200 bg-white group"
            >
                <button 
                    onClick={() => setIsClosed(true)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <a href={currentAd.link || '#'} target="_blank" rel="noopener noreferrer" className="block relative">
                    <motion.div whileHover={{ scale: 1.02 }} className="transition-all duration-300">
                        <img 
                            src={currentAd.imageUrl} 
                            alt={currentAd.title} 
                            className="w-64 h-auto object-cover max-h-48"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-white text-xs font-bold truncate tracking-wide">{currentAd.title}</p>
                            <span className="text-[10px] text-white/60 font-medium italic">Sponsored</span>
                        </div>
                    </motion.div>
                </a>
            </motion.div>
        </AnimatePresence>
    );
}
