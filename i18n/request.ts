import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale, LOCALE_COOKIE } from './config';

// next-intl reads the active locale for the current request. Since we don't use
// URL-based routing, we resolve the locale from the NEXT_LOCALE cookie and fall
// back to the default locale (Arabic).
export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
