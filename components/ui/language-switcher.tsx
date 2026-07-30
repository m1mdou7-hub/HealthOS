'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { locales, LOCALE_COOKIE, type Locale } from '@/i18n/config';

const LABELS: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English'
};

// One year in seconds for the persisted cookie.
const ONE_YEAR = 60 * 60 * 24 * 365;

interface LanguageSwitcherProps {
  /** Render a compact icon-only toggle instead of the full segmented control. */
  compact?: boolean;
  className?: string;
}

/**
 * Elegant language switcher for toggling between Arabic and English.
 * Persists the preference to both a cookie (read server-side by next-intl to
 * set the locale and document direction) and localStorage, then refreshes the
 * current route so server components re-render with the new locale.
 */
export default function LanguageSwitcher({
  compact = false,
  className = ''
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const applyLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      // Persist to cookie (source of truth for the server) ...
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      // ... and mirror to localStorage for quick client-side access.
      try {
        window.localStorage.setItem(LOCALE_COOKIE, next);
      } catch {
        /* localStorage may be unavailable (e.g. private mode) */
      }
      startTransition(() => {
        router.refresh();
      });
    },
    [locale, router]
  );

  if (compact) {
    const other: Locale = locale === 'ar' ? 'en' : 'ar';
    return (
      <button
        type="button"
        onClick={() => applyLocale(other)}
        disabled={isPending}
        aria-label={`Switch language to ${LABELS[other]}`}
        title={LABELS[other]}
        className={`flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50 ${className}`}
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        <span>{LABELS[other]}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-1 ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      <Globe className="mx-1.5 h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
      {locales.map((code) => {
        const isActive = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => applyLocale(code)}
            disabled={isPending}
            aria-pressed={isActive}
            className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            {LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
