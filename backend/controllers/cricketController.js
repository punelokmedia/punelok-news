const axios = require('axios');

// Sirf .env se – apna key backend/.env mein RAPIDAPI_KEY=... daalo
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'cricbuzz-cricket.p.rapidapi.com';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const BATCH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes – sirf iske baad nayi API calls
const RATE_LIMIT_DELAY_MS = 5000; // 5s between each RapidAPI call to avoid 429
const cache = { live: null, upcoming: null, recent: null, all: null, live_raw: null, live_nov1: null, recent_raw: null, upcoming_raw: null };
const cacheTime = { live: 0, upcoming: 0, recent: 0, all: 0, live_raw: 0, live_nov1: 0, recent_raw: 0, upcoming_raw: 0 };
let last429At = 0;
const BACKOFF_AFTER_429_MS = 3 * 60 * 1000; // 3 min no API calls after 429

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const fetchCricket = async (endpoint, pathVariant = 'v1') => {
    if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
        console.warn('Cricket API: RAPIDAPI_KEY missing. Add your key in backend/.env (RAPIDAPI_KEY=...)');
        throw new Error('RAPIDAPI_KEY not set');
    }
    const path = pathVariant === 'v1' ? `matches/v1/${endpoint}` : `matches/${endpoint}`;
    try {
        const response = await axios.get(`https://${RAPIDAPI_HOST}/${path}`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            }
        });
        return response.data;
    } catch (error) {
        const status = error.response?.status;
        const msg = error.message;
        if (status === 429) {
            last429At = Date.now();
            console.error(`Cricket API (429): Too many requests. Backing off for ${BACKOFF_AFTER_429_MS / 60000} min.`);
        } else if (status === 403 || status === 401) console.error(`Cricket API (${status}): Invalid or expired API key. Check RAPIDAPI_KEY in backend/.env`);
        else console.error(`Error fetching ${path} cricket data:`, msg);
        throw error;
    }
};

const getCachedOrFetch = (key, fetchFn) => {
    const now = Date.now();
    if (cache[key] !== null && now - cacheTime[key] < CACHE_TTL_MS) {
        return Promise.resolve(cache[key]);
    }
    return fetchFn().then((data) => {
        cache[key] = data;
        cacheTime[key] = Date.now();
        return data;
    });
};

// Extract all match objects from API response (multiple possible structures)
function extractMatches(data) {
    if (!data || typeof data !== 'object') return [];
    const matches = [];

    const add = (arr) => {
        if (!Array.isArray(arr)) return;
        arr.forEach((m) => {
            if (!m || typeof m !== 'object') return;
            if (m.matchInfo || m.matchId || m.id || (m.teams && m.teams.length) || m.seriesName || m.title) matches.push(m);
        });
    };

    // data.data (e.g. { message, data: { matches: [] } }) or data directly
    const root = data.data !== undefined ? data.data : data;
    if (!root || typeof root !== 'object') return matches;

    if (Array.isArray(root)) {
        add(root);
        return matches;
    }
    if (root.matches) add(root.matches);

    const typeMatches = root.typeMatches || root.typeMatch;
    if (Array.isArray(typeMatches)) {
        typeMatches.forEach((type) => {
            if (type.matches) add(type.matches);
            if (type.seriesAdWrapper && type.seriesAdWrapper.matches) add(type.seriesAdWrapper.matches);
            const seriesMatches = type.seriesMatches || type.seriesMatch;
            if (Array.isArray(seriesMatches)) {
                seriesMatches.forEach((series) => {
                    const wrapper = series.seriesAdWrapper || series;
                    if (wrapper && wrapper.matches) add(wrapper.matches);
                    if (series.matches) add(series.matches);
                });
            }
        });
    }

    return matches;
}

