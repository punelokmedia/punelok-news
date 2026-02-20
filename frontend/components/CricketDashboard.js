'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MatchCard from './MatchCard';
import { FaBaseballBall, FaCalendarAlt, FaHistory } from 'react-icons/fa';

const CricketDashboard = () => {
    const [activeTab, setActiveTab] = useState('live');
    const [liveMatches, setLiveMatches] = useState([]);
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [recentMatches, setRecentMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/cricket/all');
            const data = res?.data || {};
            return {
                live: Array.isArray(data.live) ? data.live : [],
                upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
                recent: Array.isArray(data.recent) ? data.recent : []
            };
        } catch (err) {
            console.error('Cricket API (all):', err?.response?.status || err.message);
            return { live: [], upcoming: [], recent: [] };
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                const { live, upcoming, recent } = await fetchAll();
                setLiveMatches(live);
                setUpcomingMatches(upcoming);
                setRecentMatches(recent);
            } catch (err) {
                setError('Failed to load cricket data');
            } finally {
                setLoading(false);
            }
        };

        loadAllData();

        // Poll every 5 min – 429 avoid karne ke liye backend cache use hota hai
        const interval = setInterval(loadAllData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getActiveData = () => {
        switch(activeTab) {
            case 'live': return liveMatches;
            case 'upcoming': return upcomingMatches;
            case 'recent': return recentMatches;
            default: return [];
        }
    };

    const getEmptyMessage = () => {
        if (activeTab === 'live') return 'No live matches right now.';
        if (activeTab === 'upcoming') return 'No upcoming matches.';
        return 'No results in the last 2 days.';
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[220px] text-gray-500 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="w-10 h-10 border-2 border-[#c40404] border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm font-medium">Loading scores...</p>
                </div>
            );
        }

        const data = getActiveData();

        if (data.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[220px] text-gray-500 bg-gray-50 rounded-2xl border border-gray-200">
                    <p className="text-sm font-medium">{getEmptyMessage()}</p>
                </div>
            );
        }

        return (
            <div className="flex overflow-x-auto gap-4 sm:gap-5 snap-x cricket-cards-scroll-light pb-3 -mx-1 px-1 sm:mx-0 sm:px-0">
                {data.map((match) => (
                    <div key={match.matchId} className="snap-center flex-shrink-0 w-[min(280px,85vw)] sm:w-[300px]">
                        <MatchCard match={match} />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="bg-gradient-to-b from-gray-50 to-white py-8 sm:py-10 relative overflow-hidden border-t border-gray-200">
            {/* Decorative top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c40404] to-transparent opacity-80" />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#c40404] p-2.5 sm:p-3 rounded-xl shadow-lg shadow-red-900/20">
                            <FaBaseballBall className="text-white text-lg sm:text-xl" />
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight uppercase">
                            Cricket <span className="text-[#c40404]">Center</span>
                        </h2>
                    </div>

                    {/* Tabs - responsive pill group */}
                    <div className="flex w-full sm:w-auto bg-white/80 sm:bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setActiveTab('live')}
                            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${activeTab === 'live' ? 'bg-[#c40404] text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/80'}`}
                        >
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${activeTab === 'live' ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
                            Live
                        </button>
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${activeTab === 'upcoming' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/80'}`}
                        >
                            <FaCalendarAlt className="text-xs flex-shrink-0" />
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('recent')}
                            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${activeTab === 'recent' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/80'}`}
                        >
                            <FaHistory className="text-xs flex-shrink-0" />
                            Results
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[240px]">
                    {renderContent()}
                </div>
            </div>
        </section>
    );
};

export default CricketDashboard;
