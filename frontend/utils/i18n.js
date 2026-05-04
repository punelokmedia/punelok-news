import { translations } from './translations';

/** Languages exposed in the site header selector (full bundles in translations.js). */
export const APP_LANGUAGE_KEYS = ['marathi', 'hindi', 'english'];

/**
 * Maps UI language codes to translation bundles. Unknown or malformed values fall back to Marathi.
 */
export function normalizeLanguage(code) {
  if (!code || typeof code !== 'string') return 'marathi';
  const key = code.toLowerCase().trim();
  if (key === 'mr') return 'marathi';
  if (key === 'hi') return 'hindi';
  if (key === 'en') return 'english';
  if (APP_LANGUAGE_KEYS.includes(key)) return key;
  return 'marathi';
}

export function getTranslationBundle(language) {
  return translations[normalizeLanguage(language)] || translations.marathi;
}