// Transform alternate API format: { id, title, teams: [{ team, run }], overview, timeAndPlace }
function transformMatchAlt(match) {
    const teams = match.teams || [];
    const t1 = teams[0];
    const t2 = teams[1];
    const team1Short = (t1 && (t1.team || t1.teamName)) ? String(t1.team || t1.teamName).trim() : 'T1';
    const team2Short = (t2 && (t2.team || t2.teamName)) ? String(t2.team || t2.teamName).trim() : 'T2';
    const team1Score = t1?.run ? String(t1.run).trim() : '';
    const team2Score = t2?.run ? String(t2.run).trim() : '';
    const scoreText = [team1Short + (team1Score ? ': ' + team1Score : ''), team2Short + (team2Score ? ': ' + team2Score : '')].filter(Boolean).join(' ') || 'Match yet to start';
    const dateStr = [match.timeAndPlace?.date, match.timeAndPlace?.time].filter(Boolean).join(' ') || new Date().toLocaleString();

    return {
        matchId: match.id || match.matchId,
        team1: team1Short,
        team1Short: team1Short,
        team2: team2Short,
        team2Short: team2Short,
        team1Score: team1Score || '',
        team2Score: team2Score || '',
        score: scoreText,
        status: match.overview || '',
        state: 'In Progress',
        matchType: '',
        seriesName: match.title || match.seriesName || '',
        startTime: dateStr,
        startDateMs: Date.now(),
        isLive: true
    };
}

const transformMatchData = (match) => {
    // Alternate format: id, title, teams[], overview (no matchInfo)
    if (!match.matchInfo && (match.id || match.title) && Array.isArray(match.teams)) {
        return transformMatchAlt(match);
    }

    const info = match.matchInfo || {};
    const score = match.matchScore || {};
    const team1 = info.team1 || { teamName: 'TBA' };
    const team2 = info.team2 || { teamName: 'TBA' };

    const team1ScoreStr = score.team1Score?.inngs1 ? `${score.team1Score.inngs1.runs}/${score.team1Score.inngs1.wickets}` : '';
    const team2ScoreStr = score.team2Score?.inngs1 ? `${score.team2Score.inngs1.runs}/${score.team2Score.inngs1.wickets}` : '';
    let scoreText = '';
    if (team1ScoreStr) scoreText += `${team1.teamSName || team1.teamName}: ${team1ScoreStr} `;
    if (team2ScoreStr) scoreText += `${team2.teamSName || team2.teamName}: ${team2ScoreStr}`;
    if (!scoreText) scoreText = 'Match yet to start';

    const startDateMs = parseInt(info.startDate, 10) || 0;
    return {
        matchId: info.matchId || match.matchId || match.id,
        team1: team1.teamName,
        team1Short: team1.teamSName,
        team2: team2.teamName,
        team2Short: team2.teamSName,
        team1Score: team1ScoreStr,
        team2Score: team2ScoreStr,
        score: scoreText,
        status: info.status || match.status || '',
        state: info.state || match.state,
        matchType: info.matchFormat || match.matchType,
        seriesName: info.seriesName || match.seriesName,
        startTime: new Date(startDateMs).toLocaleString(),
        startDateMs,
        isLive: /in progress|live/i.test(String(info.state || match.state || ''))
    };
};

const computeLive = async () => {
    let data = await getCachedOrFetch('live_raw', () => fetchCricket('live'));
    let matches = extractMatches(data);
    if (matches.length === 0) {
        try {
            data = await getCachedOrFetch('live_nov1', () => fetchCricket('live', 'nov1'));
            matches = extractMatches(data);
        } catch (_) {}
    }
    if (matches.length === 0) {
        try {
            data = await getCachedOrFetch('recent_raw', () => fetchCricket('recent'));
            matches = extractMatches(data);
        } catch (_) {}
    }
    const transformed = matches.map((m) => { try { return transformMatchData(m); } catch (_) { return null; } }).filter(Boolean);
    return transformed.map((m) => ({ ...m, isLive: m.isLive !== false }));
};

exports.getLiveMatches = async (req, res) => {
    try {
        const now = Date.now();
        if (cache.live !== null && now - cacheTime.live < CACHE_TTL_MS) {
            return res.json(cache.live);
        }
        const withLive = await computeLive();
        cache.live = withLive;
        cacheTime.live = Date.now();
        return res.json(withLive);
    } catch (error) {
        console.error('Live matches error:', error.message);
        return res.status(200).json([]);
    }
};

exports.getUpcomingMatches = async (req, res) => {
    try {
        const now = Date.now();
        if (cache.upcoming !== null && now - cacheTime.upcoming < CACHE_TTL_MS) {
            return res.json(cache.upcoming);
        }
        const data = await getCachedOrFetch('upcoming_raw', () => fetchCricket('upcoming'));
        const matches = extractMatches(data);
        matches.sort((a, b) => (parseInt(a.matchInfo?.startDate, 10) || 0) - (parseInt(b.matchInfo?.startDate, 10) || 0));
        const transformed = matches.map((m) => { try { return transformMatchData(m); } catch (_) { return null; } }).filter(Boolean).slice(0, 15);
        cache.upcoming = transformed;
        cacheTime.upcoming = Date.now();
        return res.json(transformed);
    } catch (error) {
        console.error('Upcoming matches error:', error.message);
        return res.status(200).json([]);
    }
};

