import { defaultLocale, locales, type Locale } from '@/i18n';

export function safeLocale(value: unknown): Locale {
  return (locales as readonly string[]).includes(value as string) ? (value as Locale) : defaultLocale;
}

/** English has no URL prefix (localePrefix: 'as-needed'). */
export function localePath(locale: string, path: string): string {
  return locale === defaultLocale ? path : `/${locale}${path}`;
}
