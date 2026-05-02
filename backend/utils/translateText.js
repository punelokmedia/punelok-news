const axios = require('axios');
const { translate } = require('@vitalets/google-translate-api');

const localeToCode = {
  marathi: 'mr',
  hindi: 'hi',
  english: 'en',
};

/**
 * Translate between Marathi / Hindi / English with multiple backends.
 * Vitalets is often blocked from datacenters; MyMemory + Lingva mirror used as fallbacks.
 */
async function translateText(text, fromLocale, toLocale) {
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (!trimmed) return '';
  if (fromLocale === toLocale) return trimmed;

  const from = localeToCode[fromLocale];
  const to = localeToCode[toLocale];
  if (!from || !to) {
    throw new Error(`translateText: bad locales ${fromLocale} -> ${toLocale}`);
  }

  try {
    const res = await translate(trimmed, { from, to });
    if (res?.text && String(res.text).trim()) {
      return String(res.text).trim();
    }
  } catch (e) {
    console.warn(`[translateText] vitalets ${fromLocale}->${toLocale}:`, e.message);
  }

  try {
    const pair = `${from}|${to}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${pair}`;
    const res = await axios.get(url, { timeout: 25000 });
    const out = res.data?.responseData?.translatedText;
    const st = Number(res.data?.responseStatus);
    if (st === 200 && out && typeof out === 'string') {
      const s = out.trim();
      if (s && !s.includes('MYMEMORY WARNING')) return s;
    }
  } catch (e) {
    console.warn('[translateText] MyMemory:', e.message);
  }

  const lingvaBase = (process.env.LINGVA_URL || 'https://lingva.ml').replace(/\/$/, '');
  try {
    const encoded = encodeURIComponent(trimmed);
    const url = `${lingvaBase}/api/v1/${from}/${to}/${encoded}`;
    const res = await axios.get(url, { timeout: 25000 });
    const out = res.data?.translation;
    if (out && String(out).trim()) return String(out).trim();
  } catch (e) {
    console.warn('[translateText] lingva:', e.message);
  }

  const libre = process.env.LIBRETRANSLATE_URL;
  if (libre) {
    try {
      const res = await axios.post(
        `${libre.replace(/\/$/, '')}/translate`,
        { q: trimmed, source: from, target: to, format: 'text' },
        { timeout: 25000, headers: { 'Content-Type': 'application/json' } }
      );
      const out = res.data?.translatedText;
      if (out && String(out).trim()) return String(out).trim();
    } catch (e) {
      console.warn('[translateText] LibreTranslate:', e.message);
    }
  }

  throw new Error('All translation backends failed');
}

module.exports = { translateText, localeToCode };