// Debug: see what live API returns (helps fix parsing)
exports.getLiveDebug = async (req, res) => {
    try {
        const data = await fetchCricket('live');
        const matches = extractMatches(data);
        const root = data.data !== undefined ? data.data : data;
        res.json({
            topLevelKeys: Object.keys(data || {}),
            rootKeys: root ? Object.keys(root) : [],
            hasMatches: !!(root && root.matches),
            matchCount: matches.length,
            firstMatchKeys: matches[0] ? Object.keys(matches[0]) : []
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getRecentMatches = async (req, res) => {
    try {
        const now = Date.now();
        if (cache.recent !== null && now - cacheTime.recent < CACHE_TTL_MS) {
            return res.json(cache.recent);
        }
        const data = await getCachedOrFetch('recent_raw', () => fetchCricket('recent'));
        const matches = extractMatches(data);
        const transformed = matches.map((m) => { try { return transformMatchData(m); } catch (_) { return null; } }).filter(Boolean);
        const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
        const lastTwoDaysResults = transformed
            .filter(m => m.state === 'Complete' && (now - (m.startDateMs || 0)) <= twoDaysMs)
            .sort((a, b) => (b.startDateMs || 0) - (a.startDateMs || 0));
        cache.recent = lastTwoDaysResults;
        cacheTime.recent = Date.now();
        return res.json(lastTwoDaysResults);
    } catch (error) {
        console.error('Recent matches error:', error.message);
        return res.status(200).json([]);
    }
};

// Single endpoint: fetches live, upcoming, recent in sequence with delay. Cached 5 min; 429 pe 3 min backoff.
exports.getAll = async (req, res) => {
    const now = Date.now();
    if (cache.all !== null && now - cacheTime.all < BATCH_CACHE_TTL_MS) {
        return res.json(cache.all);
    }
    if (last429At > 0 && now - last429At < BACKOFF_AFTER_429_MS) {
        return res.json({ live: cache.live || [], upcoming: cache.upcoming || [], recent: cache.recent || [] });
    }
    try {
        let live = [];
        let upcoming = [];
        let recent = [];

        try {
            let data = await fetchCricket('live');
            let matches = extractMatches(data);
            if (matches.length === 0) {
                try { data = await fetchCricket('live', 'nov1'); matches = extractMatches(data); } catch (_) {}
            }
            if (matches.length === 0) {
                try { data = await fetchCricket('recent'); matches = extractMatches(data); } catch (_) {}
            }
            live = matches.map((m) => { try { return transformMatchData(m); } catch (_) { return null; } }).filter(Boolean).map((m) => ({ ...m, isLive: m.isLive !== false }));
        } catch (_) {}
        await delay(RATE_LIMIT_DELAY_MS);

        try {
            const data = await fetchCricket('upcoming');
            const matches = extractMatches(data);
            matches.sort((a, b) => (parseInt(a.matchInfo?.startDate, 10) || 0) - (parseInt(b.matchInfo?.startDate, 10) || 0));
            upcoming = matches.map((m) => { try { return transformMatchData(m); } catch (_) { return null; } }).filter(Boolean).slice(0, 15);
        } catch (_) {}
        await delay(RATE_LIMIT_DELAY_MS);

        try {
            const data = await fetchCricket('recent');
            const matches = extractMatches(data);
            const transformed = matches.map((m) => { try { return transformMatchData(m); } catch (_) { return null; } }).filter(Boolean);
            const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
            recent = transformed
                .filter(m => m.state === 'Complete' && (now - (m.startDateMs || 0)) <= twoDaysMs)
                .sort((a, b) => (b.startDateMs || 0) - (a.startDateMs || 0));
        } catch (_) {}

        const payload = { live, upcoming, recent };
        cache.all = payload;
        cache.live = live;
        cache.upcoming = upcoming;
        cache.recent = recent;
        cacheTime.all = cacheTime.live = cacheTime.upcoming = cacheTime.recent = Date.now();
        return res.json(payload);
    } catch (error) {
        console.error('Cricket getAll error:', error.message);
        return res.status(200).json({ live: cache.live || [], upcoming: cache.upcoming || [], recent: cache.recent || [] });
    }
};
