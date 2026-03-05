'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SidebarAds() {
    const [ads, setAds] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/ads?active=true&position=sidebar');
                if (res.data.length > 0) {
                    setAds(res.data);
                    setIsVisible(true);
                }
            } catch (error) {
                console.error('Failed to fetch sidebar ads', error);
            }
        };

        fetchAds();
    }, []);

    useEffect(() => {
        if (ads.length <= 1) return;

        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % ads.length);
                setIsVisible(true);
            }, 500);
        }, 3000); 

        return () => clearInterval(interval);
    }, [ads]);

    if (ads.length === 0) return null;

    const currentAd = ads[currentIndex];

    return (
        <div className="w-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 relative mb-6">
            <div className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500 tracking-widest text-center py-1 border-b border-gray-100">
                Advertisement
            </div>
            <a href={currentAd.link || '#'} target="_blank" rel="noopener noreferrer" className="block p-2">
                <div 
                    className={`transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'} relative`}
                >
                    <img 
                        src={currentAd.imageUrl} 
                        alt={currentAd.title} 
                        className="w-full h-auto object-contain rounded max-h-[300px]"
                    />
                </div>
            </a>
        </div>
    );
}
