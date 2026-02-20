'use client';

import React from 'react';

const MatchCard = ({ match }) => {
    const isLive = match.isLive || /in progress|live/i.test(String(match.state || ''));

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-xl hover:border-[#c40404]/30 transition-all duration-300 h-full flex flex-col relative overflow-hidden group">
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#c40404] to-[#990000] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Live badge */}
            {isLive && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c40404]"></span>
                    </span>
                    <span className="text-[#c40404] text-[10px] font-bold tracking-wider uppercase">LIVE</span>
                </div>
            )}

            {/* Series name */}
            <div className="text-gray-500 text-[11px] sm:text-xs font-medium uppercase tracking-wide mb-3 truncate pr-14">
                {match.seriesName || match.matchType}
            </div>

            {/* Teams – name ke saamne score */}
            <div className="space-y-2.5 mb-3 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs ring-1 ring-gray-200 flex-shrink-0">
                            {match.team1Short ? match.team1Short[0] : 'T1'}
                        </div>
                        <span className="text-gray-800 font-semibold text-sm truncate">{match.team1Short || match.team1}</span>
                    </div>
                    {(match.team1Score || match.team2Score) && (
                        <span className="text-[#c40404] font-bold text-sm tabular-nums flex-shrink-0">{match.team1Score || '–'}</span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs ring-1 ring-gray-200 flex-shrink-0">
                            {match.team2Short ? match.team2Short[0] : 'T2'}
                        </div>
                        <span className="text-gray-800 font-semibold text-sm truncate">{match.team2Short || match.team2}</span>
                    </div>
                    {(match.team1Score || match.team2Score) && (
                        <span className="text-[#c40404] font-bold text-sm tabular-nums flex-shrink-0">{match.team2Score || '–'}</span>
                    )}
                </div>
            </div>

            {/* Status & meta */}
            <div className="pt-3 border-t border-gray-100 mt-auto">
                <p className="text-[#b8860b] font-semibold text-xs sm:text-sm truncate">
                    {match.status}
                </p>
                <p className="text-gray-500 text-[10px] sm:text-xs mt-1">
                    {match.matchType} • {match.startTime}
                </p>
            </div>
        </div>
    );
};

export default MatchCard;
