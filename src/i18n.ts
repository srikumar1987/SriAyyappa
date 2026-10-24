export const locales = ['en', 'hi', 'kn', 'ml', 'te', 'ta'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  te: 'తెలుగు',
  ta: 'தமிழ்',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  hi: '🇮🇳',
  kn: '🇮🇳',
  ml: '🇮🇳',
  te: '🇮🇳',
  ta: '🇮🇳',
};
