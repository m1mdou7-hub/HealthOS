'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import Logo from '@/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import LanguageSwitcher from '@/components/ui/language-switcher';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const t = useTranslations('Common');
  const tNav = useTranslations('Navigation');

  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight" style={{ color: 'var(--text)' }} aria-label="Logo">
          <Logo />
          <span className="font-display">HealthOS</span>
        </Link>
        <nav className="ml-6 space-x-2 hidden md:block">
          <Link href="/" className={s.link}>
            {tNav('workspacePlatform')}
          </Link>
        </nav>
      </div>
      <div className="flex items-center justify-end gap-4 md:gap-6">
        <LanguageSwitcher compact />
        {user ? (
          <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
            <input type="hidden" name="pathName" value={usePathname()} />
            <button type="submit" className={s.link}>
              {t('signOut')}
            </button>
          </form>
        ) : (
          <Link href="/signin" className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ background: 'var(--gradient)', boxShadow: '0 8px 32px -12px var(--accent-glow)' }}>
            {t('signIn')}
          </Link>
        )}
      </div>
    </div>
  );
}
