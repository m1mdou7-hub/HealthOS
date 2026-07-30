// Central i18n configuration for HealthOS.
// The app uses next-intl WITHOUT URL-based routing: the active locale is stored
// in a cookie (and mirrored to localStorage on the client) so we don't need to
// restructure the 26 existing pages under an app/[locale] segment.

export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

// Arabic is the default language for HealthOS.
export const defaultLocale: Locale = 'ar';

// Name of the cookie that persists the user's language preference.
export const LOCALE_COOKIE = 'NEXT_LOCALE';

// Text direction per locale.
export const localeDirection: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr'
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getDirection(locale: string): 'rtl' | 'ltr' {
  return isLocale(locale) ? localeDirection[locale] : localeDirection[defaultLocale];
}
